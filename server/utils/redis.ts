import Redis from "ioredis";

let redis: Redis;

export const getRedis = () => {
  if (!redis) {
    const config = useRuntimeConfig();
    redis = new Redis(config.redis.url, { lazyConnect: true });
  }
  return redis;
};
