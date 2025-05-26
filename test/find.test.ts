import { describe, test, expect, beforeEach } from 'bun:test'
import { Reminist } from '../src'

type RouteData = { component: string }
let router: Reminist<RouteData, ['GET']>

describe('Reminist - Find Method', () => {
  beforeEach(() => {
    router = new Reminist<RouteData, ['GET']>({ keys: ['GET'] })
    router.add('GET', '/contact', { component: 'ContactPage' })
    router.add('GET', '/posts/[postId]/comments', { component: 'Comments' })
  })

  test('should return null for a non-existent static route', () => {
    const result = router.find('GET', '/contacts') // "contacts" em vez de "contact"
    expect(result.node).toBeNull()
  })

  test('should return null for a partial dynamic match that is not an endpoint', () => {
    const result = router.find('GET', '/posts/tech-trends')
    expect(result.node).toBeNull()
  })

  test('has() should return false for non-existent routes', () => {
    expect(router.has('GET', '/non-existent')).toBe(false)
    expect(router.has('GET', '/posts/123')).toBe(false) // Parcial, não um endpoint
  })
})