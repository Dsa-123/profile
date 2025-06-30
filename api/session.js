import { getRedisClient, handleRedisError } from '../lib/redis.js';

function formatTime(totalSeconds) {
  if (totalSeconds === 0) return '0s';
  
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = Math.floor(totalSeconds % 60);
  
  const parts = [];
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  if (seconds > 0) parts.push(`${seconds}s`);
  
  return parts.join(' ');
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    if (!process.env.REDIS_URL) {
      return res.status(500).json({ 
        success: false,
        error: 'Redis configuration missing'
      });
    }

    const redis = await getRedisClient();
    
    if (req.method === 'POST') {
      const { action, sessionId, duration } = req.body;
      
      if (!action || !['start', 'end'].includes(action)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid action. Must be "start" or "end"'
        });
      }

      if (action === 'start') {
        const sessionCount = await redis.incr('sessions:count');
        
        const sessionKey = `session:${sessionId || Date.now()}`;
        await redis.setEx(sessionKey, 86400, Date.now());
        
        return res.json({
          success: true,
          action: 'start',
          sessionId: sessionId || Date.now(),
          totalSessions: sessionCount
        });
      }
      
      if (action === 'end' && duration) {
        const durationInSeconds = parseFloat(duration) * 60;
        await redis.incrByFloat('sessions:totalTimeSeconds', durationInSeconds);
        
        const totalTimeSeconds = await redis.get('sessions:totalTimeSeconds') || 0;
        const sessionCount = await redis.get('sessions:count') || 0;
        
        const avgSessionSeconds = sessionCount > 0 ? parseFloat(totalTimeSeconds) / parseInt(sessionCount) : 0;
        
        return res.json({
          success: true,
          action: 'end',
          duration: formatTime(durationInSeconds),
          totalTime: formatTime(parseFloat(totalTimeSeconds)),
          averageSessionTime: formatTime(avgSessionSeconds)
        });
      }
    }
    
    if (req.method === 'GET') {
      const sessionCount = await redis.get('sessions:count') || 0;
      const totalTimeSeconds = await redis.get('sessions:totalTimeSeconds') || 0;
      
      const avgSessionSeconds = sessionCount > 0 ? parseFloat(totalTimeSeconds) / parseInt(sessionCount) : 0;
      
      return res.json({
        success: true,
        stats: {
          totalSessions: parseInt(sessionCount),
          totalTime: formatTime(parseFloat(totalTimeSeconds)),
          averageSessionTime: formatTime(avgSessionSeconds)
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
