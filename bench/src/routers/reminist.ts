import { Reminist } from '../../../dist/mjs/index.js';
import { type RouterAdapter, type RouteEntry, HTTP_METHODS } from '../utils/types.js';

export function createReministAdapter(routes: RouteEntry[]): RouterAdapter {
  const router = new Reminist({ keys: HTTP_METHODS });
  for (const [method, path] of routes) {
    router.add(method, path, { handler: () => path });
  }
  return {
    name: 'reminist',
    add: (m, p, s) => router.add(m, p, s),
    find: (m, p) => router.find(m, p),
  };
}
