import { RadixTree } from 'radix-way';
import type { RouterAdapter, RouteEntry } from '../utils/types.js';

export function createRadixWayAdapter(routes: RouteEntry[]): RouterAdapter {
  const router = new RadixTree();
  for (const [method, path] of routes) {
    router.insert(method, path, { handler: () => path });
  }
  return {
    name: 'radix-way',
    add: (m, p, s) => router.insert(m, p, s as any),
    find: (m, p) => router.match(m, p),
  };
}
