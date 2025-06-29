const redis = require('redis');
const client = redis.createClient({
  url: process.env.REDIS_URL
});

import { createClient } from 'redis';
import { NextResponse } from 'next/server';

const redis = await createClient().connect();

export const POST = async () => {
  const result = await redis.get("item");  
  return new NextResponse(JSON.stringify({ result }), { status: 200 });
};

export default async function handler(req, res) {
  await client.connect();
  
  let count = await client.get('visits') || 0;
  count = parseInt(count) + 1;
  await client.set('visits', count);
  
  return res.json({ count });
}
