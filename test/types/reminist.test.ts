import { describe, test } from 'bun:test'
import { expectTypeOf } from 'expect-type'
import { Reminist } from '../../src'
import type { RouteToAutocomplete, ExtractParams } from '../../src/types/reminist'

describe('Reminist Type Testing', () => {
  test('RouteToAutocomplete should convert patterns to user-friendly placeholders', () => {
    expectTypeOf<RouteToAutocomplete<'/user/:id'>>().toEqualTypeOf<'/user/<id>'>();
    expectTypeOf<RouteToAutocomplete<'/posts/[...slug]'>>().toEqualTypeOf<'/posts/<...slug>'>();
    expectTypeOf<RouteToAutocomplete<'/blog/[[...slug]]'>>().toEqualTypeOf<'/blog/<[[...slug]]>'>();
    expectTypeOf<RouteToAutocomplete<'/public/*'>>().toEqualTypeOf<'/public/<*>'>();
    expectTypeOf<RouteToAutocomplete<'/static'>>().toEqualTypeOf<'/static'>();
  });

  test('ExtractParams should extract parameter names from routes', () => {
    expectTypeOf<ExtractParams<'/user/:id'>>().toEqualTypeOf<{ id: string }>();
    expectTypeOf<ExtractParams<'/posts/[...slug]'>>().toEqualTypeOf<{ slug: string }>();
    expectTypeOf<ExtractParams<'/blog/[[...slug]]'>>().toEqualTypeOf<{ slug: string }>();
    expectTypeOf<ExtractParams<'/public/*'>>().toEqualTypeOf<{ '*': string }>();
    expectTypeOf<ExtractParams<'/static'>>().toEqualTypeOf<Record<string, string>>();
  });

  test('Reminist.find should have precisely typed return store and params', () => {
    const router = new Reminist({ keys: ['get'] })
      .add('get', '/user/:id', { kind: 'user' as const })
      .add('get', '/static', { kind: 'static' });

    const matchUser = router.find('get', '/user/123');
    if (matchUser.node) {
        expectTypeOf(matchUser.node.store.kind).toEqualTypeOf<'user'>();
    }
    expectTypeOf(matchUser.params).toEqualTypeOf<{ id: string }>();

    const matchStatic = router.find('get', '/static');
    if (matchStatic.node) {
        expectTypeOf(matchStatic.node.store.kind).toEqualTypeOf<string>();
    }
    expectTypeOf(matchStatic.params).toEqualTypeOf<Record<string, string>>();
  });
});
