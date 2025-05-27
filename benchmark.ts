import { Bench } from 'tinybench';
import { Memoirist } from 'memoirist';
import { Reminist } from 'reminist';

// --- 0. TYPE DEFINITIONS ---
// Define a common type for the value stored in the router (handler object).
interface RouteValue {
  handler: () => string;
}

// --- 1. ROUTE DEFINITIONS ---
// Centralized route definitions for clarity and easy modification.

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

const nonExistentRoute = {
  method: 'GET',
  url: '/this/route/is/not/defined',
};

const allRoutes = [...staticRoutes, ...dynamicRoutes];

// Pre-generate URLs for dynamic route tests to avoid string manipulation within benchmark loops.
const dynamicTestUrls = dynamicRoutes.map(route => ({
  ...route,
  testUrl: route.url
    .replace(/:[a-zA-Z]+/g, 'param-value') // Replace params like :username with a static value
    .replace(/\*$/, 'wildcard/path/file.js'), // Replace trailing wildcard with a static path
}));


// --- 2. BENCHMARK HELPER FUNCTIONS ---

/**
 * Populates a router instance with a list of routes.
 * Each route is added with a lightweight handler.
 * @param {Reminist<RouteValue> | Memoirist<RouteValue>} router - The router instance.
 * @param {Array<{method: string, url: string}>} routes - The list of routes to add.
 */
const populateRouter = (
  router: Reminist<RouteValue> | Memoirist<RouteValue>,
  routes: Array<{ method: string; url: string }>
) => {
  for (const route of routes) {
    // The handler returns the route's URL. This is a simple, consistent payload.
    router.add(route.method, route.url, { handler: () => route.url });
  }
};

/**
 * Utility function to create, configure, run, and report a benchmark suite.
 * @param {string} title - The title for this benchmark suite.
 * @param {(bench: Bench<Record<string, any>>) => void} defineTasks - Callback to add tasks to the Bench instance.
 */
const runBenchmarkSuite = async (title: string, defineTasks: (bench: Bench) => void) => {
  // Each suite uses its own Bench instance to keep results separate and clear.
  // Time option sets the minimum time (in ms) to run the benchmark task.
  const bench = new Bench({ time: 1000, iterations: 1000 });

  defineTasks(bench);

  await bench.run();
  console.log(title); // Log title before table for better readability
  console.table(bench.table());
};

// --- 3. MAIN BENCHMARK EXECUTION ---
// Orchestrates the execution of all benchmark suites sequentially.

const main = async () => {
  console.log('🏁 Starting Comparative Benchmarks: Reminist vs. Memoirist 🏁\n');

  // Suite 0: Route Addition Performance
  // Measures the time taken to instantiate a router and add all defined routes.
  await runBenchmarkSuite('--- 0. Route Addition Test (Instantiation & Population) ---', (bench) => {
    bench
      .add('Reminist: Add All Routes', () => {
        const r = new Reminist<RouteValue>();
        // The entire process of instantiation and population is benchmarked.
        populateRouter(r, allRoutes);
      })
      .add('Memoirist: Add All Routes', () => {
        const m = new Memoirist<RouteValue>();
        populateRouter(m, allRoutes);
      });
  });

  // Setup for Find Tests: These variables will hold router instances
  // populated once before the 'find' tasks run.
  let reministWithRoutes: Reminist<RouteValue>;
  let memoiristWithRoutes: Memoirist<RouteValue>;

  const setupReminist = () => {
    reministWithRoutes = new Reminist<RouteValue>();
    populateRouter(reministWithRoutes, allRoutes);
  };

  const setupMemoirist = () => {
    memoiristWithRoutes = new Memoirist<RouteValue>();
    populateRouter(memoiristWithRoutes, allRoutes);
  };

  // Suite 1: Finding Static Routes
  // Measures lookup performance for pre-defined static routes.
  await runBenchmarkSuite('\n--- 1. Find Test (Static Routes) ---', (bench) => {
    bench
      .add('Reminist: Find Static Routes (All)', () => {
        for (const route of staticRoutes) {
          reministWithRoutes.find(route.method, route.url);
        }
      }, { beforeAll: setupReminist })
      .add('Memoirist: Find Static Routes (All)', () => {
        for (const route of staticRoutes) {
          memoiristWithRoutes.find(route.method, route.url);
        }
      }, { beforeAll: setupMemoirist });
  });

  // Suite 2: Finding Dynamic & Wildcard Routes
  // Measures lookup performance for routes with parameters or wildcards.
  await runBenchmarkSuite('\n--- 2. Find Test (Dynamic & Wildcard Routes) ---', (bench) => {
    bench
      .add('Reminist: Find Dynamic/Wildcard Routes (All)', () => {
        for (const route of dynamicTestUrls) {
          reministWithRoutes.find(route.method, route.testUrl);
        }
      }, { beforeAll: setupReminist })
      .add('Memoirist: Find Dynamic/Wildcard Routes (All)', () => {
        for (const route of dynamicTestUrls) {
          memoiristWithRoutes.find(route.method, route.testUrl);
        }
      }, { beforeAll: setupMemoirist });
  });

  // Suite 3: Finding a Non-Existent Route
  // Measures performance when a route lookup fails.
  await runBenchmarkSuite('\n--- 3. Find Test (Non-Existent Route) ---', (bench) => {
    bench
      .add('Reminist: Find Non-Existent Route', () => {
        reministWithRoutes.find(nonExistentRoute.method, nonExistentRoute.url);
      }, { beforeAll: setupReminist })
      .add('Memoirist: Find Non-Existent Route', () => {
        memoiristWithRoutes.find(nonExistentRoute.method, nonExistentRoute.url);
      }, { beforeAll: setupMemoirist });
  });

  console.log('\n🏁 Benchmarks Complete 🏁');
};

// Execute the main benchmarking function.
main().catch(err => {
  console.error('Benchmark execution failed:', err);
  process.exit(1);
});