import { describe, test, expect } from 'bun:test'
import { Reminist } from '../src'

describe('Reminist - Add Method', () => {
  test('should add a route successfully', () => {
    const reminist = new Reminist({ keys: ['get'] })
      .add('get', '/new-route', { component: 'New' })
    const result = reminist.find('get', '/new-route')
    expect(result.node).not.toBeNull()
  })

  test('should fail with dynamic routes with different parameter names', () => {
    const router = new Reminist({ keys: ['get'] })
      .add("get", "/monitor/:id", { component: "New" })
    
    expect(() => {
      router.add("get", "/monitor/:monitorId/check", { component: "New" })
    }).toThrow(
      "[Reminist] There are two conflicting routes: /monitor/:monitorId/check and /monitor/:id use different dynamic parameters."
    )
  })
})