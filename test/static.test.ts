import { describe, test, expect, beforeEach } from 'bun:test'
import { Reminist } from '../src'

let router: Reminist

describe('Reminist - Static Routes', () => {
  beforeEach(() => {
    router = new Reminist({ keys: ['get', 'post'] })
  })

  test('should add and find the root route', () => {
    router.add('get', '/', { component: 'RootPage' })

    const result = router.find('get', '/')

    expect(result.node).not.toBeNull()
    expect(result.node?.store).toEqual({ component: 'RootPage' })
  })

  test('should add and find a simple static route', () => {
    router.add('get', '/about', { component: 'AboutPage' })

    const result = router.find('get', '/about')

    expect(result.node).not.toBeNull()
    expect(result.node?.store).toEqual({ component: 'AboutPage' })
    expect(router.has('get', '/about')).toBe(true)
  })

  test('should add and find nested static routes', () => {
    router.add('get', '/about/us/team', { component: 'TeamPage' })

    const result = router.find('get', '/about/us/team')

    expect(result.node).not.toBeNull()
    expect(result.node?.store).toEqual({ component: 'TeamPage' })
  })

  test('should differentiate between methods', () => {
    router.add('get', '/data', { component: 'DataViewer' })
    router.add('post', '/data', { component: 'DataUploader' })

    const getResult = router.find('get', '/data')
    const postResult = router.find('post', '/data')

    expect(getResult.node?.store?.component).toBe('DataViewer')
    expect(postResult.node?.store?.component).toBe('DataUploader')
  })
})