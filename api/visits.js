import { createClient } from 'redis';

const redisConfig = {
  url: process.env.REDIS_URL,
  socket: {
    tls: true,                  
    rejectUnauthorized: false,  
    connectTimeout: 10000  
  }
};

let client;
let isConnecting = false;

async function getClient() {
  if (client && client.isOpen) return client;
  if (isConnecting) {
    await new Promise(resolve => setTimeout(resolve, 100));
    return getClient();
  }

  isConnecting = true;
  try {
    client = createClient(redisConfig);
    client.on('error', err => console.error('Redis error:', err));
    await client.connect();
    return client;
  } finally {
    isConnecting = false;
  }
}

export default async function handler(req, res) {
  try {
    const redis = await getClient();
    const count = await redis.incr('visits');
    return res.json({ count });
  } catch (error) {
    console.error('Handler error:', error);
    return res.status(500).json({ 
      error: 'Counter unavailable',
      details: process.env.NODE_ENV === 'development' ? error.message : null
    });
  }
}
