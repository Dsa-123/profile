import { createClient } from 'redis';

const getRedisConfig = () => {
  const redisUrl = process.env.REDIS_URL;
  
  if (!redisUrl) {
    throw new Error('Variable is not set');
  }

  return {
    url: redisUrl,
    socket: {
      tls: redisUrl.startsWith('rediss://'),
      rejectUnauthorized: false,
      connectTimeout: 10000,
      commandTimeout: 5000
    }
  };
};

let client;
let connectionPromise;

async function getRedisClient() {
  if (client && client.isReady) return client;
  if (connectionPromise) return connectionPromise;

  connectionPromise = (async () => {
    try {
      const config = getRedisConfig();
      client = createClient(config);
      
      client.on('error', (err) => {
        console.error('Redis client error:', err);
        connectionPromise = null;
      });
      
      client.on('ready', () => {
        console.log('Redis client ready');
      });

      client.on('reconnecting', () => {
        console.log('Redis client reconnecting...');
      });

      await client.connect();
      return client;
    } catch (error) {
      console.error('Failed to create Redis client:', error);
      connectionPromise = null;
      throw error;
    }
  })();

  return connectionPromise;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

    console.log('Attempting to connect to Redis...');
    const redis = await getRedisClient();
    
    console.log('Redis connected, incrementing visit count...');
    const count = await redis.incr('visits');
    
    console.log(`Visit count: ${count}`);
    
    return res.json({ 
      success: true,
      count: count
    });
    
  } catch (error) {
    console.error('Handler error:', error);
    
    if (client) {
      try {
        await client.quit();
      } catch (quitError) {
        console.error('Error closing Redis client:', quitError);
      }
      client = null;
      connectionPromise = null;
    }
    
    return res.status(500).json({ 
      success: false,
      error: 'Redis service unavailable',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}
