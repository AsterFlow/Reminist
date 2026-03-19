/**
 * Options for configuring the Reminist router instance.
 * @template Keys A readonly array of string keys (e.g., HTTP methods).
 */
export type ReministOptions<Keys extends readonly string[]> = {
  keys: Keys
}

/**
 * Transforms a route template into its matching type.
 * @template T The route template string.
 */
export type RouteToType<T extends string> = T extends `${infer Start}:${string}/${infer Rest}`
  ? `${Start}${string}/${RouteToType<Rest>}`
  : T extends `${infer Start}:${string}`
  ? `${Start}${string}`
  : T extends `${infer Start}[[...${string}]]`
  ? `${Start}${string}` | Start | (Start extends `${infer S}/` ? S : never)
  : T extends `${infer Start}[...${string}]`
  ? Start extends `${string}[` ? never : `${Start}${string}`
  : T extends `${infer Start}*`
  ? `${Start}${string}`
  : T;

/**
 * Transforms a route template into an autocomplete-friendly string.
 * @template T The route template string.
 */
export type RouteToAutocomplete<T extends string> = T extends `${infer Start}:${infer Param}/${infer Rest}`
  ? `${Start}<${Param}>/${RouteToAutocomplete<Rest>}`
  : T extends `${infer Start}:${infer Param}`
  ? `${Start}<${Param}>`
  : T extends `${infer Start}[[...${infer Param}]]`
  ? `${Start}<[[...${Param}]]>`
  : T extends `${infer Start}[...${infer Param}]`
  ? Start extends `${string}[` ? never : `${Start}<...${Param}>`
  : T extends `${infer Start}*`
  ? `${Start}<*>`
  : T;

/**
 * Matches a provided path against a set of registered routes.
 * @template P The path to match.
 * @template R The registered route template.
 */
export type MatchRoute<P extends string, R extends string> = 
  [R] extends [never]
    ? never
    : R extends any
      ? P extends RouteToType<R> ? R : never
      : never;

/**
 * Extracts parameter types from a route template.
 * @template T The route template string.
 */
export type ExtractParams<T extends string> = 
  [T] extends [never]
    ? Record<string, string>
    : T extends `${string}:${infer Param}/${infer Rest}`
    ? { [K in Param]: string } & ExtractParams<Rest>
    : T extends `${string}:${infer Param}`
    ? { [K in Param]: string }
    : T extends `${string}[[...${infer Param}]]`
    ? { [K in Param]: string }
    : T extends `${infer Start}[...${infer Param}]`
    ? Start extends `${string}[` ? never : { [K in Param]: string }
    : T extends `${string}*`
    ? { '*': string }
    : Record<string, string>;
