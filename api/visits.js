import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  let count = (await kv.get('visits')) || 0;
  count++;
  await kv.set('visits', count);
  return res.json({ count });
}