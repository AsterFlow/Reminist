import { Memoirist } from 'memoirist';
import { Reminist } from './dist/mjs/index.js'
import { addRoute, createRouter, findRoute } from 'rou3';
import { Bench } from 'tinybench';
import { writeFile } from 'fs/promises';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

const HTTP_METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'] as const;
type HttpMethod = (typeof HTTP_METHODS)[number];
type RouteEntry = readonly [HttpMethod, string];

interface RouterAdapter<T = unknown> {
  readonly name: string;
  add(method: HttpMethod, path: string, store: unknown): void;
  find(method: HttpMethod, path: string): T | null | undefined;
}

interface BenchResult {
  readonly library: string;
  readonly opsPerSecond: number;
  readonly latencyNs: number;
  readonly rank: number;
}

interface SuiteReport {
  readonly name: string;
  readonly description: string;
  readonly results: BenchResult[];
}

// ─────────────────────────────────────────────────────────────────────────────
// Route Fixtures
// ─────────────────────────────────────────────────────────────────────────────

const STATIC_ROUTES: RouteEntry[] = [
  ['GET', '/'],
  ['GET', '/user'],
  ['GET', '/user/comments'],
  ['GET', '/user/avatar'],
  ['GET', '/status'],
  ['GET', '/very/deeply/nested/route/hello/there'],
  ['GET', '/api/v1/products'],
  ['GET', '/api/v1/orders'],
];

const DYNAMIC_ROUTES: RouteEntry[] = [
  ['GET', '/user/:id'],
  ['GET', '/user/lookup/:username'],
  ['GET', '/event/:id'],
  ['GET', '/event/:id/comments'],
  ['POST', '/event/:id/comment'],
  ['GET', '/dynamic/:param'],
  ['GET', '/static/*'],
];

const DYNAMIC_TEST_URLS: RouteEntry[] = [
  ['GET', '/user/123'],
  ['GET', '/user/lookup/johndoe'],
  ['GET', '/event/456'],
  ['GET', '/event/456/comments'],
  ['POST', '/event/789/comment'],
  ['GET', '/dynamic/test'],
  ['GET', '/static/css/main.css'],
];

const MISS_URL: RouteEntry = ['GET', '/not/found/path/that/does/not/exist'];

const ALL_ROUTES: RouteEntry[] = [...STATIC_ROUTES, ...DYNAMIC_ROUTES];

// ─────────────────────────────────────────────────────────────────────────────
// Router Adapters
// ─────────────────────────────────────────────────────────────────────────────

function createReministAdapter(routes: RouteEntry[]): RouterAdapter {
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

function createMemoiristAdapter(routes: RouteEntry[]): RouterAdapter {
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

function createRou3Adapter(routes: RouteEntry[]): RouterAdapter {
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

// ─────────────────────────────────────────────────────────────────────────────
// Suite Runners
// ─────────────────────────────────────────────────────────────────────────────

interface SuiteConfig {
  name: string;
  description: string;
  durationMs?: number;
}

async function runSuite(
  config: SuiteConfig,
  register: (bench: Bench) => void,
): Promise<SuiteReport> {
  const bench = new Bench({ time: config.durationMs ?? 500 });
  register(bench);
  await bench.run();

  const sorted = [...bench.tasks].sort((a, b) => {
    const aThroughput = (a.result as any)?.throughput?.mean ?? 0;
    const bThroughput = (b.result as any)?.throughput?.mean ?? 0;
    return bThroughput - aThroughput;
  });

  const results: BenchResult[] = sorted.map((task, index) => {
    const res = task.result!;
    const throughput = (res as any)?.throughput;
    return {
      library: task.name,
      opsPerSecond: Math.round(throughput?.mean ?? 0),
      // period is in ms, convert to ns: period * 1,000,000
      latencyNs: (res as any).period * 1_000_000,
      rank: index + 1,
    };
  });

  console.log(`\n--- ${config.name} ---`);
  console.table(bench.table());

  return { name: config.name, description: config.description, results };
}

// ─────────────────────────────────────────────────────────────────────────────
// Individual Suites
// ─────────────────────────────────────────────────────────────────────────────

async function runAdditionSuite(): Promise<SuiteReport> {
  return runSuite(
    {
      name: 'Route Addition Test',
      description: 'This test measures the performance of adding a large set of routes to the router instance.'
    },
    bench => {
      bench
        .add('reminist', () => {
          const r = new Reminist({ keys: HTTP_METHODS });
          for (const [m, p] of ALL_ROUTES) r.add(m, p, 1);
        })
        .add('memoirist', () => {
          const r = new Memoirist();
          for (const [m, p] of ALL_ROUTES) r.add(m, p, 1);
        })
        .add('rou3', () => {
          const r = createRouter();
          for (const [m, p] of ALL_ROUTES) addRoute(r, m, p, 1);
        });
    });
}

async function runStaticLookupSuite(adapters: RouterAdapter[]): Promise<SuiteReport> {
  const [method, path] = STATIC_ROUTES.at(-1)!;

  return runSuite(
    {
      name: 'Find Test (Static)',
      description: 'This test measures lookup performance for static routes (e.g., `/about/contact`).'
    },
    bench => {
      for (const adapter of adapters) {
        bench.add(adapter.name, () => adapter.find(method, path));
      }
    });
}

async function runDynamicLookupSuite(adapters: RouterAdapter[]): Promise<SuiteReport> {
  const [method, path] = DYNAMIC_TEST_URLS[3]!;

  return runSuite(
    {
      name: 'Find Test (Dynamic & Wildcard)',
      description: 'This test measures lookup performance for routes with dynamic parameters or wildcards (e.g., `/users/:id` or `/assets/*`).'
    },
    bench => {
      for (const adapter of adapters) {
        bench.add(adapter.name, () => adapter.find(method, path));
      }
    });
}

async function runMissingLookupSuite(adapters: RouterAdapter[]): Promise<SuiteReport> {
  const [method, path] = MISS_URL;

  return runSuite(
    {
      name: 'Find Test (Non-Existent)',
      description: 'This test measures performance when searching for a route that does not exist.'
    },
    bench => {
      for (const adapter of adapters) {
        bench.add(adapter.name, () => adapter.find(method, path));
      }
    });
}

// ─────────────────────────────────────────────────────────────────────────────
// Markdown Report Generation
// ─────────────────────────────────────────────────────────────────────────────

function formatOps(ops: number): string {
  return ops.toLocaleString('en-US');
}

function formatLatency(ns: number): string {
  return ns.toFixed(2);
}

function buildMarkdownReport(reports: SuiteReport[]): string {
  const lines: string[] = [];
  const push = (...rows: string[]) => lines.push(...rows);

  push(
    '# 📊 Router Benchmark Report',
    '',
    `> Generated: ${new Date().toUTCString()}`,
    '',
    'The following benchmarks compare Reminist against other high-performance routers like Memoirist and Rou3.',
    '',
    '> Lower latency is better. Higher throughput is better.',
    '',
  );

  for (const report of reports) {
    push(`### ${report.name}`, '');
    push(report.description, '');
    push('| Task Name | Latency avg (ns) | Throughput avg (ops/s) |');
    push('| :--- | :--- | :--- |');
    for (const result of report.results) {
      const name = result.library === 'reminist' ? `**Reminist: ${report.name.replace('Test ', '')}**` : `${result.library.charAt(0).toUpperCase() + result.library.slice(1)}: ${report.name.replace('Test ', '')}`;
      const latency = result.library === 'reminist' ? `**${formatLatency(result.latencyNs)}**` : formatLatency(result.latencyNs);
      const throughput = result.library === 'reminist' ? `**${formatOps(result.opsPerSecond)}**` : formatOps(result.opsPerSecond);
      
      push(`| ${name} | ${latency} | ${throughput} |`);
    }
    push('');
  }

  // Narrative summary (dynamic-ish)
  push('#### Analysis', '');
  push('The benchmarks highlight Reminist\'s exceptional performance in the most common routing operations.', '');

  const getWinner = (suiteName: string) => reports.find(r => r.name === suiteName)?.results[0]?.library;
  const reministWinner = (suiteName: string) => getWinner(suiteName) === 'reminist';

  if (reministWinner('Route Addition Test')) {
    push('  * **Route Addition**: Reminist shows leading performance in route registration, making it ideal for applications with dynamic routing or frequent setup phases.');
  }
  if (reministWinner('Find Test (Static)')) {
    push('  * **Static Routes**: For static routes, Reminist leads with the lowest latency and highest throughput.');
  }
  if (reministWinner('Find Test (Dynamic & Wildcard)')) {
    push('  * **Dynamic & Wildcard Routes**: Reminist maintains its edge, proving faster and more efficient for complex routing patterns.');
  }
  
  const missWinner = getWinner('Find Test (Non-Existent)');
  if (missWinner === 'reminist') {
    push('  * **Non-Existent Routes**: Reminist is also the fastest at handling invalid paths.');
  } else {
    push(`  * **Non-Existent Routes**: While all routers handle misses quickly, ${missWinner?.charAt(0).toUpperCase()}${missWinner?.slice(1)} shows remarkable performance in this specific scenario.`);
  }

  push('', 'Overall, Reminist consistently delivers competitive and often leading performance across all categories.');

  return lines.join('\n');
}

// ─────────────────────────────────────────────────────────────────────────────
// Entry Point
// ─────────────────────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  console.log('🚀 Router Benchmark Starting\n');

  const adapters: RouterAdapter[] = [
    createReministAdapter(ALL_ROUTES),
    createMemoiristAdapter(ALL_ROUTES),
    createRou3Adapter(ALL_ROUTES),
  ];

  const reports = [
    await runAdditionSuite(),
    await runStaticLookupSuite(adapters),
    await runDynamicLookupSuite(adapters),
    await runMissingLookupSuite(adapters),
  ];

  const markdown = buildMarkdownReport(reports);

  await writeFile('BENCHMARK.md', markdown, 'utf-8');

  console.log('\n✅ Done — BENCHMARK.md written.');
}

main().catch(err => {
  console.error('Benchmark failed:', err);
  process.exit(1);
});