import { createClient } from 'redis';

const client = createClient({
  url: process.env.REDIS_URL,
  socket: {
    tls: true,        
    rejectUnauthorized: false
  }
});

let isConnected = false;

export default async function handler(req, res) {
  try {
    if (!isConnected) {
      await client.connect();
      isConnected = true;
    }

    const count = await client.incr('visits');
    return res.json({ count });
    
  } catch (error) {
    console.error('Redis error:', error);
    return res.status(500).json({ error: 'Counter service unavailable' });
  }
}
