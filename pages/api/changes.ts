import type { NextApiRequest, NextApiResponse } from 'next'
import { getChanges } from '@/lib/storage'
import { getUserId } from '@/lib/auth'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).end()
  const userId = await getUserId(req, res)
  if (!userId) return res.status(401).json({ error: 'Not signed in' })
  const changes = await getChanges(userId, 50)
  res.json({ changes })
}
