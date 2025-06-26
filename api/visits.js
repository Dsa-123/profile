import { increment } from '@vercel/analytics';

export default async function handler(req, res) {
  try {
    await increment('visits');
    const visits = await getVisitsCount();
    
    res.status(200).json({ count: visits });
  } catch (error) {
    res.status(500).json({ error: '0' });
  }
}
