import { Memoirist } from 'memoirist';
import { Reminist } from 'reminist';
import { addRoute, createRouter, findRoute } from 'rou3';
import { Bench } from 'tinybench';

// --- 0. TYPE DEFINITIONS ---
interface RouteValue {
  handler: () => string;
}

// --- 1. ROUTE DEFINITIONS ---
const staticRoutes = [
  { method: 'GET', url: '/user' },
  { method: 'GET', url: '/user/comments' },
  { method: 'GET', url: '/user/avatar' },
  { method: 'GET', url: '/status' },
  { method: 'GET', url: '/very/deeply/nested/route/hello/there' },
];

const dynamicRoutes = [
  { method: 'GET', url: '/user/lookup/username/:username' },
  { method: 'GET', url: '/user/lookup/email/:address' },
  { method: 'GET', url: '/event/:id' },
  { method: 'GET', url: '/event/:id/comments' },
  { method: 'POST', url: '/event/:id/comment' },
  { method: 'GET', url: '/map/:location/events' },
  { method: 'GET', url: '/static/*' }, // Wildcard route
];

const nonExistentRoute = { method: 'GET', url: '/this/route/is/not/defined' };
const allRoutes = [...staticRoutes, ...dynamicRoutes];

const dynamicTestUrls = dynamicRoutes.map(r => ({
  ...r,
  testUrl: r.url
    .replace(/:[a-zA-Z]+/g, 'param-value')
    .replace(/\*$/, 'wildcard/path/file.js'),
}));

// --- 2. HELPER FUNCTIONS ---
const populateMemoirist = (router: Memoirist<RouteValue>) => {
  for (const r of allRoutes) {
    router.add(r.method, r.url, { handler: () => r.url });
  }
};

const populateReminist = (router: Reminist<RouteValue>) => {
  for (const r of allRoutes) {
    router.add(r.method, r.url, { handler: () => r.url });
  }
};

const populateRou3 = (router: ReturnType<typeof createRouter>) => {
  for (const r of allRoutes) {
    addRoute(router, r.method, r.url, { handler: () => r.url });
  }
};

let reministRouter: Reminist<RouteValue>;
let memoiristRouter: Memoirist<RouteValue>;
let rou3Router: ReturnType<typeof createRouter>;

// Setup functions
const setupReminist = () => { reministRouter = new Reminist<RouteValue>(); populateReminist(reministRouter); };
const setupMemoirist = () => { memoiristRouter = new Memoirist<RouteValue>(); populateMemoirist(memoiristRouter); };
const setupRou3 = () => { rou3Router = createRouter(); populateRou3(rou3Router); };

// --- 3. BENCHMARK SUITES ---
const runSuite = async (title: string, define: (bench: Bench) => void) => {
  const bench = new Bench({ time: 1000, iterations: 1000 });
  define(bench);
  await bench.run();
  console.log(title);
  console.table(bench.table());
};

const main = async () => {
  console.log('🏁 Starting Comparative Benchmarks: Reminist vs Memoirist vs Rou3 🏁\n');

  // Suite 0: Addition
  await runSuite('--- 0. Route Addition Test ---', bench => {
    bench
      .add('Reminist: Add All Routes', () => { populateReminist(new Reminist<RouteValue>()); })
      .add('Memoirist: Add All Routes', () => { populateMemoirist(new Memoirist<RouteValue>()); })
      .add('Rou3: Add All Routes', () => { populateRou3(createRouter()); });
  });

  // Suite 1: Static Find
  await runSuite('\n--- 1. Find Test (Static) ---', bench => {
    bench
      .add('Reminist: Find Static', () => { for (const r of staticRoutes) reministRouter.find(r.method, r.url); }, { beforeAll: setupReminist })
      .add('Memoirist: Find Static', () => { for (const r of staticRoutes) memoiristRouter.find(r.method, r.url); }, { beforeAll: setupMemoirist })
      .add('Rou3: Find Static', () => { for (const r of staticRoutes) findRoute(rou3Router, r.method, r.url); }, { beforeAll: setupRou3 });
  });

  // Suite 2: Dynamic & Wildcard Find
  await runSuite('\n--- 2. Find Test (Dynamic & Wildcard) ---', bench => {
    bench
      .add('Reminist: Find Dynamic/Wildcard', () => { for (const r of dynamicTestUrls) reministRouter.find(r.method, r.testUrl); }, { beforeAll: setupReminist })
      .add('Memoirist: Find Dynamic/Wildcard', () => { for (const r of dynamicTestUrls) memoiristRouter.find(r.method, r.testUrl); }, { beforeAll: setupMemoirist })
      .add('Rou3: Find Dynamic/Wildcard', () => { for (const r of dynamicTestUrls) findRoute(rou3Router, r.method, r.testUrl); }, { beforeAll: setupRou3 });
  });

  // Suite 3: Non-Existent Find
  await runSuite('\n--- 3. Find Test (Non-Existent) ---', bench => {
    bench
      .add('Reminist: Find Missing', () => { reministRouter.find(nonExistentRoute.method, nonExistentRoute.url); }, { beforeAll: setupReminist })
      .add('Memoirist: Find Missing', () => { memoiristRouter.find(nonExistentRoute.method, nonExistentRoute.url); }, { beforeAll: setupMemoirist })
      .add('Rou3: Find Missing', () => { findRoute(rou3Router, nonExistentRoute.method, nonExistentRoute.url); }, { beforeAll: setupRou3 });
  });

  console.log('\n🏁 Benchmarks Complete 🏁');
};

main().catch(err => { console.error(err); process.exit(1); });