import type { NextApiRequest, NextApiResponse } from 'next'
import { getChanges } from '@/lib/storage'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).end()
  const changes = await getChanges(50)
  res.json({ changes })
}
