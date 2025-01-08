import Redis from "ioredis";

let redis: Redis;

export const getRedis = () => {
  if (!redis) {
    const config = useRuntimeConfig();
    redis = new Redis(config.redis.url, {
      lazyConnect: true,
      family: config.redis.url?.includes("upstash.io") ? 6 : 4,
    });
  }
  return redis;
};
