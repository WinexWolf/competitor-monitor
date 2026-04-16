import type { NextApiRequest, NextApiResponse } from 'next'
import { getPages, getSnapshot, saveSnapshot, updatePage, saveChange } from '@/lib/storage'
import { scrapePage } from '@/lib/scraper'
import { computeDiff } from '@/lib/differ'

// Same logic as snapshot.ts but triggered by Vercel cron (GET, no auth needed from Vercel)
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const pages = await getPages()
  const results = []

  for (const page of pages.filter(p => p.status !== 'blocked')) {
    const scraped = await scrapePage(page.url)
    const now = new Date().toISOString()

    if (!scraped.ok) {
      await updatePage({ ...page, status: scraped.blocked ? 'blocked' : 'error', errorMessage: scraped.error, lastChecked: now })
      results.push({ id: page.id, status: 'error' })
      continue
    }

    const prev = await getSnapshot(page.id)
    const snap = { pageId: page.id, content: scraped.content!, hash: scraped.hash!, capturedAt: now }
    await saveSnapshot(snap)

    if (prev && prev.hash !== scraped.hash) {
      const change = computeDiff(prev.content, scraped.content!, page.id, page.url, page.label)
      if (change) {
        await saveChange(change)
        await updatePage({ ...page, status: 'active', lastChecked: now, lastChanged: now, errorMessage: undefined })
        results.push({ id: page.id, status: 'changed' })
        continue
      }
    }

    await updatePage({ ...page, status: 'active', lastChecked: now, errorMessage: undefined })
    results.push({ id: page.id, status: prev ? 'unchanged' : 'initial' })
  }

  res.json({ ok: true, results })
}
