import type { RouteEntry } from './types.js';

export const STATIC_ROUTES: RouteEntry[] = [
  ['GET', '/'],
  ['GET', '/user'],
  ['GET', '/user/comments'],
  ['GET', '/user/avatar'],
  ['GET', '/status'],
  ['GET', '/very/deeply/nested/route/hello/there'],
  ['GET', '/api/v1/products'],
  ['GET', '/api/v1/orders'],
];

export const DYNAMIC_ROUTES: RouteEntry[] = [
  ['GET', '/user/:id'],
  ['GET', '/user/lookup/:username'],
  ['GET', '/event/:id'],
  ['GET', '/event/:id/comments'],
  ['POST', '/event/:id/comment'],
  ['GET', '/dynamic/:param'],
  ['GET', '/static/*'],
];

export const DYNAMIC_TEST_URLS: RouteEntry[] = [
  ['GET', '/user/123'],
  ['GET', '/user/lookup/johndoe'],
  ['GET', '/event/456'],
  ['GET', '/event/456/comments'],
  ['POST', '/event/789/comment'],
  ['GET', '/dynamic/test'],
  ['GET', '/static/css/main.css'],
];

export const MISS_URL: RouteEntry = ['GET', '/not/found/path/that/does/not/exist'];

export const ALL_ROUTES: RouteEntry[] = [...STATIC_ROUTES, ...DYNAMIC_ROUTES];
