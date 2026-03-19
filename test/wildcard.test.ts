import { describe, expect, test } from 'bun:test'
import { Reminist } from '../src'

describe('Reminist - Wildcard Routes', () => {
  test('should find a wildcard route and extract path', () => {
    const router = new Reminist({ keys: ['get'] })
      .add('get', '/files/*', { component: 'FileServer' })
    const result = router.find('get', '/files/images/background.jpg')
    expect(result.node).not.toBeNull()
    expect(result.params).toEqual({ '*': 'images/background.jpg' })
  })

  test('should handle wildcard at the root', () => {
    const router = new Reminist({ keys: ['get'] })
      .add('get', '/*', { component: 'RootWildcard' })
    const result = router.find('get', '/any/path/at/all')
    expect(result.node).not.toBeNull()
    expect(result.params).toEqual({ '*': 'any/path/at/all' })
  })
})