import type { Node } from '../controllers/Node'

export enum NodeType {
  Static = 0,
  Dynamic = 1,
  CatchAll = 2,
  OptionalCatchAll = 3,
  Wildcard = 4,
}

export type NodeParams<
  Data,
  Path extends string,
  Nodes extends readonly Node<any>[],
  Endpoint extends boolean
> = {
  name: Path
  endpoint: Endpoint,
  store?: Data
  children?: Nodes
}