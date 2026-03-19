import type { ExtractParams, MatchRoute, ReministOptions, RouteToAutocomplete } from '../types/reminist'
import { NullProtoObj } from '../utils/nullPrototype'
import { CHAR_ASTERISK, CHAR_COLON, CHAR_OPEN_BRACKET, CHAR_SLASH } from '../utils/charCodes'
import { NodeType } from '../types/node'
import { Node } from './Node'

/**
 * Cache for path segments to improve performance during repeated lookups.
 */
const segmentCache = new NullProtoObj() as NullProtoObj<string[]>

/**
 * Splits a path into its constituent segments, handling leading/trailing slashes and caching results.
 * @param path The path string to split.
 * @returns An array of path segments.
 */
function splitPathSegments(path: string): string[] {
  const cached = segmentCache[path]
  if (cached) return cached

  let start = 0
  let end = path.length

  if (path.charCodeAt(0) === CHAR_SLASH) start = 1
  if (end > 1 && path.charCodeAt(end - 1) === CHAR_SLASH) end--

  const segments = path.substring(start, end).split('/')

  if (segments.length === 1 && segments[0] === '') {
    segmentCache[path] = []
    return []
  }

  segmentCache[path] = segments
  return segments
}

/**
 * Determines if a path segment is dynamic based on its leading character.
 * @param segment The segment string to check.
 * @returns True if the segment is dynamic.
 */
function isDynamicSegment(segment: string): boolean {
  const leadingChar = segment.charCodeAt(0)
  return (
    leadingChar === CHAR_COLON ||
    leadingChar === CHAR_ASTERISK ||
    leadingChar === CHAR_OPEN_BRACKET
  )
}

type AnyNode<Data> = Node<Data, any, any>

/**
 * Resolves a dynamic child from a node matching the given segment name.
 * Checks dynamic → catchAll → optionalCatchAll → wildcard, in priority order.
 * 
 * @param node The parent node to check.
 * @param segmentName The name of the segment to match.
 * @returns The matching dynamic child node, if any.
 */
function resolveDynamicChild<Data>(
  node: AnyNode<Data>,
  segmentName: string,
): AnyNode<Data> | undefined {
  const { type } = Node.resolveSegmentType(segmentName)

  switch (type) {
  case NodeType.Dynamic:
    return node.dynamicChild ?? undefined
  case NodeType.CatchAll:
    return node.catchAllChild ?? undefined
  case NodeType.OptionalCatchAll:
    return node.optionalCatchAllChild ?? undefined
  case NodeType.Wildcard:
    return node.wildcardChild ?? undefined
  default:
    return undefined
  }
}

/**
 * Reminist - A high-performance, type-safe router based on a Radix Tree.
 * 
 * Supports static routes, dynamic parameters, catch-all, and wildcards with 
 * full TypeScript inference for parameters and stored data.
 * 
 * @template Context A record mapping path templates to their associated data types.
 * @template Keys A readonly array of keys (e.g., HTTP methods) used to group routes.
 */
export class Reminist<
  const Context extends Record<string, any> = {},
  const Keys extends readonly string[] = readonly string[]
> {
  private keys: Keys = [] as unknown as Keys
  private rootNodes       = new NullProtoObj() as NullProtoObj<Node<Context[keyof Context], string, boolean>>
  private staticNodeIndex = new NullProtoObj() as NullProtoObj<NullProtoObj<Node<Context[keyof Context], string, boolean>>>
  private registeredPaths = new NullProtoObj() as NullProtoObj<NullProtoObj<boolean>>

  /**
   * Initializes a new Reminist router instance.
   * @param options Configuration options including top-level keys.
   */
  constructor(options?: ReministOptions<Keys>) {
    if (options?.keys) this.keys = options.keys

    for (let i = 0, len = this.keys.length; i < len; i++) {
      const method = this.keys[i]!
      this.rootNodes[method]       = new Node({ name: '/', endpoint: false })
      this.staticNodeIndex[method] = new NullProtoObj()
      this.registeredPaths[method] = new NullProtoObj()
    }
  }

  /**
   * Gets or initializes the root node for a specific key.
   * @param key The key (e.g., 'GET') to retrieve the root for.
   * @returns The root Node for the given key.
   */
  getRoot(key: Keys[number]): Node<Context[keyof Context], string, boolean> {
    return this.rootNodes[key] ??= new Node({ name: '/', endpoint: false })
  }

  /**
   * Registers a new route in the router.
   * 
   * @template P The path template string.
   * @template S The type of data to store with this route.
   * @param key The key group for this route (e.g., 'GET').
   * @param path The route path template (e.g., '/users/:id').
   * @param store The data/handler to associate with this route.
   * @returns A new Reminist instance with updated context types.
   */
  add<P extends string, S>(
    key: Keys[number],
    path: P,
    store: S,
  ): Reminist<Context & { [K in P]: S }, Keys> {
    const segments  = splitPathSegments(path)
    const isStatic  = segments.every(segment => !isDynamicSegment(segment))

    if (this.registeredPaths[key]) {
      (this.registeredPaths[key] as any)[path] = true
    }

    if (isStatic) {
      this.staticNodeIndex[key] ??= new NullProtoObj()
      const staticNode = new Node({ name: path, endpoint: true, store });

      (this.staticNodeIndex[key] as unknown as NullProtoObj<Node<S, string, boolean>>)[path] = staticNode
      return this as unknown as Reminist<Context & { [K in P]: S }, Keys>
    }

    let current = this.getRoot(key)

    for (let i = 0, len = segments.length; i < len; i++) {
      const segment = segments[i]!
      let child = current.staticChildren[segment]

      if (!child && isDynamicSegment(segment)) {
        const existingDynamic = resolveDynamicChild(current, segment)

        if (existingDynamic && existingDynamic.name !== segment) {
          const conflictPath = `/${segments.slice(0, i).concat(existingDynamic.name).join('/')}`
          throw new Error(
            `\x1b[33m[Reminist] There are two conflicting routes: /${segments.join('/')} and ${conflictPath} use different dynamic parameters.\x1b[0m`
          )
        }

        child = existingDynamic
      }

      if (child) {
        current = child
        continue
      }

      const newChild = new Node<Context[keyof Context], string, boolean>({
        name: segment,
        endpoint: false,
      })
      current.addChild(newChild)
      current = newChild
    }

    current.endpoint = true
    current.store    = store

    return this as unknown as Reminist<Context & { [K in P]: S }, Keys>
  }

  /**
   * Finds a registered route matching the given path.
   * 
   * @template P The literal path string to search for.
   * @param key The key group to search within (e.g., 'GET').
   * @param path The actual path to match.
   * @returns An object containing the matched node (if any) and extracted parameters.
   */
  find<const P extends RouteToAutocomplete<Extract<keyof Context, string>> | (string & {})>(
    key: Keys[number],
    path: P,
  ): {
    node:   Node<Context[MatchRoute<P extends string ? P : string, Extract<keyof Context, string>>], string, true> | null
    params: ExtractParams<MatchRoute<P extends string ? P : string, Extract<keyof Context, string>>>
  } {
    type Matched      = MatchRoute<P extends string ? P : string, Extract<keyof Context, string>>
    type ResultNode   = Node<Context[Matched], string, true>
    type ResultParams = ExtractParams<Matched>

    const staticHit = this.staticNodeIndex[key]?.[path as string]
    if (staticHit) {
      return { node: staticHit as unknown as ResultNode, params: {} as ResultParams }
    }

    const segments = splitPathSegments(path as string)
    let current    = this.getRoot(key)
    let params: Record<string, string> | undefined = undefined

    for (let i = 0; i < segments.length; i++) {
      const segment     = segments[i]!
      const staticChild = current.staticChildren[segment]

      if (staticChild) {
        current = staticChild
        continue
      }

      if (current.dynamicChildCount === 0) {
        return { node: null, params: (params ?? {}) as ResultParams }
      }

      const { dynamicChild, catchAllChild, optionalCatchAllChild, wildcardChild } = current

      if (dynamicChild) {
        params ??= new NullProtoObj()
        params[dynamicChild.paramName] = segment
        current = dynamicChild
        continue
      }

      if (catchAllChild) {
        params ??= new NullProtoObj()
        params[catchAllChild.paramName] = segments.slice(i).join('/')
        return {
          node:   catchAllChild as unknown as ResultNode,
          params: params as unknown as ResultParams,
        }
      }

      if (optionalCatchAllChild) {
        params ??= new NullProtoObj()
        params[optionalCatchAllChild.paramName] = segments.slice(i).join('/')
        return {
          node:   optionalCatchAllChild as unknown as ResultNode,
          params: params as unknown as ResultParams,
        }
      }

      if (wildcardChild) {
        params ??= new NullProtoObj()
        params['*'] = segments.slice(i).join('/')
        return {
          node:   wildcardChild as unknown as ResultNode,
          params: params as unknown as ResultParams,
        }
      }

      return { node: null, params: (params ?? {}) as ResultParams }
    }

    if (current.endpoint) {
      return {
        node:   current as unknown as ResultNode,
        params: (params ?? {}) as unknown as ResultParams,
      }
    }

    const { optionalCatchAllChild } = current
    if (optionalCatchAllChild?.endpoint) {
      params ??= new NullProtoObj()
      params[optionalCatchAllChild.paramName] = ''
      return {
        node:   optionalCatchAllChild as unknown as ResultNode,
        params: params as unknown as ResultParams,
      }
    }

    return { node: null, params: (params ?? {}) as ResultParams }
  }

  /**
   * Checks if a route exists for the given path.
   * 
   * @param key The key group to check.
   * @param path The path to check for.
   * @returns True if the path is registered.
   */
  has<const P extends RouteToAutocomplete<Extract<keyof Context, string>> | (string & {})>(
    key: Keys[number],
    path: P,
  ): boolean {
    const { node } = this.find(key, path)
    return node !== null && node.endpoint
  }

  /**
   * Deletes a registered route.
   * 
   * @template P The route path to delete.
   * @param key The key group containing the route.
   * @param path The path template to remove.
   * @returns The Reminist instance with updated context types.
   */
  delete<P extends RouteToAutocomplete<Extract<keyof Context, string>> | (string & {})>(
    key: Keys[number],
    path: P,
  ): Reminist<Omit<Context, P extends string ? P : string>, Keys> {
    if (this.registeredPaths[key]) {
      delete (this.registeredPaths[key] as any)[path]
    }

    if (this.staticNodeIndex[key]?.[path]) {
      delete this.staticNodeIndex[key]![path]
      return this as any
    }

    const segments = splitPathSegments(path)
    if (segments.length === 0 && path !== '/') return this as any

    const ancestorStack: AnyNode<Context[keyof Context]>[] = [this.getRoot(key)]
    let current = ancestorStack[0]!

    for (let i = 0, len = segments.length; i < len; i++) {
      const segment = segments[i]!
      const child   =
        current.staticChildren[segment] ??
        (current.dynamicChild?.name          === segment ? current.dynamicChild          : undefined) ??
        (current.catchAllChild?.name         === segment ? current.catchAllChild         : undefined) ??
        (current.optionalCatchAllChild?.name === segment ? current.optionalCatchAllChild : undefined) ??
        (current.wildcardChild?.name         === segment ? current.wildcardChild         : undefined)

      if (!child) return this as any

      current = child
      ancestorStack.push(current)
    }

    if (!current.endpoint) return this as any

    current.endpoint = false
    current.store    = undefined

    for (let i = ancestorStack.length - 1; i > 0; i--) {
      const node   = ancestorStack[i]!
      const parent = ancestorStack[i - 1]!

      if (!node.endpoint && node.childCount === 0) {
        parent.removeChild(node)
      } else {
        break
      }
    }

    return this as any
  }

  /**
   * Retrieves all registered routes for a specific key or all keys.
   * 
   * @param key Optional key to filter routes.
   * @returns If key is provided, an array of routes. Otherwise, a record of all keys and their routes.
   */
  getRoutes<K extends Keys[number]>(key: K): string[]
  getRoutes(): { [K in Keys[number]]: string[] }
  getRoutes<K extends Keys[number]>(
    key?: K,
  ): { [K in Keys[number]]: string[] } | string[] {
    if (key) {
      const paths = this.registeredPaths[key]
      return paths ? Object.keys(paths) : []
    }

    const result = new NullProtoObj() as { [K in Keys[number]]: string[] }
    for (let i = 0, len = this.keys.length; i < len; i++) {
      const method = this.keys[i] as Keys[number]
      const paths  = this.registeredPaths[method]
      result[method] = paths ? Object.keys(paths) : []
    }
    return result
  }
}
