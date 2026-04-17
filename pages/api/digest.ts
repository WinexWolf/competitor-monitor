import type { NextApiRequest, NextApiResponse } from 'next'
import { getPages, getChangesSince, getLastDigest, setLastDigest } from '@/lib/storage'
import { getUserId } from '@/lib/auth'
import { sendDigest } from '@/lib/email'
import { subDays } from 'date-fns'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end()

  const userId = await getUserId(req, res)
  if (!userId) return res.status(401).json({ error: 'Not signed in' })

  const testEmail = req.body?.testEmail
  if (!testEmail) return res.status(400).json({ error: 'testEmail required for manual send' })

  const [pages, lastDigest] = await Promise.all([
    getPages(userId),
    getLastDigest(userId),
  ])

  const since = lastDigest ?? subDays(new Date(), 7)
  const changes = await getChangesSince(userId, since)
  const result = await sendDigest([testEmail], changes, since)

  res.json({ ok: result.ok, error: result.error, changes: changes.length })
}
