import { describe, test, expect, beforeEach } from 'bun:test'
import { Reminist } from '../src'

type RouteData = { component: string }
let router: Reminist<RouteData, ['GET', 'POST']>

describe('Reminist - Static Routes', () => {
  beforeEach(() => {
    router = new Reminist<RouteData, ['GET', 'POST']>({ keys: ['GET', 'POST'] })
  })

  test('should add and find the root route', () => {
    router.add('GET', '/', { component: 'RootPage' })
    const result = router.find('GET', '/')
    expect(result.node).not.toBeNull()
    expect(result.node?.store).toEqual({ component: 'RootPage' })
  })

  test('should add and find a simple static route', () => {
    router.add('GET', '/about', { component: 'AboutPage' })
    const result = router.find('GET', '/about')
    expect(result.node).not.toBeNull()
    expect(result.node?.store).toEqual({ component: 'AboutPage' })
    expect(router.has('GET', '/about')).toBe(true)
  })

  test('should add and find nested static routes', () => {
    router.add('GET', '/about/us/team', { component: 'TeamPage' })
    const result = router.find('GET', '/about/us/team')
    expect(result.node).not.toBeNull()
    expect(result.node?.store).toEqual({ component: 'TeamPage' })
  })

  test('should differentiate between methods', () => {
    router.add('GET', '/data', { component: 'DataViewer' })
    router.add('POST', '/data', { component: 'DataUploader' })

    const getResult = router.find('GET', '/data')
    const postResult = router.find('POST', '/data')

    expect(getResult.node?.store?.component).toBe('DataViewer')
    expect(postResult.node?.store?.component).toBe('DataUploader')
  })
})