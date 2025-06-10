import Redis from 'ioredis';

let redis: Redis | null = null;

// Initialize Redis connection
function getRedisClient(): Redis | null {
  if (!process.env.REDIS_URL) {
    console.log('Redis not configured, using fallback methods');
    return null;
  }

  if (!redis) {
    try {
      redis = new Redis(process.env.REDIS_URL, {
        maxRetriesPerRequest: 3,
        lazyConnect: true,
      });

      redis.on('error', (err) => {
        console.error('Redis connection error:', err);
      });

      redis.on('connect', () => {
        console.log('Redis connected successfully');
      });
    } catch (error) {
      console.error('Failed to initialize Redis:', error);
      redis = null;
    }
  }

  return redis;
}

// Registration tracking functions
export async function incrementRegistrationCount(): Promise<number> {
  const client = getRedisClient();
  
  if (client) {
    try {
      const count = await client.incr('total_registrations');
      console.log(`[Redis] Total registrations: ${count}`);
      return count;
    } catch (error) {
      console.error('Redis increment failed:', error);
    }
  }

  // Fallback: Query database for total count
  return await getDatabaseRegistrationCount();
}

export async function getTotalRegistrations(): Promise<number> {
  const client = getRedisClient();
  
  if (client) {
    try {
      const count = await client.get('total_registrations');
      if (count !== null) {
        return parseInt(count, 10);
      }
    } catch (error) {
      console.error('Redis get failed:', error);
    }
  }

  // Fallback: Query database for total count
  return await getDatabaseRegistrationCount();
}

async function getDatabaseRegistrationCount(): Promise<number> {
  try {
    const { db } = await import('@/lib/db');
    const { user } = await import('@/lib/db/schema');
    const { sql } = await import('drizzle-orm');
    
    const result = await db
      .select({ count: sql<number>`cast(count(*) as integer)` })
      .from(user)
      .where(sql`${user.username} IS NOT NULL`); // Only count users who completed onboarding
    
    const count = result[0]?.count || 0;
    
    // Update Redis cache if available
    const client = getRedisClient();
    if (client) {
      try {
        await client.set('total_registrations', count.toString());
      } catch (error) {
        console.error('Failed to update Redis cache:', error);
      }
    }
    
    return count;
  } catch (error) {
    console.error('Database registration count failed:', error);
    return 0;
  }
}

// Initialize registration count from database on startup
export async function initializeRegistrationCount() {
  const client = getRedisClient();
  
  if (client) {
    try {
      const existingCount = await client.get('total_registrations');
      if (existingCount === null) {
        console.log('[Redis] Initializing registration count from database');
        await getDatabaseRegistrationCount();
      }
    } catch (error) {
      console.error('Failed to initialize registration count:', error);
    }
  }
}

// Analytics tracking functions
export async function trackEvent(event: string, properties: Record<string, any> = {}) {
  const client = getRedisClient();
  
  if (client) {
    try {
      const eventData = {
        event,
        properties,
        timestamp: new Date().toISOString(),
      };
      
      // Store in Redis list for batch processing
      await client.lpush('analytics_events', JSON.stringify(eventData));
      
      // Keep only last 1000 events
      await client.ltrim('analytics_events', 0, 999);
    } catch (error) {
      console.error('Failed to track event:', error);
    }
  }
}

// Daily stats functions
export async function incrementDailyRegistrations(date?: string) {
  const client = getRedisClient();
  
  if (client) {
    try {
      const dateKey = date || new Date().toISOString().split('T')[0]; // YYYY-MM-DD
      const key = `daily_registrations:${dateKey}`;
      
      await client.incr(key);
      await client.expire(key, 60 * 60 * 24 * 90); // Expire after 90 days
    } catch (error) {
      console.error('Failed to increment daily registrations:', error);
    }
  }
}

export async function getDailyRegistrations(date?: string): Promise<number> {
  const client = getRedisClient();
  
  if (client) {
    try {
      const dateKey = date || new Date().toISOString().split('T')[0];
      const key = `daily_registrations:${dateKey}`;
      const count = await client.get(key);
      return count ? parseInt(count, 10) : 0;
    } catch (error) {
      console.error('Failed to get daily registrations:', error);
    }
  }
  
  return 0;
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