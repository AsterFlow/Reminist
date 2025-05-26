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

  test('should throw an error when adding a duplicate route', () => {
    router.add('GET', '/home', { component: 'HomePage' })
    const action = () => router.add('GET', '/home', { component: 'HomePage' })
    expect(action).toThrow('Unable to add path \'/home\' because a final node already exists')
  })
})