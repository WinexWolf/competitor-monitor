import type { NextApiRequest, NextApiResponse } from 'next'
import { getPages, getSnapshot, saveSnapshot, updatePage, saveChange } from '@/lib/storage'
import { getUserId } from '@/lib/auth'
import { scrapePage } from '@/lib/scraper'
import { computeDiff } from '@/lib/differ'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end()

  const userId = await getUserId(req, res)
  if (!userId) return res.status(401).json({ error: 'Not signed in' })

  const pages = await getPages(userId)
  const results = []

  for (const page of pages.filter(p => p.status !== 'blocked')) {
    const scraped = await scrapePage(page.url)
    const now = new Date().toISOString()

    if (!scraped.ok) {
      await updatePage(userId, { ...page, status: scraped.blocked ? 'blocked' : 'error', errorMessage: scraped.error, lastChecked: now })
      results.push({ id: page.id, status: 'error', error: scraped.error })
      continue
    }

    const prev = await getSnapshot(userId, page.id)
    const snap = { pageId: page.id, content: scraped.content!, hash: scraped.hash!, capturedAt: now }
    await saveSnapshot(userId, snap)

    if (prev && prev.hash !== scraped.hash) {
      const change = computeDiff(prev.content, scraped.content!, page.id, page.url, page.label)
      if (change) {
        await saveChange(userId, change)
        await updatePage(userId, { ...page, status: 'active', lastChecked: now, lastChanged: now, errorMessage: undefined })
        results.push({ id: page.id, status: 'changed', lineCount: change.lineCount })
        continue
      }
    }

    await updatePage(userId, { ...page, status: 'active', lastChecked: now, errorMessage: undefined })
    results.push({ id: page.id, status: prev ? 'unchanged' : 'initial' })
  }

  res.json({ results })
}
