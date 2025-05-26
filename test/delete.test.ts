import { describe, test, expect, beforeEach } from 'bun:test'
import { Reminist } from '../src'

type RouteData = { component: string }
let router: Reminist<RouteData, ['GET']>

describe('Reminist - Delete Method', () => {
  beforeEach(() => {
    router = new Reminist<RouteData, ['GET']>({ keys: ['GET'] })
  })

  test('should correctly delete a route', () => {
    router.add('GET', '/to-be-deleted', { component: 'Temp' })
    expect(router.has('GET', '/to-be-deleted')).toBe(true)

    const success = router.delete('GET', '/to-be-deleted')
    expect(success).toBe(true)
    expect(router.has('GET', '/to-be-deleted')).toBe(false)
  })

  test('should return false when deleting a non-existent route', () => {
    const success = router.delete('GET', '/non-existent')
    expect(success).toBe(false)
  })

  test('should not prune a parent node that is an endpoint for another route', () => {
    router.add('GET', '/settings', { component: 'Settings' })
    router.add('GET', '/settings/profile', { component: 'Profile' })

    router.delete('GET', '/settings/profile')
    expect(router.has('GET', '/settings/profile')).toBe(false)
    expect(router.has('GET', '/settings')).toBe(true) // O pai ainda deve existir
  })

  test('should prune parent nodes after deletion if they become leaves', () => {
    router.add('GET', '/a/b/c', { component: 'C' })
    const root = router.getRoot('GET')

    router.delete('GET', '/a/b/c')

    const nodeA_after = router.find('GET', 'a')
    expect(nodeA_after.node).toBeNull()
  })
})