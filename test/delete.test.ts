import { describe, test, expect } from 'bun:test'
import { Reminist } from '../src'

describe('Reminist - Delete Method', () => {
  test('should correctly delete a route', () => {
    const router = new Reminist({ keys: ['get'] })
      .add('get', '/to-be-deleted', { component: 'Temp' })
    expect(router.has('get', '/to-be-deleted')).toBe(true)

    const routerAfterDelete = router.delete('get', '/to-be-deleted')
    expect(routerAfterDelete.has('get', '/to-be-deleted')).toBe(false)
  })

  test('should return the router instance even when deleting a non-existent route', () => {
    const router = new Reminist({ keys: ['get'] })
    const result = router.delete('get', '/non-existent')
    expect(result).toBe(router)
  })

  test('should not prune a parent node that is an endpoint for another route', () => {
    const router = new Reminist({ keys: ['get'] })
      .add('get', '/settings', { component: 'Settings' })
      .add('get', '/settings/profile', { component: 'Profile' })

    const routerAfterDelete = router.delete('get', '/settings/profile')
    expect(routerAfterDelete.has('get', '/settings/profile')).toBe(false)
    expect(routerAfterDelete.has('get', '/settings')).toBe(true) // O pai ainda deve existir
  })

  test('should prune parent nodes after deletion if they become leaves', () => {
    const router = new Reminist({ keys: ['get'] })
      .add('get', '/a/b/c', { component: 'C' })
    const routerAfterDelete = router.delete('get', '/a/b/c')

    const nodeA_after = routerAfterDelete.find('get', 'a')
    expect(nodeA_after.node).toBeNull()
  })
})
