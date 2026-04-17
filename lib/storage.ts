import { kv } from '@vercel/kv'
import type { Page, Snapshot, Change } from './types'

// Every key is prefixed with userId so each user's data is fully isolated
const k = {
  pages:      (u: string) => `u:${u}:pages`,
  page:       (u: string, id: string) => `u:${u}:page:${id}`,
  snap:       (u: string, id: string) => `u:${u}:snap:${id}`,
  changes:    (u: string) => `u:${u}:changes`,
  change:     (u: string, id: string) => `u:${u}:change:${id}`,
  lastDigest: (u: string) => `u:${u}:last_digest`,
}

// ── Pages ─────────────────────────────────────────────────────────────────────
export async function getPages(userId: string): Promise<Page[]> {
  const ids = await kv.lrange<string>(k.pages(userId), 0, -1)
  if (!ids.length) return []
  const pages = await Promise.all(ids.map(id => kv.get<Page>(k.page(userId, id))))
  return pages.filter(Boolean) as Page[]
}

export async function addPage(userId: string, page: Page) {
  await kv.set(k.page(userId, page.id), page)
  await kv.lpush(k.pages(userId), page.id)
}

export async function updatePage(userId: string, page: Page) {
  await kv.set(k.page(userId, page.id), page)
}

export async function deletePage(userId: string, id: string) {
  await kv.del(k.page(userId, id))
  await kv.lrem(k.pages(userId), 0, id)
  await kv.del(k.snap(userId, id))
}

// ── Snapshots ─────────────────────────────────────────────────────────────────
export async function getSnapshot(userId: string, pageId: string): Promise<Snapshot | null> {
  return kv.get<Snapshot>(k.snap(userId, pageId))
}

export async function saveSnapshot(userId: string, s: Snapshot) {
  await kv.set(k.snap(userId, s.pageId), s)
}

// ── Changes ───────────────────────────────────────────────────────────────────
export async function getChanges(userId: string, limit = 50): Promise<Change[]> {
  const ids = await kv.lrange<string>(k.changes(userId), 0, limit - 1)
  if (!ids.length) return []
  const changes = await Promise.all(ids.map(id => kv.get<Change>(k.change(userId, id))))
  return (changes.filter(Boolean) as Change[]).sort(
    (a, b) => new Date(b.detectedAt).getTime() - new Date(a.detectedAt).getTime()
  )
}

export async function saveChange(userId: string, c: Change) {
  await kv.set(k.change(userId, c.id), c)
  await kv.lpush(k.changes(userId), c.id)
  await kv.ltrim(k.changes(userId), 0, 199)
}

export async function getChangesSince(userId: string, since: Date): Promise<Change[]> {
  const all = await getChanges(userId, 200)
  return all.filter(c => new Date(c.detectedAt) > since)
}

// ── Digest ────────────────────────────────────────────────────────────────────
export async function getLastDigest(userId: string): Promise<Date | null> {
  const d = await kv.get<string>(k.lastDigest(userId))
  return d ? new Date(d) : null
}

export async function setLastDigest(userId: string) {
  await kv.set(k.lastDigest(userId), new Date().toISOString())
}

// ── Waitlist (global, not per-user) ───────────────────────────────────────────
export async function addToWaitlist(email: string) {
  const list = (await kv.get<string[]>('waitlist')) ?? []
  if (!list.includes(email)) await kv.set('waitlist', [...list, email])
}

// ── User registry (for cron to know who to process) ───────────────────────────
export async function registerUser(userId: string, email: string) {
  const users = (await kv.get<Array<{ userId: string; email: string }>>('all_users')) ?? []
  if (!users.find(u => u.userId === userId)) {
    await kv.set('all_users', [...users, { userId, email }])
  }
}
