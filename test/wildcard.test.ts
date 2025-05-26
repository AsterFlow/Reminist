import { describe, test, expect, beforeEach } from 'bun:test'
import { Reminist } from '../src'

type RouteData = { component: string }
let router: Reminist<RouteData, ['GET']>

describe('Reminist - Wildcard Routes', () => {
  beforeEach(() => {
    router = new Reminist<RouteData, ['GET']>({ keys: ['GET'] })
  })

  test('should find a wildcard route and extract path', () => {
    router.add('GET', '/files/*', { component: 'FileServer' })
    const result = router.find('GET', '/files/images/background.jpg')
    expect(result.node).not.toBeNull()
    expect(result.params).toEqual({ '*': 'images/background.jpg' })
  })

  test('should handle wildcard at the root', () => {
    router.add('GET', '/*', { component: 'RootWildcard' })
    const result = router.find('GET', '/any/path/at/all')
    expect(result.node).not.toBeNull()
    expect(result.params).toEqual({ '*': 'any/path/at/all' })
  })
})