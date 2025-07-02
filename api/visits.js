import { getRedisClient, handleRedisError } from '../lib/redis.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', 'https://it-dsa.vercel.app');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  else if(req.method === 'POST'){
    await redis.set('visits', 70);
    await redis.incr('visits');

    return res.status(200).json({
      sucess: true
    });
  }
  else{  
    try {
    const redis = await getRedisClient();
    
    const count = await redis.get('visits');
    
    console.log(`Visit count: ${count}`);
    
    return res.json({ 
      success: true,
      count: count
    });
    
    } catch (error) {
      return handleRedisError(error, res);
    }
  }
}
