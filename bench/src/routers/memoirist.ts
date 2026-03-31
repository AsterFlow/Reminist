import { Memoirist } from 'memoirist';
import type { RouterAdapter, RouteEntry } from '../utils/types.js';

export function createMemoiristAdapter(routes: RouteEntry[]): RouterAdapter {
  const router = new Memoirist();
  for (const [method, path] of routes) {
    router.add(method, path, { handler: () => path });
  }
  return {
    name: 'memoirist',
    add: (m, p, s) => router.add(m, p, s),
    find: (m, p) => router.find(m, p),
  };
}
