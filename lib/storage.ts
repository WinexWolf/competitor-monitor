import { kv } from '@vercel/kv'
import type { Page, Snapshot, Change } from './types'

// ── Pages ─────────────────────────────────────────────────────────────────────
export async function getPages(): Promise<Page[]> {
  const ids = await kv.lrange<string>('pages', 0, -1)
  if (!ids.length) return []
  const pages = await Promise.all(ids.map(id => kv.get<Page>(`page:${id}`)))
  return pages.filter(Boolean) as Page[]
}

export async function addPage(page: Page) {
  await kv.set(`page:${page.id}`, page)
  await kv.lpush('pages', page.id)
}

export async function updatePage(page: Page) {
  await kv.set(`page:${page.id}`, page)
}

export async function deletePage(id: string) {
  await kv.del(`page:${id}`)
  await kv.lrem('pages', 0, id)
  await kv.del(`snap:${id}`)
}

// ── Snapshots ─────────────────────────────────────────────────────────────────
export async function getSnapshot(pageId: string): Promise<Snapshot | null> {
  return kv.get<Snapshot>(`snap:${pageId}`)
}

export async function saveSnapshot(s: Snapshot) {
  await kv.set(`snap:${s.pageId}`, s)
}

// ── Changes ───────────────────────────────────────────────────────────────────
export async function getChanges(limit = 50): Promise<Change[]> {
  const ids = await kv.lrange<string>('changes', 0, limit - 1)
  if (!ids.length) return []
  const changes = await Promise.all(ids.map(id => kv.get<Change>(`change:${id}`)))
  return (changes.filter(Boolean) as Change[]).sort(
    (a, b) => new Date(b.detectedAt).getTime() - new Date(a.detectedAt).getTime()
  )
}

export async function saveChange(c: Change) {
  await kv.set(`change:${c.id}`, c)
  await kv.lpush('changes', c.id)
  await kv.ltrim('changes', 0, 199)
}

export async function getChangesSince(since: Date): Promise<Change[]> {
  const all = await getChanges(200)
  return all.filter(c => new Date(c.detectedAt) > since)
}

// ── Subscribers ───────────────────────────────────────────────────────────────
export async function getSubscribers(): Promise<string[]> {
  return (await kv.get<string[]>('subscribers')) ?? []
}

export async function addSubscriber(email: string) {
  const subs = await getSubscribers()
  if (!subs.includes(email)) await kv.set('subscribers', [...subs, email])
}

export async function removeSubscriber(email: string) {
  const subs = await getSubscribers()
  await kv.set('subscribers', subs.filter(s => s !== email))
}

export async function getLastDigest(): Promise<Date | null> {
  const d = await kv.get<string>('last_digest')
  return d ? new Date(d) : null
}

export async function setLastDigest() {
  await kv.set('last_digest', new Date().toISOString())
}
