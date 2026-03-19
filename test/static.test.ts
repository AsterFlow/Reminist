import { describe, expect, test } from 'bun:test'
import { Reminist } from '../src'

describe('Reminist - Static Routes', () => {
  test('should add and find the root route', () => {
    const router = new Reminist({ keys: ['get', 'post'] })
      .add('get', '/', { component: 'RootPage' })

    const result = router.find('get', '/')

    expect(result.node).not.toBeNull()
    expect(result.node?.store).toEqual({ component: 'RootPage' })
  })

  test('should add and find a simple static route', () => {
    const router = new Reminist({ keys: ['get', 'post'] })
      .add('get', '/about', { component: 'AboutPage' })

    const result = router.find('get', '/about')

    expect(result.node).not.toBeNull()
    expect(result.node?.store).toEqual({ component: 'AboutPage' })
    expect(router.has('get', '/about')).toBe(true)
  })

  test('should add and find nested static routes', () => {
    const router = new Reminist({ keys: ['get', 'post'] })
      .add('get', '/about/us/team', { component: 'TeamPage' })

    const result = router.find('get', '/about/us/team')

    expect(result.node).not.toBeNull()
    expect(result.node?.store).toEqual({ component: 'TeamPage' })
  })

  test('should differentiate between methods', () => {
    const router = new Reminist({ keys: ['get', 'post'] })
      .add('get', '/data', { component: 'DataViewer' })
      .add('post', '/data', { component: 'DataUploader' })

    const getResult = router.find('get', '/data')
    const postResult = router.find('post', '/data')

    expect(getResult.node?.store?.component).toBe('DataViewer')
    expect(postResult.node?.store?.component).toBe('DataUploader')
  })
})