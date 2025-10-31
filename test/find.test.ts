import { describe, test, expect, beforeEach } from 'bun:test'
import { Reminist } from '../src'

let router: Reminist

describe('Reminist - Find Method', () => {
  beforeEach(() => {
    router = new Reminist({ keys: ['get'] })
    router.add('get', '/contact', { component: 'ContactPage' })
    router.add('get', '/posts/[postId]/comments', { component: 'Comments' })
  })

  test('should return null for a non-existent static route', () => {
    const result = router.find('get', '/contacts')
    expect(result.node).toBeNull()
  })

  test('should return null for a partial dynamic match that is not an endpoint', () => {
    const result = router.find('get', '/posts/tech-trends')
    expect(result.node).toBeNull()
  })

  test('has() should return false for non-existent routes', () => {
    expect(router.has('get', '/non-existent')).toBe(false)
    expect(router.has('get', '/posts/123')).toBe(false)
  })
})