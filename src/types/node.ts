export enum NodeType {
  Static = 0,
  Dynamic = 1,
  CatchAll = 2,
  OptionalCatchAll = 3,
  Wildcard = 4,
}

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