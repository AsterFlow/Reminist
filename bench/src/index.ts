import { writeFile } from 'fs/promises';
import { RadixTree } from 'radix-way';
import { Memoirist } from 'memoirist';
import { createRouter as createRou3Router, addRoute as addRou3Route } from 'rou3';
import { Reminist } from '../../dist/mjs/index.js';

import { HTTP_METHODS } from './utils/types.js';
import type { RouterAdapter } from './utils/types.js';
import { ALL_ROUTES, STATIC_ROUTES, DYNAMIC_TEST_URLS, MISS_URL } from './utils/routes.js';
import { runSuite } from './utils/bench.js';
import { buildMarkdownReport } from './utils/markdown.js';

import {
  createReministAdapter,
  createMemoiristAdapter,
  createRou3Adapter,
  createRadixWayAdapter
} from './routers/index.js';

async function runAdditionSuite() {
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
          const r = createRou3Router();
          for (const [m, p] of ALL_ROUTES) addRou3Route(r, m, p, 1);
        })
        .add('radix-way', () => {
          const r = new RadixTree();
          for (const [m, p] of ALL_ROUTES) r.insert(m, p, 1 as any);
        });
    }
  );
}

async function runStaticLookupSuite(adapters: RouterAdapter[]) {
  const [method, path] = STATIC_ROUTES.at(-1)!;

  return runSuite(
    {
      name: 'Find Test (Static)',
      description: 'This test measures lookup performance for static routes.'
    },
    bench => {
      for (const adapter of adapters) {
        bench.add(adapter.name, () => adapter.find(method, path));
      }
    }
  );
}

async function runDynamicLookupSuite(adapters: RouterAdapter[]) {
  const [method, path] = DYNAMIC_TEST_URLS[3]!;

  return runSuite(
    {
      name: 'Find Test (Dynamic & Wildcard)',
      description: 'This test measures lookup performance for routes with dynamic parameters or wildcards.'
    },
    bench => {
      for (const adapter of adapters) {
        bench.add(adapter.name, () => adapter.find(method, path));
      }
    }
  );
}

async function runMissingLookupSuite(adapters: RouterAdapter[]) {
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
    }
  );
}

async function main() {
  console.log('🚀 Router Benchmark Starting\\n');

  const adapters: RouterAdapter[] = [
    createReministAdapter(ALL_ROUTES),
    createMemoiristAdapter(ALL_ROUTES),
    createRou3Adapter(ALL_ROUTES),
    createRadixWayAdapter(ALL_ROUTES),
  ];

  const reports = [
    await runAdditionSuite(),
    await runStaticLookupSuite(adapters),
    await runDynamicLookupSuite(adapters),
    await runMissingLookupSuite(adapters),
  ];

  const markdown = buildMarkdownReport(reports);

  await writeFile('../BENCHMARK.md', markdown, 'utf-8');

  console.log('✅ Done — BENCHMARK.md written.');
}

main().catch(err => {
  console.error('Benchmark failed:', err);
  process.exit(1);
});
