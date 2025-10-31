import { describe, test, expect, beforeEach } from 'bun:test'
import { Reminist } from '../src'

let router: Reminist

describe('Reminist - Delete Method', () => {
  beforeEach(() => {
    router = new Reminist({ keys: ['get'] })
  })

  test('should correctly delete a route', () => {
    router.add('get', '/to-be-deleted', { component: 'Temp' })
    expect(router.has('get', '/to-be-deleted')).toBe(true)

    const success = router.delete('get', '/to-be-deleted')
    expect(success).toBe(true)
    expect(router.has('get', '/to-be-deleted')).toBe(false)
  })

  test('should return false when deleting a non-existent route', () => {
    const success = router.delete('get', '/non-existent')
    expect(success).toBe(false)
  })

  test('should not prune a parent node that is an endpoint for another route', () => {
    router.add('get', '/settings', { component: 'Settings' })
    router.add('get', '/settings/profile', { component: 'Profile' })

    router.delete('get', '/settings/profile')
    expect(router.has('get', '/settings/profile')).toBe(false)
    expect(router.has('get', '/settings')).toBe(true) // O pai ainda deve existir
  })

  test('should prune parent nodes after deletion if they become leaves', () => {
    router.add('get', '/a/b/c', { component: 'C' })
    router.delete('get', '/a/b/c')

    const nodeA_after = router.find('get', 'a')
    expect(nodeA_after.node).toBeNull()
  })
})