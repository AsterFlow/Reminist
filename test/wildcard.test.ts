import { describe, test, expect, beforeEach } from 'bun:test'
import { Reminist } from '../src'

let router: Reminist

describe('Reminist - Wildcard Routes', () => {
  beforeEach(() => {
    router = new Reminist({ keys: ['get'] })
  })

  test('should find a wildcard route and extract path', () => {
    router.add('get', '/files/*', { component: 'FileServer' })
    const result = router.find('get', '/files/images/background.jpg')
    expect(result.node).not.toBeNull()
    expect(result.params).toEqual({ '*': 'images/background.jpg' })
  })

  test('should handle wildcard at the root', () => {
    router.add('get', '/*', { component: 'RootWildcard' })
    const result = router.find('get', '/any/path/at/all')
    expect(result.node).not.toBeNull()
    expect(result.params).toEqual({ '*': 'any/path/at/all' })
  })
})