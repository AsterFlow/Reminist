import { Bench } from 'tinybench' // ou 'tinybench' dependendo da sua instalação
import { Memoirist } from 'memoirist'
import { Reminist } from './src' // Ajuste o caminho se necessário

// --- Dados de Teste ---
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
  '/files/*filePath', // Rota catch-all para Reminist
  '/docs/*',         // Rota wildcard para Memoirist
]

// Instâncias
const reminist = new Reminist({ keys: ['GET'] })
const memoirist = new Memoirist()

// --- Definição dos Testes ---

console.log('🏁 Iniciando Benchmark: Reminist vs. Memoirist 🏁\n')

// --- 1. Teste de Adição de Rotas (Setup) ---
const addBench = new Bench({ time: 1000 })

addBench
  .add('Reminist: Add All Routes', () => {
    // Instanciação dentro do teste para medir a criação + adição
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

// Prepara os roteadores para os testes de busca (agora fora do benchmark)
for (const route of staticRoutes) {
  reminist.add('GET', route, { route })
  memoirist.add('GET', route, { route })
}
for (const route of dynamicRoutes) {
  reminist.add('GET', route, { route })
  memoirist.add('GET', route, { route })
}

// --- 2. Testes de Busca (Runtime) ---
// CORREÇÃO: Criamos uma nova instância do Bench para a segunda suíte de testes.
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