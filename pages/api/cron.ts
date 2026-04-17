import type { NextApiRequest, NextApiResponse } from 'next'
import { kv } from '@vercel/kv'
import { getPages, getSnapshot, saveSnapshot, updatePage, saveChange } from '@/lib/storage'
import { scrapePage } from '@/lib/scraper'
import { computeDiff } from '@/lib/differ'

async function getAllUsers(): Promise<Array<{ userId: string; email: string }>> {
  return (await kv.get<Array<{ userId: string; email: string }>>('all_users')) ?? []
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const users = await getAllUsers()
  const summary = []

  for (const { userId } of users) {
    const pages = await getPages(userId)
    let changed = 0

    for (const page of pages.filter(p => p.status !== 'blocked')) {
      const scraped = await scrapePage(page.url)
      const now = new Date().toISOString()

      if (!scraped.ok) {
        await updatePage(userId, { ...page, status: scraped.blocked ? 'blocked' : 'error', errorMessage: scraped.error, lastChecked: now })
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
          changed++
          continue
        }
      }

      await updatePage(userId, { ...page, status: 'active', lastChecked: now, errorMessage: undefined })
    }

    summary.push({ userId, pages: pages.length, changed })
  }

  res.json({ ok: true, users: users.length, summary })
}
