export const HTTP_METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'] as const;
export type HttpMethod = (typeof HTTP_METHODS)[number];
export type RouteEntry = readonly [HttpMethod, string];

export interface RouterAdapter<T = unknown> {
  readonly name: string;
  add(method: HttpMethod, path: string, store: unknown): void;
  find(method: HttpMethod, path: string): T | null | undefined;
}

export interface BenchResult {
  readonly library: string;
  readonly opsPerSecond: number;
  readonly latencyNs: number;
  readonly rank: number;
}

export interface SuiteReport {
  readonly name: string;
  readonly description: string;
  readonly results: BenchResult[];
}
