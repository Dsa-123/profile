const redis = require('redis');
const client = redis.createClient({
  url: process.env.REDIS_URL
});

export default async function handler(req, res) {
  await client.connect();
  
  let count = await client.get('visits') || 0;
  count = parseInt(count) + 1;
  await client.set('visits', count);
  
  return res.json({ count });
}
