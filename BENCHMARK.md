# 📊 Router Benchmark Report

> Generated: Tue, 31 Mar 2026 03:54:41 GMT

The following benchmarks compare Reminist against other high-performance routers like Memoirist, Rou3, and Radix-Way.

> Lower latency is better. Higher throughput is better.

### Route Addition Test

This test measures the performance of adding a large set of routes to the router instance.

| Task Name | Latency avg (ns) | Throughput avg (ops/s) |
| :--- | :--- | :--- |
| **Reminist: Route Addition Test** | **4739.72** | **249,037** |
| Memoirist: Route Addition Test | 19491.91 | 59,637 |
| Rou3: Route Addition Test | 32086.34 | 34,753 |
| Radix-way: Route Addition Test | 32917.17 | 33,216 |


### Find Test (Static)

This test measures lookup performance for static routes.

| Task Name | Latency avg (ns) | Throughput avg (ops/s) |
| :--- | :--- | :--- |
| **Reminist: Find (Static)** | **85.94** | **12,962,672** |
| Radix-way: Find (Static) | 81.63 | 12,712,037 |
| Rou3: Find (Static) | 90.48 | 11,392,852 |
| Memoirist: Find (Static) | 159.62 | 6,694,837 |


### Find Test (Dynamic & Wildcard)

This test measures lookup performance for routes with dynamic parameters or wildcards.

| Task Name | Latency avg (ns) | Throughput avg (ops/s) |
| :--- | :--- | :--- |
| Memoirist: Find (Dynamic & Wildcard) | 217.00 | 4,980,841 |
| **Reminist: Find (Dynamic & Wildcard)** | **228.21** | **4,590,351** |
| Radix-way: Find (Dynamic & Wildcard) | 243.04 | 4,476,760 |
| Rou3: Find (Dynamic & Wildcard) | 247.95 | 4,331,856 |


### Find Test (Non-Existent)

This test measures performance when searching for a route that does not exist.

| Task Name | Latency avg (ns) | Throughput avg (ops/s) |
| :--- | :--- | :--- |
| **Reminist: Find (Non-Existent)** | **113.38** | **9,391,062** |
| Memoirist: Find (Non-Existent) | 120.41 | 8,553,825 |
| Radix-way: Find (Non-Existent) | 182.51 | 6,222,235 |
| Rou3: Find (Non-Existent) | 306.06 | 3,639,270 |


#### Analysis

The following observations are based on the latest benchmark run:

  * **Route Addition**: Reminist shows leading performance in route registration.
  * **Static Routes**: For static routes, Reminist leads with the lowest latency and highest throughput.
  * **Dynamic & Wildcard Routes**: Memoirist is the fastest and most efficient for complex routing patterns.
  * **Non-Existent Routes**: Reminist is the quickest at handling invalid or unmatched paths.

> Compare the results in the tables above for exact latency differences.
