const { kv } = require('@vercel/kv');

export default async function handler(req, res) {
  try {
    let count = await kv.get('visitCount') || 0;
    
    count = parseInt(count) + 1;
    
    await kv.set('visitCount', count);
    
    return res.status(200).json({ count });
  } catch (error) {
    console.error('Error updating:', error);
    return res.status(500).json({ error: 'Failed to update' });
  }
}