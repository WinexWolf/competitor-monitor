import type { NextApiRequest, NextApiResponse } from 'next'
import { getPages, addPage, deletePage } from '@/lib/storage'
import { randomUUID } from 'crypto'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const pages = await getPages()
    return res.json({ pages })
  }

  if (req.method === 'POST') {
    const { url, label } = req.body
    if (!url || !label) return res.status(400).json({ error: 'url and label required' })
    try { new URL(url) } catch { return res.status(400).json({ error: 'Invalid URL' }) }

    const pages = await getPages()
    if (pages.length >= 20) return res.status(400).json({ error: 'Max 20 pages' })
    if (pages.find(p => p.url === url)) return res.status(400).json({ error: 'Already tracked' })

    const page = { id: randomUUID(), url, label, addedAt: new Date().toISOString(), status: 'active' as const }
    await addPage(page)
    return res.status(201).json({ page })
  }

  if (req.method === 'DELETE') {
    const { id } = req.query
    if (!id || typeof id !== 'string') return res.status(400).json({ error: 'id required' })
    await deletePage(id)
    return res.json({ ok: true })
  }

  res.status(405).end()
}
