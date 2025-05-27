import type { ReministOptions } from '../types/reminist'
import { Node } from './Node'

// Cache de paths processados para evitar split/replace repetidos (Memoização)
const pathCache = new Map<string, string[]>()

function getParts(path: string): string[] {
  const cached = pathCache.get(path)
  if (cached) return cached

  let start = 0
  let end = path.length
  if (path.charCodeAt(0) === 47 /* / */) start = 1
  if (end > 1 && path.charCodeAt(end - 1) === 47 /* / */) end--
    
  const result = path.substring(start, end).split('/')
  if (result.length === 1 && result[0] === '') {
    pathCache.set(path, [])
    return []
  }
  pathCache.set(path, result)
  return result
}

export class Reminist<
  Data,
  const Keys extends readonly string[] = readonly string[]
> {
  private keys: Keys = [] as unknown as Keys
  private routers = new Map<Keys[number], Node<Data>>()

  constructor(options?: ReministOptions<Keys>) {
    if (options?.keys) this.keys = options.keys
    // Loop `for` tradicional é mais rápido que `forEach`
    for (let i = 0, len = this.keys?.length; i < len; i++) {
      const method = this.keys[i]!
      this.routers.set(method, new Node({ name: '/', endpoint: false }))
    }
  }

  getRoot(key: Keys[number]): Node<Data> {
    let root = this.routers.get(key)

    if (!root) {
      root = new Node({ name: '/', endpoint: false })

      this.routers.set(key, new Node({ name: '/', endpoint: false }))
    }

    return  root
  }

  add(key: Keys[number], path: string, store: Data): void {
    const parts = getParts(path)
    let current = this.getRoot(key)
    
    for (let i = 0, len = parts.length; i < len; i++) {
      const part = parts[i]!
      const child = current.findStaticChild(part)

      if (child) {
        current = child
      } else {
        const newNode = new Node<Data>({ name: part, endpoint: false })
        current.addChild(newNode)
        current = newNode
      }
    }

    if (current.endpoint) {
      throw new Error(`Unable to add path '${path}' because a final node already exists`)
    }

    current.store = store
    current.endpoint = true
  }

  find(key: Keys[number], path: string): { node: Node<Data> | null; params: Record<string, string> } {
    const parts = getParts(path)
    let current = this.getRoot(key)
    const params: Record<string, string> = {}
    const partsLen = parts.length

    for (let i = 0; i < partsLen; i++) {
      const part = parts[i]!
      const staticChild = current.findStaticChild(part)

      if (staticChild) {
        current = staticChild
        continue
      }

      // If there are no special children, we can fail fast.
      if (current.nonStaticChildCount === 0) return { node: null, params: {} }
      
      const dynamicChild = current.findDynamicChild()
      if (dynamicChild) {
        params[dynamicChild.paramName] = part
        current = dynamicChild
        continue
      }

      const catchAllChild = current.findCatchAllChild()
      if (catchAllChild) {
        params[catchAllChild.paramName] = parts.slice(i).join('/')
        current = catchAllChild

        return { node: current, params }
      }

      const optionalCatchAllChild = current.findOptionalCatchAllChild()
      if (optionalCatchAllChild) {
        params[optionalCatchAllChild.paramName] = parts.slice(i).join('/')
        current = optionalCatchAllChild

        return { node: current, params }
      }
      
      const wildcardChild = current.findWildcardChild()
      if (wildcardChild) {
        current = wildcardChild
        params['*'] = parts.slice(i).join('/')

        return { node: current, params }
      }
      // If a static child isn't found and no special children match, then it's a failure.
      return { node: null, params: {} }
    }

    if (current.endpoint) return { node: current, params }

    const optionalChild = current.findOptionalCatchAllChild();
    if (optionalChild && optionalChild.endpoint) {
      // The slug is empty, which is valid for an optional catch-all.
      params[optionalChild.paramName] = ''
      return { node: optionalChild, params }
    }

    return { node: null, params: {} }
  }

  has(key: Keys[number], path: string): boolean {
    const result = this.find(key, path)
    return result.node !== null && result.node.endpoint
  }

  delete(key: Keys[number], path: string): boolean {
    const parts = getParts(path)
    if (parts.length === 0 && path !== '/') return false

    const stack: Node<Data>[] = [this.getRoot(key)]
    let current = stack[0]!

    for (let i = 0, len = parts.length; i < len; i++) {
      const child = current.findStaticChild(parts[i]!)
      if (!child) return false

      current = child
      stack.push(current)
    }

    if (!current.endpoint) return false

    current.endpoint = false
    current.store = undefined

    // Poda retroativa
    for (let i = stack.length - 1; i > 0; i--) {
      const node = stack[i]!
      const parent = stack[i - 1]!

      if (!node.endpoint && node.childCount === 0) {
        parent.removeChild(node)
      } else {
        break
      }
    }

    return true
  }

  static create<const T extends readonly string[]>(options: { keys: T }) {
    return {
      withData: <Data>() => new Reminist<Data, T>(options),
    }
  }
}