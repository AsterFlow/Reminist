import { NullProtoObj } from '../utils/nullPrototype'
import { CHAR_ASTERISK, CHAR_COLON, CHAR_DOT, CHAR_OPEN_BRACKET } from '../utils/charCodes'
import type { NodeParams } from '../types/node'
import { NodeType } from '../types/node'

/**
 * Represents a single node in the routing tree.
 * 
 * @template Data The type of data associated with this node (e.g., a handler).
 * @template Path The string literal representing the segment name.
 * @template Endpoint Whether this node is a final route segment.
 */
export class Node<
  Data,
  Path extends string,
  Endpoint extends boolean,
> {
  /** The name of this path segment */
  name: string
  /** The data stored in this node if it's an endpoint */
  store: Endpoint extends true ? Data : unknown
  /** Indicates if this node marks the end of a valid route */
  endpoint: Endpoint
  /** The classification of this node (Static, Dynamic, CatchAll, etc.) */
  type: NodeType
  /** The name of the parameter extracted from this segment, if any */
  paramName: string

  /** Direct child nodes with static names */
  public staticChildren: NullProtoObj<Node<Data, any, any>> = new NullProtoObj()
  /** Child node for simple dynamic segments (e.g., ':id') */
  public dynamicChild: Node<Data, any, any> | null = null
  /** Child node for catch-all segments (e.g., '[...slug]') */
  public catchAllChild: Node<Data, any, any> | null = null
  /** Child node for optional catch-all segments (e.g., '[[...slug]]') */
  public optionalCatchAllChild: Node<Data, any, any> | null = null
  /** Child node for wildcard segments (e.g., '*') */
  public wildcardChild: Node<Data, any, any> | null = null

  /** Total number of direct children */
  public childCount = 0
  /** Number of non-static children */
  public dynamicChildCount = 0

  /**
   * Creates a new Node instance.
   * @param params Initialization parameters including name and endpoint status.
   */
  constructor(params: NodeParams<Data, Endpoint, Path>) {
    this.name     = params.name
    this.endpoint = params.endpoint as Endpoint
    this.store    = (params as any).store

    const { type, paramName } = Node.resolveSegmentType(this.name)
    this.type      = type
    this.paramName = paramName
  }

  /**
   * Derives the NodeType and extracted parameter name from a raw path segment.
   *
   * Supported segment syntaxes:
   * - `:id`       → Dynamic (paramName: 'id')
   * - `*`         → Wildcard (paramName: '*')
   * - `[id]`      → Dynamic (paramName: 'id')
   * - `[...id]`   → CatchAll (paramName: 'id')
   * - `[[...id]]` → OptionalCatchAll (paramName: 'id')
   * - Otherwise   → Static (paramName: '')
   * 
   * @param segment The raw segment string to analyze.
   * @returns An object containing the derived type and parameter name.
   */
  public static resolveSegmentType(
    segment: string,
  ): { type: NodeType; paramName: string } {
    const leadingCharCode = segment.charCodeAt(0)

    if (leadingCharCode === CHAR_COLON) {
      return {
        type: NodeType.Dynamic,
        paramName: segment.substring(1),
      }
    }

    if (leadingCharCode === CHAR_ASTERISK) {
      return {
        type: NodeType.Wildcard,
        paramName: '*',
      }
    }

    if (leadingCharCode === CHAR_OPEN_BRACKET) {
      const secondCharCode = segment.charCodeAt(1)

      if (secondCharCode === CHAR_OPEN_BRACKET) {
        // [[...id]]  →  strip leading '[[...' (5 chars) and trailing ']]' (2 chars)
        return {
          type: NodeType.OptionalCatchAll,
          paramName: segment.substring(5, segment.length - 2),
        }
      }

      if (secondCharCode === CHAR_DOT) {
        // [...id]  →  strip leading '[...' (4 chars) and trailing ']' (1 char)
        return {
          type: NodeType.CatchAll,
          paramName: segment.substring(4, segment.length - 1),
        }
      }

      // [id]  →  strip leading '[' (1 char) and trailing ']' (1 char)
      return {
        type: NodeType.Dynamic,
        paramName: segment.substring(1, segment.length - 1),
      }
    }

    return {
      type: NodeType.Static,
      paramName: '',
    }
  }

  /**
   * Adds a child node to this node.
   * @param child The node to add as a child.
   */
  addChild(child: Node<Data, string, boolean>): void {
    this.childCount++
    if (child.type !== NodeType.Static) this.dynamicChildCount++

    switch (child.type) {
    case NodeType.Static:
      this.staticChildren[child.name] = child
      break
    case NodeType.Dynamic:
      this.dynamicChild = child
      break
    case NodeType.CatchAll:
      this.catchAllChild = child
      break
    case NodeType.OptionalCatchAll:
      this.optionalCatchAllChild = child
      break
    case NodeType.Wildcard:
      this.wildcardChild = child
      break
    }
  }

  /**
   * Removes a child node from this node.
   * @param child The node to remove.
   */
  removeChild(child: Node<Data, any, any>): void {
    this.childCount--
    if (child.type !== NodeType.Static) this.dynamicChildCount--

    switch (child.type) {
    case NodeType.Static:
      if (this.staticChildren) delete this.staticChildren[child.name]
      break
    case NodeType.Dynamic:
      this.dynamicChild = null
      break
    case NodeType.CatchAll:
      this.catchAllChild = null
      break
    case NodeType.OptionalCatchAll:
      this.optionalCatchAllChild = null
      break
    case NodeType.Wildcard:
      this.wildcardChild = null
      break
    }
  }
}
