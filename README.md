<div align="center">

# Reminist

![license-info](https://img.shields.io/github/license/AsterFlow/Reminist?style=for-the-badge&colorA=302D41&colorB=f9e2af&logoColor=f9e2af)
![stars-info](https://img.shields.io/github/stars/AsterFlow/Reminist?colorA=302D41&colorB=f9e2af&style=for-the-badge)

![last-commit](https://img.shields.io/github/last-commit/AsterFlow/Reminist?style=for-the-badge&colorA=302D41&colorB=b4befe)
![commit-activity](https://img.shields.io/github/commit-activity/y/AsterFlow/Reminist?style=for-the-badge&colorA=302D41&colorB=f9e2af)
![code-size](https://img.shields.io/github/languages/code-size/AsterFlow/Reminist?style=for-the-badge&colorA=302D41&colorB=90dceb)

![top-language](https://img.shields.io/github/languages/top/AsterFlow/Reminist?style=for-the-badge&colorA=302D41&colorB=90dceb)
![bundle-size](https://img.shields.io/bundlejs/size/Reminist?style=for-the-badge&colorA=302D41&colorB=3ac97b)

</div>

## 💡 About

> Blazing fast, zero-dependency, TypeScript-native router for any environment.

Reminist is a high-performance routing library built with TypeScript. It uses an optimized **Radix Tree** structure where lookup speed is proportional to the length of the route path, not the total number of routes. This makes route resolution incredibly fast and scalable, especially for high-throughput environments where every microsecond counts.

-----

## 🚀 Key Features

  * **Exceptional Performance**: Lookups are independent of the number of routes. Performance is proportional to the length of the path being processed (`O(k)`), not the total number of routes (`O(n)`).
  * **Type-Safe by Design**: Written entirely in TypeScript for a great developer experience.
  * **Zero Dependencies**: Lightweight and easy to integrate into any project.
  * **Flexible Route Patterns**: Full support for static, dynamic, wildcard, and catch-all routes.
  * **Environment Agnostic**: Works seamlessly in Node.js, Bun, Deno, and modern browsers.
  * **Path Caching**: Automatically caches processed URL paths to avoid redundant string manipulation.

-----

## 📦 Installation

```bash
# Using npm
npm install reminist

# Using bun
bun add reminist

# Using yarn
yarn add reminist

# Using pnpm
pnpm add reminist
```

-----

## 🏁 Getting Started

Here's a quick example to get you up and running:

```typescript
import { Reminist } from 'reminist'

/**
 * Defines the structure for the data stored with each route.
 */
interface MyRouteData {
  id: string
  handler: (req: any, res: any) => void
}

/**
 * A typed router instance created using Reminist.
 * For comparison, here is how you would create a router that is not typed:
 * const router = new Reminist({ keys: ['GET', 'POST'] })
 */
const router = Reminist.create({ keys: ['GET', 'POST'] }).withData<MyRouteData>()

/**
 * Adding routes
 */
router.add('GET', '/', { id: 'home', handler: (_, res) => res.send('Welcome!') })
router.add('GET', '/users/:id', { id: 'getUser', handler: (req, res) => res.send(`User: ${req.params.id}`) })
router.add('POST', '/users', { id: 'createUser', handler: (_, res) => res.send('User created') })
router.add('GET', '/assets/*', { id: 'static', handler: (_, res) => res.send('Serving asset') })

/**
 * Attempts to find a route that matches the 'GET' method and '/users/10' path.
 */
const result = router.find('GET', '/users/10')

if (result.node) {
  console.log('Route found!')
  console.log('ID:', result.node.store?.id)
  console.log('Params:', result.params)
}
```

-----

## 🏁 Benchmarks

The following benchmarks compare Reminist against other high-performance routers like Memoirist and Rou3.

> Lower latency is better. Higher throughput is better.

### Route Addition Test

This test measures the performance of adding a large set of routes to the router instance.

| Task Name | Latency avg (ns) | Throughput avg (ops/s) |
| :--- | :--- | :--- |
| **Reminist: Add All Routes** | **1424.0** | **747,520** |
| Rou3: Add All Routes | 2623.0 | 403,721 |
| Memoirist: Add All Routes | 5150.8 | 205,402 |

### Find Test (Static)

This test measures lookup performance for static routes (e.g., `/about/contact`).

| Task Name | Latency avg (ns) | Throughput avg (ops/s) |
| :--- | :--- | :--- |
| **Reminist: Find Static** | **74.81** | **13,581,441** |
| Rou3: Find Static | 100.94 | 10,097,628 |
| Memoirist: Find Static | 232.57 | 4,536,933 |

### Find Test (Dynamic & Wildcard)

This test measures lookup performance for routes with dynamic parameters or wildcards (e.g., `/users/:id` or `/assets/*`).

| Task Name | Latency avg (ns) | Throughput avg (ops/s) |
| :--- | :--- | :--- |
| **Reminist: Find Dynamic/Wildcard** | **627.44** | **1,691,265** |
| Memoirist: Find Dynamic/Wildcard | 660.59 | 1,634,293 |
| Rou3: Find Dynamic/Wildcard | 1495.9 | 742,280 |

### Find Test (Non-Existent)

This test measures performance when searching for a route that does not exist.

| Task Name | Latency avg (ns) | Throughput avg (ops/s) |
| :--- | :--- | :--- |
| **Memoirist: Find Missing** | **46.17** | **22,460,954** |
| Reminist: Find Missing | 75.27 | 13,677,236 |
| Rou3: Find Missing | 143.18 | 8,488,401 |

#### Analysis

The benchmarks highlight Reminist's exceptional performance in the most common routing operations.

  * **Route Addition**: Reminist is **\~84% faster** than Rou3 and **\~260% faster** than Memoirist, making it ideal for applications with dynamic routing or frequent setup phases.
  * **Static Routes**: For static routes, Reminist leads with the lowest latency and highest throughput, outperforming Rou3 by **\~34%** and Memoirist by over **197%** in throughput.
  * **Dynamic & Wildcard Routes**: Reminist maintains its edge, proving faster and more efficient than both Memoirist and Rou3 for complex routing patterns.
  * **Non-Existent Routes**: While all routers handle misses quickly, Memoirist shows remarkable performance in this specific scenario, making it the fastest for handling invalid paths.

Overall, Reminist consistently delivers the best all-around performance, excelling in route registration and lookups for static, dynamic, and wildcard paths.

-----

## 📖 API Reference

### `new Reminist<Data, Keys>(options)`

Creates a new router instance.

  \* **`Data`**: A generic type for the data you want to store in each route's endpoint.
  \* **`Keys`**: A `const` array of strings representing the top-level keys (e.g., HTTP methods).
  \* **`options`**: An object containing:
      \* **`keys`**: `Keys`. The array of top-level keys.

### `.add(key, path, store)`

Adds a route to the tree.

  \* `key`: `Keys[number]`. The top-level key (e.g., `'GET'`).
  \* `path`: `string`. The URL path for the route.
  \* `store`: `Data`. The data to store at this endpoint.

### `.find(key, path)`

Finds a node in the tree that matches the given path. This is the primary method for routing.

  \* `key`: `Keys[number]`. The top-level key to search within.
  \* `path`: `string`. The URL path to look up.
  \* **Returns**: An object `{ node: Node | null; params: Record<string, string> }`.
      \* `node`: The matching `Node` object if found, otherwise `null`. Check `node.endpoint` to see if it's a usable route.
      \* `params`: An object containing any dynamic parameters extracted from the path.

### `.has(key, path)`

Checks if a route exists and is a valid endpoint.

  \* `key`: `Keys[number]`.
  \* `path`: `string`.
  \* **Returns**: `boolean`.

### `.delete(key, path)`

Removes a route from the tree. This method will also perform "pruning" by removing orphan nodes up the tree.

  \* `key`: `Keys[number]`.
  \* `path`: `string`. The *exact* literal path to remove (e.g., `'/users/:id'`).
  \* **Returns**: `boolean`. `true` if the route was successfully deleted, `false` if it was not found.

-----

## 🧠 How It Works: The Radix Tree

At its core, Reminist uses a **Radix Tree** (a highly efficient type of Trie) to store and retrieve routes.

#### The Problem

A simple array of routes would require iterating through every single route for each incoming request (`O(n)`), which is extremely slow. A basic hash map (`Map`) could find static routes quickly (average `O(1)`), but it can't handle dynamic parameters like `/users/:id`.

#### The Solution: A Tree of Prefixes

A Radix Tree solves this by breaking paths down into segments and storing them in a tree structure. Each node in the tree represents a part of a URL.

For example, the routes `/users/profile` and `/users/settings` would be stored like this:

```
(GET)
  └── "users"
      ├── "profile"  (endpoint)
      └── "settings" (endpoint)
```

When you search for `/users/profile`, the router doesn't compare against all routes. It traverses the tree:

1.  Finds the "users" child.
2.  From there, finds the "profile" child.
3.  The search depth is proportional to the number of segments in the URL (**path length `k`**), **not** the total number of routes in the system (**`n`**). This is why Radix Tree performance is described as `O(k)`.

#### The Reminist Optimization ✨

Reminist takes this a step further. Instead of storing a node's children in an array and iterating to find a match (which is slow), we do the following:

  * **Static children** are stored in a `Map`. This makes finding the next segment an **`O(1)`** operation.
  * **Dynamic, wildcard, and catch-all children** are stored in dedicated properties on the parent node. Since a node can only have one of each special child type, this lookup is also an **`O(1)`** property access.

This structure eliminates loops in the critical path of the `find` method. The total time for a lookup is simply a series of these fast, `O(1)` segment lookups, making the overall operation one of the fastest possible for a router.

-----

## 🛣️ Route Syntax

Reminist supports several common routing patterns.

| Type | Syntax | Example | Description |
| :--- | :--- | :--- | :--- |
| **Static** | `/path/to/page` | `/about/contact` | Matches the exact path. The fastest type of route. |
| **Dynamic** | `/:param` | `/users/:id` | Matches any segment and captures its value in `params`. |
| **Wildcard** | `*` | `/assets/*` | A standalone `*` consumes the rest of the URL. The captured value is available in `params['*']`. |
| **Catch-All** | `/[...param]` | `/files/[...filePath]` | Captures all remaining segments as a single value in `params`. |
| **Optional Catch-All** | `/[[...param]]` | `/docs/[[...slug]]` | Behaves like a catch-all but also matches the route if no further segments are provided. |

-----

## 🤝 Contributing

Contributions are welcome\! If you find a bug or have a feature request, please open an issue. If you want to contribute code, please open a pull request.

-----

## 📜 License

This project is licensed under the **MIT License**. See the [LICENSE](https://github.com/AsterFlow/Reminist/blob/main/LICENSE.md) file for details.
