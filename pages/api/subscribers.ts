import type { NextApiRequest, NextApiResponse } from 'next'
import { getSubscribers, addSubscriber, removeSubscriber } from '@/lib/storage'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const subs = await getSubscribers()
    return res.json({ subscribers: subs })
  }

  if (req.method === 'POST') {
    const { email } = req.body
    if (!email?.includes('@')) return res.status(400).json({ error: 'Valid email required' })
    await addSubscriber(email)
    return res.json({ ok: true })
  }

  if (req.method === 'DELETE') {
    const { email } = req.body
    await removeSubscriber(email)
    return res.json({ ok: true })
  }

  res.status(405).end()
}
