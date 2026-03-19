/**
 * Enum representing the different types of routing nodes.
 */
export enum NodeType {
  /** A literal path segment (e.g., 'users') */
  Static = 0,
  /** A dynamic segment with a parameter (e.g., ':id' or '[id]') */
  Dynamic = 1,
  /** A catch-all segment that matches multiple levels (e.g., '[...slug]') */
  CatchAll = 2,
  /** An optional catch-all segment (e.g., '[[...slug]]') */
  OptionalCatchAll = 3,
  /** A wildcard segment (e.g., '*') */
  Wildcard = 4,
}

/**
 * Parameters for initializing a Node.
 * 
 * @template Data The type of data stored in the node.
 * @template Endpoint Whether this node represents a terminal route.
 * @template Path The string literal type of the path segment.
 */
export type NodeParams<
  Data,
  Endpoint extends boolean,
  Path extends string,
> = {
  name: Path
} & (Endpoint extends true
  ? { endpoint: true; store: Data }
  : { endpoint: false; store?: never }
)
