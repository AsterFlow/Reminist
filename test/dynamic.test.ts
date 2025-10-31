import { describe, test, expect, beforeEach } from 'bun:test'
import { Reminist } from '../src'

let router: Reminist

describe('Reminist - Dynamic & Catch-all Routes', () => {
  beforeEach(() => {
    router = new Reminist({ keys: ['get'] })
  })

  test('should find a dynamic route and extract param (:)', () => {
    router.add('get', '/users/:id', { component: 'UserProfile' })

    const result = router.find('get', '/users/123-abc')

    expect(result.node).not.toBeNull()
    expect(result.params).toEqual({ id: '123-abc' })
  })

  test('should find a dynamic route and extract param ([])', () => {
    router.add('get', '/users/[id]', { component: 'UserProfile' })

    const result = router.find('get', '/users/123-abc')

    expect(result.node).not.toBeNull()
    expect(result.params).toEqual({ id: '123-abc' })
  })

  test('should find a route with multiple dynamic params', () => {
    router.add('get', '/products/[category]/[productId]', { component: 'ProductPage' })

    const result = router.find('get', '/products/electronics/456')

    expect(result.node).not.toBeNull()
    expect(result.params).toEqual({ category: 'electronics', productId: '456' })
  })

  test('should find a catch-all route and extract slug', () => {
    router.add('get', '/docs/[...slug]', { component: 'DocsPage' })
    
    const result = router.find('get', '/docs/getting-started/installation')

    expect(result.node).not.toBeNull()
    expect(result.params).toEqual({ slug: 'getting-started/installation' })
  })

  test('should handle optional catch-all route with and without path', () => {
    router.add('get', '/gallery/[[...slug]]', { component: 'GalleryPage' })

    const baseResult = router.find('get', '/gallery')
    expect(baseResult.node).not.toBeNull()
    expect(baseResult.params).toEqual({ slug: '' })

    const withPathResult = router.find('get', '/gallery/landscapes/ocean')
    expect(withPathResult.node).not.toBeNull()
    expect(withPathResult.params).toEqual({ slug: 'landscapes/ocean' })
  })
})