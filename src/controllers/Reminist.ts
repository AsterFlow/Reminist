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

    return root
  }

  add<P extends Paths[number]>(key: Keys[number], path: P, store: Context[P]): void {
    const parts = getParts(path)
    const isStatic = !parts.some(p => p.startsWith(':') || p.startsWith('*') || p.startsWith('['))

    if (isStatic) {
      if (!this.staticRouter[key]) this.staticRouter[key] = new NullProtoObj()
      const newNode = new Node({ name: path, endpoint: true, store });

      (this.staticRouter[key] as unknown as NullProtoObj<Node<Context[P], string, boolean>>)[path] = newNode
      return
    }

    let current = this.getRoot(key)
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i]!
      // Usando 'as any' aqui para simplificar, pois a árvore interna lida com a união.
      let child = current.static[part]

      if (!child) {
        child = current.dynamic ?? undefined

        
        if (child && child.name !== part) {
          const router = []
          for (let index = 0; index < i; index++) {
            router.push(parts[index] ?? '')
          }
          router.push(child.name)

          throw new Error(
            `\x1b[33m[Reminist] There are two conflicting routes: /${parts.join('/')} and /${router.join('/')} use different dynamic parameters.\x1b[0m`
          )
        }
      }

      if (child) {
        current = child
        continue 
      }

      // O tipo do dado armazenado no nó é uma união, o que é esperado internamente.
      const newNode = new Node<Context[Paths[number]], string, boolean>({ name: part, endpoint: false })
      current.addChild(newNode)
      current = newNode
    }

    current.endpoint = true
    current.store = store
  }

  find<P extends Paths[number]>(key: Keys[number], path: P): {
    node: Node<Context[P], string, boolean> | null;
    params: Record<string, string>;
  } {
    const staticNode = this.staticRouter[key]?.[path] as Node<Context[P], string, boolean> | undefined
    if (staticNode) {
      return { node: staticNode, params: {} }
    }

    const parts = getParts(path)
    let current = this.getRoot(key)
    const params: Record<string, string> = {}

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i]!
      
      const staticChild = (current.static as any)[part] // Usando 'as any' para simplificar a indexação interna
      if (staticChild) {
        current = staticChild
        continue
      }

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
        return { node: current as Node<Context[P], string, boolean>, params }
      }

      const optionalCatchAllChild = current.optionalCatchAll
      if (optionalCatchAllChild) {
        params[optionalCatchAllChild.paramName] = parts.slice(i).join('/')
        current = optionalCatchAllChild
        return { node: current as Node<Context[P], string, boolean>, params }
      }
      
      const wildcardChild = current.wildcard
      if (wildcardChild) {
        current = wildcardChild
        params['*'] = parts.slice(i).join('/')
        return { node: current as Node<Context[P], string, boolean>, params }
      }

      return { node: null, params: {} }
    }

    if (current.endpoint) return { node: current as Node<Context[P], string, boolean>, params }

    const optionalChild = current.optionalCatchAll
    if (optionalChild && optionalChild.endpoint) {
      params[optionalChild.paramName] = ''
      return { node: optionalChild as Node<Context[P], string, boolean>, params }
    }

    return { node: null, params: {} }
  }

  has<P extends Paths[number]>(key: Keys[number], path: P): boolean {
    const result = this.find(key, path)
    return result.node !== null && result.node.endpoint
  }

  delete<P extends Paths[number]>(key: Keys[number], path: P): boolean {
    if (this.staticRouter[key]?.[path]) {
      delete this.staticRouter[key]![path]
      return true
    }

    const parts = getParts(path)
    if (parts.length === 0 && path !== '/') return false

    const stack: Node<Context[Paths[number]], string, boolean>[] = [this.getRoot(key)]
    let current = stack[0]!

    for (let i = 0, len = parts.length; i < len; i++) {
      const child = (current.static as any)?.[parts[i]!]
      if (!child) return false

      current = child
      stack.push(current)
    }

    if (!current.endpoint) return false

    current.endpoint = false
    current.store = undefined

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