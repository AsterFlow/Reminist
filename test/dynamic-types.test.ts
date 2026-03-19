import { describe, test, expect } from 'bun:test'
import { Reminist } from '../src'

describe('Reminist - Dynamic Typing & Route Listing', () => {
  test('should type find() path argument dynamically and strictly', () => {
    const router = new Reminist({ keys: ['get'] })
      .add('get', '/user/:id', { component: 'User' })
      .add('get', '/posts/[...slug]', { component: 'Posts' })
      .add('get', '/static', { component: 'Static' })

    // Valid paths
    router.find('get', '/user/123')
    router.find('get', '/posts/2023/05/10')
    router.find('get', '/static')
  })

  test('should have precise return types and params based on the matched path', () => {
    const router = new Reminist({ keys: ['get'] })
      .add('get', '/user/:id', { type: 'user', id: 0 } as const)
      .add('get', '/admin/settings', { type: 'admin', power: 9000 })
      .add('get', '/files/[...path]', { type: 'file' })

    const userMatch = router.find('get', '/user/ashu')
    if (userMatch.node) {
      // Store check
      const type: 'user' = userMatch.node.store.type
      expect(type).toBe('user')
      
      const id: string = userMatch.params.id
      expect(id).toBe('ashu')
    }

    const fileMatch = router.find('get', '/files/images/logo.png')
    if (fileMatch.node) {
      const path: string = fileMatch.params.path
      expect(path).toBe('images/logo.png')
    }

    const adminMatch = router.find('get', '/admin/settings')
    if (adminMatch.node) {
      const type: string = adminMatch.node.store.type
      expect(type).toBe('admin')
    }
  })

  test('should list all registered routes', () => {
    const router = new Reminist({ keys: ['get', 'post'] })
      .add('get', '/user/:id', { id: 1 })
      .add('post', '/login', { ok: true })
      .add('get', '/about', { about: 'us' })

    const allRoutes = router.getRoutes()
    expect(allRoutes.get).toContain('/user/:id')
    expect(allRoutes.get).toContain('/about')
    expect(allRoutes.post).toContain('/login')
    expect(allRoutes.get.length).toBe(2)
    expect(allRoutes.post.length).toBe(1)

    const getRoutes = router.getRoutes('get')
    expect(getRoutes).toContain('/user/:id')
    expect(getRoutes).toContain('/about')
    expect(getRoutes.length).toBe(2)
  })

  test('should remove route from listing when deleted', () => {
    const router = new Reminist({ keys: ['get'] })
      .add('get', '/temp', { tmp: true })
    
    expect(router.getRoutes('get')).toContain('/temp')
    
    router.delete('get', '/temp')
    expect(router.getRoutes('get')).not.toContain('/temp')
  })
})
