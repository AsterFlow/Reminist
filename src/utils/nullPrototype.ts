/**
 * A utility type for objects with no prototype (Object.create(null)).
 * This is useful for high-performance caches and maps to avoid prototype inheritance overhead
 * and potential property collisions.
 * 
 * @template T The type of the values stored in the object.
 */
export type NullProtoObj<T = unknown> = InstanceType<new () => Record<PropertyKey, T>>;

/**
 * A class-like constructor that creates objects with a null prototype.
 * These objects are truly empty and do not inherit from Object.prototype.
 * 
 * @example
 * const cache = new NullProtoObj<string[]>();
 * // cache.toString is undefined
 */
export const NullProtoObj = /* @__PURE__ */ (()=>{const e=function(){};return e.prototype=Object.create(null),Object.freeze(e.prototype),e})() as unknown as { new <T>(): NullProtoObj<T> };
