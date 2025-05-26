import { Bench } from 'tinybench' 
import { Memoirist } from 'memoirist'
import { Reminist } from './src'

const staticRoutes = [
  '/',
  '/about',
  '/contact',
  '/products/all/latest',
  '/user/profile/settings',
  '/api/v1/health',
]

const dynamicRoutes = [
  '/users/:id',
  '/products/:category/:productId',
  '/posts/:year/:month/:slug',
  '/files/*filePath',
  '/docs/*',
]

const reminist = new Reminist({ keys: ['GET'] })
const memoirist = new Memoirist()

console.log('🏁 Iniciando Benchmark: Reminist vs. Memoirist 🏁\n')

const addBench = new Bench({ time: 1000 })

addBench
  .add('Reminist: Add All Routes', () => {
    const r = new Reminist({ keys: ['GET'] })
    for (const route of staticRoutes) r.add('GET', route, { route })
    for (const route of dynamicRoutes) r.add('GET', route, { route })
  })
  .add('Memoirist: Add All Routes', () => {
    const m = new Memoirist()
    for (const route of staticRoutes) m.add('GET', route, { route })
    for (const route of dynamicRoutes) m.add('GET', route, { route })
  })

await addBench.run()
console.log('--- Teste de Adição (Setup) ---')
console.table(addBench.table())

for (const route of staticRoutes) {
  reminist.add('GET', route, { route })
  memoirist.add('GET', route, { route })
}
for (const route of dynamicRoutes) {
  reminist.add('GET', route, { route })
  memoirist.add('GET', route, { route })
}

const findBench = new Bench({ time: 1000 })

findBench
  .add('Reminist: Find Static Route', () => {
    reminist.find('GET', '/user/profile/settings')
  })
  .add('Memoirist: Find Static Route', () => {
    memoirist.find('GET', '/user/profile/settings')
  })
  .add('Reminist: Find Dynamic Route', () => {
    reminist.find('GET', '/products/electronics/12345')
  })
  .add('Memoirist: Find Dynamic Route', () => {
    memoirist.find('GET', '/products/electronics/12345')
  })
  .add('Reminist: Find Catch-All Route', () => {
    reminist.find('GET', '/files/images/avatars/user.jpg')
  })
  .add('Memoirist: Find Wildcard Route', () => {
    memoirist.find('GET', '/docs/getting-started/installation')
  })
  .add('Reminist: Find Non-Existent Route', () => {
    reminist.find('GET', '/this/route/does/not/exist')
  })
  .add('Memoirist: Find Non-Existent Route', () => {
    memoirist.find('GET', '/this/route/does/not/exist')
  })
  
await findBench.run()
console.log('\n--- Teste de Busca (Runtime) ---')
console.table(findBench.table())