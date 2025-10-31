import { describe, test, expect, beforeEach } from 'bun:test'
import { Reminist } from '../src'

let reminist: Reminist

describe('Reminist - Add Method', () => {
  beforeEach(() => {
    reminist = new Reminist({ keys: ['get'] })
  })

  test('should add a route successfully', () => {
    reminist.add('get', '/new-route', { component: 'New' })
    const result = reminist.find('get', '/new-route')
    expect(result.node).not.toBeNull()
  })
  test('should fail with dynamic routes with different parameter names', () => {
    reminist.add("get", "/monitor/:id", { component: "New" })
    
    expect(() => {
      reminist.add("get", "/monitor/:monitorId/check", { component: "New" })
    }).toThrow(
      '[Reminist] There are two conflicting routes: /monitor/:monitorId/check and /monitor/:id use different dynamic parameters.'
    );
  })
})