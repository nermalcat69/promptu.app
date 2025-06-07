import { Redis } from 'ioredis';
import { env } from './env';

let redis: Redis | null = null;

export function getRedisClient(): Redis | null {
  if (!env.REDIS_URL) {
    return null; // Redis is optional
  }

  if (!redis) {
    redis = new Redis(env.REDIS_URL);
  }

  return redis;
}

export async function cacheGet(key: string): Promise<string | null> {
  const client = getRedisClient();
  if (!client) return null;
  
  try {
    return await client.get(key);
  } catch (error) {
    console.error('Redis get error:', error);
    return null;
  }
}

export async function cacheSet(key: string, value: string, ttlSeconds = 300): Promise<boolean> {
  const client = getRedisClient();
  if (!client) return false;
  
  try {
    await client.setex(key, ttlSeconds, value);
    return true;
  } catch (error) {
    console.error('Redis set error:', error);
    return false;
  }
}

export async function cacheIncrement(key: string, amount = 1): Promise<number | null> {
  const client = getRedisClient();
  if (!client) return null;
  
  try {
    return await client.incrby(key, amount);
  } catch (error) {
    console.error('Redis increment error:', error);
    return null;
  }
} 