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
  private keys: Keys
  private routers = new Map<Keys[number], Node<Data>>()

  constructor(options: ReministOptions<Keys>) {
    this.keys = options.keys
    // Loop `for` tradicional é mais rápido que `forEach`
    for (let i = 0, len = this.keys.length; i < len; i++) {
      const method = this.keys[i]!
      this.routers.set(method, new Node({ name: '/', endpoint: false }))
    }
  }

  getRoot(key: Keys[number]): Node<Data> {
    return this.routers.get(key)!
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
      
      return { node: null, params: {} }
    }

    // Se o loop terminou mas o nó não é um endpoint (ex: /users),
    // ele pode ter um "optional catch-all" (ex: /users/[[...files]])
    if (!current.endpoint) {
      const optionalChild = current.findOptionalCatchAllChild()
      if (optionalChild && optionalChild.endpoint) {
        params[optionalChild.paramName] = ''
        return { node: optionalChild, params }
      }
      return { node: null, params: {} }
    }

    return { node: current, params }
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