<div align="center">

# Reminist

[![npm version](https://img.shields.io/npm/v/reminist?style=for-the-badge&colorA=302D41&colorB=f9e2af&logo=npm)](https://www.npmjs.com/package/reminist)
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

---

## 🚀 Key Features

* **Exceptional Performance**: Lookups are independent of the number of routes. Performance depends only on the length of the path, ensuring consistent speed regardless of your application's size.
* **Type-Safe by Design**: Written entirely in TypeScript for a great developer experience.
* **Zero Dependencies**: Lightweight and easy to integrate into any project.
* **Flexible Route Patterns**: Full support for static, dynamic, wildcard, and catch-all routes.
* **Environment Agnostic**: Works seamlessly in Node.js, Bun, Deno, and modern browsers.
* **Path Caching**: Automatically caches processed URL paths to avoid redundant string manipulation.

---

## 📦 Installation

You can install **reminist** using your preferred package manager:

```bash
bun add reminist
```

*(Works with `npm`, `yarn`, or `pnpm` as well)*

---

## 🏁 Getting Started

Here's a quick example to get you up and running:

```typescript
import { Reminist } from 'reminist'

const router = new Reminist({ keys: ['GET'] })
  .add('GET', '/users/:id', { handler: (userId: string) => console.log(`User fetched: ${userId}`) })

const result = router.find('GET', '/users/10')
if (result.node) {
  console.log('User Id:', result.params) // { id: '10' }

  result.node.store.handler(result.params.id) // User fetched: 10
}
```

---

## 🏁 Benchmarks

The following benchmarks compare Reminist against other high-performance routers like Memoirist and Rou3.

You can find the detailed benchmark results and performance analysis in the [BENCHMARK.md](https://github.com/AsterFlow/Reminist/blob/main/BENCHMARK.md) file.

---

## 🛣️ Route Syntax

Reminist supports several common routing patterns.

| Type                         | Syntax            | Example                  | Description                                                                                          |
| :--------------------------- | :---------------- | :----------------------- | :--------------------------------------------------------------------------------------------------- |
| **Static**             | `/path/to/page` | `/about/contact`       | Matches the exact path. The fastest type of route.                                                   |
| **Dynamic**            | `/:param`       | `/users/:id`           | Matches any segment and captures its value in `params`.                                            |
| **Wildcard**           | `*`             | `/assets/*`            | A standalone `*` consumes the rest of the URL. The captured value is available in `params['*']`. |
| **Catch-All**          | `/[...param]`   | `/files/[...filePath]` | Captures all remaining segments as a single value in `params`.                                     |
| **Optional Catch-All** | `/[[...param]]` | `/docs/[[...slug]]`    | Behaves like a catch-all but also matches the route if no further segments are provided.             |

---

## 🤝 Contributing

Contributions are welcome! If you find a bug or have a feature request, please open an issue. If you want to contribute code, please open a pull request.

---

## 📜 License

This project is licensed under the **MIT License**. See the [LICENSE](https://github.com/AsterFlow/Reminist/blob/main/LICENSE.md) file for details.
