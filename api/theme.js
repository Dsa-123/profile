import { getRedisClient, handleRedisError } from '../lib/redis.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', 'https://it-dsa.vercel.app');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const redis = await getRedisClient();
    
    if (req.method === 'POST') {
      const { theme } = req.body;
      
      if (!theme || !['light', 'dark'].includes(theme)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid theme ("light" or "dark")'
        });
      }

      const count = await redis.incr(`theme:${theme}`);
      
      return res.json({
        success: true,
        theme: theme,
        count: count
      });
    }
    
    if (req.method === 'GET') {
      const lightCount = await redis.get('theme:light') || 0;
      const darkCount = await redis.get('theme:dark') || 0;
      
      return res.json({
        success: true,
        data: {
          light: parseInt(lightCount),
          dark: parseInt(darkCount),
        }
      });
    }

    return res.status(405).json({
      success: false,
      error: 'Method not allowed'
    });
    
  } catch (error) {
    return handleRedisError(error, res);
  }
}
