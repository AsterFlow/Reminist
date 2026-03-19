import { describe, test, expect } from 'bun:test'
import { Reminist } from '../src'

describe('Reminist - Delete Non-Static Method', () => {
  test('should delete dynamic route', () => {
    const router = new Reminist({ keys: ['get'] })
      .add('get', '/user/:id', { component: 'User' })
    expect(router.has('get', '/user/:id')).toBe(true)

    const routerAfterDelete = router.delete('get', '/user/:id')
    expect(routerAfterDelete.has('get', '/user/:id')).toBe(false)
  })

  test('should delete catch-all route', () => {
    const router = new Reminist({ keys: ['get'] })
      .add('get', '/files/[...path]', { component: 'Files' })
    expect(router.has('get', '/files/[...path]')).toBe(true)

    const routerAfterDelete = router.delete('get', '/files/[...path]')
    expect(routerAfterDelete.has('get', '/files/[...path]')).toBe(false)
  })

  test('should delete optional catch-all route', () => {
    const router = new Reminist({ keys: ['get'] })
      .add('get', '/blog/[[...slug]]', { component: 'Blog' })
    expect(router.has('get', '/blog/[[...slug]]')).toBe(true)

    const routerAfterDelete = router.delete('get', '/blog/[[...slug]]')
    expect(routerAfterDelete.has('get', '/blog/[[...slug]]')).toBe(false)
  })

  test('should delete wildcard route', () => {
    const router = new Reminist({ keys: ['get'] })
      .add('get', '/public/*', { component: 'Public' })
    expect(router.has('get', '/public/*')).toBe(true)

    const routerAfterDelete = router.delete('get', '/public/*')
    expect(routerAfterDelete.has('get', '/public/*')).toBe(false)
  })

  test('should prune parent nodes when deleting non-static routes', () => {
    const router = new Reminist({ keys: ['get'] })
      .add('get', '/a/:b', { component: 'B' })
    const routerAfterDelete = router.delete('get', '/a/:b')

    const result = routerAfterDelete.find('get', '/a')
    expect(result.node).toBeNull()
  })
})
