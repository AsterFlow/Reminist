import { describe, test, expect, beforeEach } from 'bun:test'
import { Reminist } from '../src'

type RouteData = { component: string }
let router: Reminist<RouteData, ['GET']>

describe('Reminist - Add Method', () => {
  beforeEach(() => {
    router = new Reminist<RouteData, ['GET']>({ keys: ['GET'] })
  })

  test('should add a route successfully', () => {
    router.add('GET', '/new-route', { component: 'New' })
    const result = router.find('GET', '/new-route')
    expect(result.node).not.toBeNull()
  })
})