import type { ReministOptions } from '../types/reminist'
import { NullProtoObj } from '../utils/nullPrototype'
import { Node } from './Node'

// Cache de paths processados para evitar split/replace repetidos (Memoização)
const pathCache = new NullProtoObj() as NullProtoObj<string[]>

function getParts(path: string): string[] {
  const cached = pathCache[path]
  if (cached) return cached

  let start = 0
  let end = path.length
  if (path.charCodeAt(0) === 47 /* / */) start = 1
  if (end > 1 && path.charCodeAt(end - 1) === 47 /* / */) end--
    
  const result = path.substring(start, end).split('/')
  if (result.length === 1 && result[0] === '') {
    pathCache[path] = []
    return []
  }
  pathCache[path] = result
  return result
}

export class Reminist<
  const Paths extends readonly string[] = readonly string[],
  const Context extends { [Path in Paths[number]]: unknown } = { [Path in Paths[number]]: unknown },
  const Keys extends readonly string[] = readonly string[]
> {
  private keys: Keys = [] as unknown as Keys
  private routers = new NullProtoObj() as NullProtoObj<Node<Context[Paths[number]], string, boolean>>
  private staticRouter = new NullProtoObj() as NullProtoObj<NullProtoObj<Node<Context[Paths[number]], string, boolean>>>

  constructor(options?: ReministOptions<Keys>) {
    if (options?.keys) this.keys = options.keys

    for (let i = 0, len = this.keys.length; i < len; i++) {
      const method = this.keys[i]!
      this.routers[method] = new Node({ name: '/', endpoint: false })
      this.staticRouter[method] = new NullProtoObj()
    }
  }

  getRoot(key: Keys[number]): Node<Context[Paths[number]], string, boolean> {
    let root = this.routers[key]

    if (!root) {
      root = new Node({ name: '/', endpoint: false })

      this.routers[key] = new Node({ name: '/', endpoint: false })
    }

    return  root
  }

  add(key: Keys[number], path: Paths[number], store: Context[Paths[number]]): void {
    const parts = getParts(path)
    const isStatic = !parts.some(p => p.startsWith(':') || p.startsWith('*') || p.startsWith('['))

    if (isStatic) {
      if (!this.staticRouter[key]) this.staticRouter[key] = new NullProtoObj()
      const newNode = new Node({ name: path, endpoint: true, store });

      (this.staticRouter[key] as unknown as NullProtoObj<Node<Context[Paths[number]], string, boolean>>)[path] = newNode
      return
    }

    let current = this.getRoot(key)
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i]!
      const child = current.static?.[part]

      if (child) {
        current = child
        continue 
      }

      const newNode = new Node<Context[Paths[number]], string, boolean>({ name: part, endpoint: false })
      current.addChild(newNode)
      current = newNode
    }

    current.endpoint = true
    current.store = store
  }

  find(key: Keys[number], path: Paths[number]): { node: Node<Context[Paths[number]], string, boolean> | null; params: Record<string, string> } {
    const staticNode = this.staticRouter[key]?.[path]
    if (staticNode) {
      return { node: staticNode, params: {} }
    }

    const parts = getParts(path)
    let current = this.getRoot(key)
    const params: Record<string, string> = {}

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i]!
      
      const staticChild = current.static[part]
      if (staticChild) {
        current = staticChild
        continue
      }

      // If there are no special children, we can fail fast.
      if (current.nonStaticChildCount === 0) return { node: null, params: {} }
      
      const dynamicChild = current.dynamic
      if (dynamicChild) {
        params[dynamicChild.paramName] = part
        current = dynamicChild
        continue
      }

      const catchAllChild = current.catchAll
      if (catchAllChild) {
        params[catchAllChild.paramName] = parts.slice(i).join('/')
        current = catchAllChild

        return { node: current, params }
      }

      const optionalCatchAllChild = current.optionalCatchAll
      if (optionalCatchAllChild) {
        params[optionalCatchAllChild.paramName] = parts.slice(i).join('/')
        current = optionalCatchAllChild

        return { node: current, params }
      }
      
      const wildcardChild = current.wildcard
      if (wildcardChild) {
        current = wildcardChild
        params['*'] = parts.slice(i).join('/')

        return { node: current, params }
      }
      // If a static child isn't found and no special children match, then it's a failure.
      return { node: null, params: {} }
    }

    if (current.endpoint) return { node: current, params }

    const optionalChild = current.optionalCatchAll
    if (optionalChild && optionalChild.endpoint) {
      // The slug is empty, which is valid for an optional catch-all.
      params[optionalChild.paramName] = ''
      return { node: optionalChild, params }
    }

    return { node: null, params: {} }
  }

  has(key: Keys[number], path: Paths[number]): boolean {
    const result = this.find(key, path)
    return result.node !== null && result.node.endpoint
  }

  delete(key: Keys[number], path: Paths[number]): boolean {
    if (this.staticRouter[key]?.[path]) {
      delete this.staticRouter[key]![path]
      return true
    }

    const parts = getParts(path)
    if (parts.length === 0 && path !== '/') return false

    const stack: Node<Context[Paths[number]], string, boolean>[] = [this.getRoot(key)]
    let current = stack[0]!

    for (let i = 0, len = parts.length; i < len; i++) {
      const child = current.static?.[parts[i]!]
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
      withData: <const Paths extends readonly string[], Context extends { [Path in Paths[number]]: any } = { [Path in Paths[number]]: any }>() => new Reminist<Paths, Context, T>(options),
    }
  }
}