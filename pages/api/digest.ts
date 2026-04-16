import type { NextApiRequest, NextApiResponse } from 'next'
import { getPages, getSubscribers, getChangesSince, getLastDigest, setLastDigest } from '@/lib/storage'
import { sendDigest } from '@/lib/email'
import { subDays } from 'date-fns'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST' && req.query.send !== '1') return res.status(405).end()

  const [pages, subscribers, lastDigest] = await Promise.all([
    getPages(), getSubscribers(), getLastDigest()
  ])

  const testEmail = req.body?.testEmail
  const recipients = testEmail ? [testEmail] : subscribers
  if (!recipients.length) return res.status(400).json({ error: 'No recipients' })

  const since = lastDigest ?? subDays(new Date(), 7)
  const changes = await getChangesSince(since)

  const result = await sendDigest(recipients, changes, since)
  if (result.ok && !testEmail) await setLastDigest()

  res.json({ ok: result.ok, error: result.error, changes: changes.length, to: recipients.length })
}
