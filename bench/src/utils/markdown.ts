import type { SuiteReport } from './types.js';

function formatOps(ops: number): string {
  return ops.toLocaleString('en-US');
}

function formatLatency(ns: number): string {
  return ns.toFixed(2);
}

export function buildMarkdownReport(reports: SuiteReport[]): string {
  const getWinner = (suiteName: string) => reports.find(r => r.name === suiteName)?.results[0]?.library ?? 'unknown';
  const formatName = (name: string) => name.charAt(0).toUpperCase() + name.slice(1);

  const addWinner = getWinner('Route Addition Test');
  const staticWinner = getWinner('Find Test (Static)');
  const dynamicWinner = getWinner('Find Test (Dynamic & Wildcard)');
  const missWinner = getWinner('Find Test (Non-Existent)');

  const reportTables = reports.map(report => `### ${report.name}

${report.description}

| Task Name | Latency avg (ns) | Throughput avg (ops/s) |
| :--- | :--- | :--- |
${report.results.map(result => {
    const name = result.library === 'reminist'
      ? "**Reminist: " + report.name.replace('Test ', '') + "**"
      : result.library.charAt(0).toUpperCase() + result.library.slice(1) + ": " + report.name.replace('Test ', '');
    const latency = result.library === 'reminist' ? "**" + formatLatency(result.latencyNs) + "**" : formatLatency(result.latencyNs);
    const throughput = result.library === 'reminist' ? "**" + formatOps(result.opsPerSecond) + "**" : formatOps(result.opsPerSecond);
    return `| ${name} | ${latency} | ${throughput} |`;
  }).join('\n')}
`).join('\n\n');

  return `# 📊 Router Benchmark Report

> Generated: ${new Date().toUTCString()}

The following benchmarks compare Reminist against other high-performance routers like Memoirist, Rou3, and Radix-Way.

> Lower latency is better. Higher throughput is better.

${reportTables}

#### Analysis

The following observations are based on the latest benchmark run:

  * **Route Addition**: ${formatName(addWinner)} shows leading performance in route registration.
  * **Static Routes**: For static routes, ${formatName(staticWinner)} leads with the lowest latency and highest throughput.
  * **Dynamic & Wildcard Routes**: ${formatName(dynamicWinner)} is the fastest and most efficient for complex routing patterns.
  * **Non-Existent Routes**: ${formatName(missWinner)} is the quickest at handling invalid or unmatched paths.

> Compare the results in the tables above for exact latency differences.
`;
}
