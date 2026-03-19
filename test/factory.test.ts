import { describe, test, expect } from 'bun:test'
import { Reminist } from '../src'

describe('Reminist - Fluent API', () => {
  test('should create a Reminist instance and add routes fluently', () => {
    const router = new Reminist({ keys: ['get', 'post'] })
      .add('get', '/user/:id', { name: 'John' })
      .add('get', '/posts', { count: 10 })

    expect(router).toBeInstanceOf(Reminist)
    
    const result = router.find('get', '/user/123')
    expect(result.node?.store).toEqual({ name: 'John' })
    expect(result.params.id).toBe('123')

    const result2 = router.find('get', '/posts')
    expect(result2.node?.store).toEqual({ count: 10 })
  })

  test('should support delete fluently', () => {
    const router = new Reminist({ keys: ['get'] })
      .add('get', '/test', { ok: true })
    
    expect(router.has('get', '/test')).toBe(true)
    
    const routerAfterDelete = router.delete('get', '/test')
    expect(routerAfterDelete.has('get', '/test')).toBe(false)
  })
})
