import Redis from "ioredis";

let redis: Redis;

export const getRedis = () => {
  if (!redis) {
    const config = useRuntimeConfig();
    console.log({ config });
    redis = new Redis(config.redis.url);
  }
  return redis;
};
