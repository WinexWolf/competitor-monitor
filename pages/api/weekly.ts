import type { NextApiRequest, NextApiResponse } from 'next'
import { kv } from '@vercel/kv'
import { getPages, getChangesSince, getLastDigest, setLastDigest } from '@/lib/storage'
import { sendDigest } from '@/lib/email'
import { subDays } from 'date-fns'

async function getAllUsers(): Promise<Array<{ userId: string; email: string }>> {
  return (await kv.get<Array<{ userId: string; email: string }>>('all_users')) ?? []
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const users = await getAllUsers()
  const results = []

  for (const { userId, email } of users) {
    const [pages, lastDigest] = await Promise.all([
      getPages(userId),
      getLastDigest(userId),
    ])

    if (!pages.length) continue

    const since = lastDigest ?? subDays(new Date(), 7)
    const changes = await getChangesSince(userId, since)

    const result = await sendDigest([email], changes, since)
    if (result.ok) await setLastDigest(userId)

    results.push({ userId, email, changes: changes.length, ok: result.ok })
  }

  res.json({ ok: true, sent: results.length, results })
}
