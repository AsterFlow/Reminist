import { addRoute, createRouter, findRoute } from 'rou3';
import type { RouterAdapter, RouteEntry } from '../utils/types.js';

export function createRou3Adapter(routes: RouteEntry[]): RouterAdapter {
  const router = createRouter();
  for (const [method, path] of routes) {
    addRoute(router, method, path, { handler: () => path });
  }
  return {
    name: 'rou3',
    add: (m, p, s) => addRoute(router, m, p, s),
    find: (m, p) => findRoute(router, m, p),
  };
}
