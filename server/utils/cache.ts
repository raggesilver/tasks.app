const redis = getRedis();

/**
 * Invalidates one or more cache entries
 *
 * @example
 *   // Delete single key
 *   await invalidateCache("user_123");
 *
 *   // Delete all keys starting with 'user_'
 *   await invalidateCache("user_", true);
 *
 * @param key The key to invalidate. If useMatch is true, this acts as a prefix
 *   pattern
 * @param useMatch When true, deletes all keys matching the pattern `key*`.
 *   WARNING: Uses Redis KEYS command which can be expensive on large datasets
 * @returns Number of keys deleted
 */
async function invalidateCache(
  key: string,
  useMatch: boolean = false,
): Promise<number> {
  if (!useMatch) {
    return redis.del(key);
  }

  const keys = await redis.keys(`${key}*`);
  if (keys.length > 0) {
    return redis.del(keys);
  }

  return 0;
}

/**
 * Generates a cache key based on function name and arguments
 *
 * @param fn The function to generate a key for
 * @param args The arguments passed to the function
 * @returns A string key combining the function name and arguments
 */
function getCacheKey<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  F extends (...args: any[]) => any,
>(fn: F, args: Parameters<F>): string {
  return `${fn.name}_${args.join("_")}`;
}

/** Method decorator that caches the result of an async method call in Redis. */
function cacheResult<Klass, Args extends unknown[], T>(ttlSeconds: number) {
  return function (
    target: (this: Klass, ...args: Args) => Promise<T>,
    context: ClassMethodDecoratorContext<
      Klass,
      (this: Klass, ...args: Args) => Promise<T>
    >,
  ) {
    return async function (this: unknown, ...args: Args): Promise<T> {
      const key = context.name.toString();
      const cacheKey = `${key}_${args.join("_")}`;

      const cached = await redis.get(cacheKey);

      if (cached) {
        console.log(`Using cached value for ${cacheKey} = ${cached}`);
        return JSON.parse(cached) as T;
      }

      const result = await target.call(this as Klass, ...args);

      await redis.set(cacheKey, JSON.stringify(result), "EX", ttlSeconds);

      return result;
    };
  };
}
// function cacheResult<T>(ttlSeconds: number) {
//   return function <Klass, K extends keyof Klass>(
//     _: Klass,
//     key: K,
//     descriptor: TypedPropertyDescriptor<(...args: unknown[]) => Promise<T>>,
//   ) {
//     const method = descriptor.value!;
//
//     descriptor.value = async function (...args: unknown[]): Promise<T> {
//       const cacheKey = `${String(key)}_${args.join("_")}`;
//
//       const cached = await redis.get(cacheKey);
//
//       if (cached) {
//         console.log(`Using cached value for ${cacheKey} = ${cached}`);
//         return JSON.parse(cached) as T;
//       }
//
//       const result = await method.apply(this, args);
//
//       await redis.set(cacheKey, JSON.stringify(result), "EX", ttlSeconds);
//
//       return result;
//     };
//
//     return descriptor;
//   };
// }

export { cacheResult, getCacheKey, invalidateCache };
