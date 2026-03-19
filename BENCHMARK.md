# 📊 Router Benchmark Report

> Generated: Thu, 19 Mar 2026 06:20:56 GMT

The following benchmarks compare Reminist against other high-performance routers like Memoirist and Rou3.

> Lower latency is better. Higher throughput is better.

### Route Addition Test

This test measures the performance of adding a large set of routes to the router instance.

| Task Name | Latency avg (ns) | Throughput avg (ops/s) |
| :--- | :--- | :--- |
| **Reminist: Route Addition Test** | **1614.99** | **672,686** |
| Rou3: Route Addition Test | 1789.14 | 593,208 |
| Memoirist: Route Addition Test | 7027.15 | 150,635 |

### Find Test (Static)

This test measures lookup performance for static routes (e.g., `/about/contact`).

| Task Name | Latency avg (ns) | Throughput avg (ops/s) |
| :--- | :--- | :--- |
| **Reminist: Find (Static)** | **36.74** | **30,537,148** |
| Rou3: Find (Static) | 37.91 | 26,817,594 |
| Memoirist: Find (Static) | 71.86 | 14,793,010 |

### Find Test (Dynamic & Wildcard)

This test measures lookup performance for routes with dynamic parameters or wildcards (e.g., `/users/:id` or `/assets/*`).

| Task Name | Latency avg (ns) | Throughput avg (ops/s) |
| :--- | :--- | :--- |
| Memoirist: Find (Dynamic & Wildcard) | 91.53 | 11,656,803 |
| Rou3: Find (Dynamic & Wildcard) | 101.65 | 10,583,588 |
| **Reminist: Find (Dynamic & Wildcard)** | **107.43** | **9,665,711** |

### Find Test (Non-Existent)

This test measures performance when searching for a route that does not exist.

| Task Name | Latency avg (ns) | Throughput avg (ops/s) |
| :--- | :--- | :--- |
| **Reminist: Find (Non-Existent)** | **52.13** | **20,170,961** |
| Memoirist: Find (Non-Existent) | 53.01 | 19,079,548 |
| Rou3: Find (Non-Existent) | 107.78 | 9,843,496 |

#### Analysis

The benchmarks highlight Reminist's exceptional performance in the most common routing operations.

  * **Route Addition**: Reminist shows leading performance in route registration, making it ideal for applications with dynamic routing or frequent setup phases.
  * **Static Routes**: For static routes, Reminist leads with the lowest latency and highest throughput.
  * **Non-Existent Routes**: Reminist is also the fastest at handling invalid paths.

Overall, Reminist consistently delivers competitive and often leading performance across all categories.