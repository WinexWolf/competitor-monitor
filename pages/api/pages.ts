import type { NextApiRequest, NextApiResponse } from 'next'
import { getPages, addPage, deletePage } from '@/lib/storage'
import { getUserId } from '@/lib/auth'
import { randomUUID } from 'crypto'

const FREE_LIMIT = 3
const PRO_LIMIT = 20

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const userId = await getUserId(req, res)
  if (!userId) return res.status(401).json({ error: 'Not signed in' })

  if (req.method === 'GET') {
    const pages = await getPages(userId)
    return res.json({ pages })
  }

  if (req.method === 'POST') {
    const { url, label } = req.body
    if (!url || !label) return res.status(400).json({ error: 'url and label required' })
    try { new URL(url) } catch { return res.status(400).json({ error: 'Invalid URL' }) }

    const pages = await getPages(userId)
    if (pages.length >= PRO_LIMIT) return res.status(400).json({ error: `Max ${PRO_LIMIT} pages` })
    if (pages.length >= FREE_LIMIT) return res.status(402).json({ error: 'Free limit reached. Upgrade to Pro for up to 20 pages.', upgrade: true })
    if (pages.find(p => p.url === url)) return res.status(400).json({ error: 'Already tracking this URL' })

    const page = { id: randomUUID(), url, label, addedAt: new Date().toISOString(), status: 'active' as const }
    await addPage(userId, page)
    return res.status(201).json({ page })
  }

  if (req.method === 'DELETE') {
    const { id } = req.query
    if (!id || typeof id !== 'string') return res.status(400).json({ error: 'id required' })
    await deletePage(userId, id)
    return res.json({ ok: true })
  }

  res.status(405).end()
}
