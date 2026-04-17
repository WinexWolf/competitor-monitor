import type { NextApiRequest, NextApiResponse } from 'next'
import { addToWaitlist } from '@/lib/storage'

// Public endpoint — landing page email capture goes to waitlist
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end()
  const { email } = req.body
  if (!email?.includes('@')) return res.status(400).json({ error: 'Valid email required' })
  await addToWaitlist(email)
  res.json({ ok: true })
}
