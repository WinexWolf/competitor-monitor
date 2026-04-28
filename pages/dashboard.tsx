import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/router'
import { useState, useEffect, useCallback } from 'react'
import Head from 'next/head'
import type { Page, Change } from '@/lib/types'

const S = {
  bg: '#0a0a0f',
  surface: '#111118',
  surface2: '#1a1a24',
  border: '#2a2a38',
  text: '#f0f0f5',
  muted: '#6b6b85',
  green: '#22c55e',
  greenDim: '#052e16',
  red: '#ef4444',
  yellow: '#eab308',
}

const FREE_LIMIT = 3

function ago(iso: string) {
  const m = Math.floor((Date.now() - new Date(iso).getTime()) / 60000)
  if (m < 1) return 'just now'
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}

function Dot({ status }: { status: Page['status'] }) {
  const color = status === 'active' ? S.green : status === 'blocked' ? S.yellow : S.red
  return <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: color, flexShrink: 0, animation: status === 'active' ? 'blink 2s infinite' : 'none' }} />
}

function Spinner() {
  return (
    <>
      <div style={{ width: 16, height: 16, border: `2px solid ${S.border}`, borderTopColor: S.green, borderRadius: '50%', animation: 'spin .7s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}} @keyframes blink{0%,100%{opacity:1}50%{opacity:.3}}`}</style>
    </>
  )
}

function AddModal({ onClose, onAdd, atLimit }: { onClose: () => void; onAdd: (p: Page) => void; atLimit: boolean }) {
  const [url, setUrl] = useState('')
  const [label, setLabel] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function submit() {
    setError(''); setLoading(true)
    try {
      const r = await fetch('/api/pages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, label }),
      })
      const d = await r.json()
      if (!r.ok) throw new Error(d.error ?? 'Failed')
      onAdd(d.page)
      onClose()
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Something went wrong')
    } finally { setLoading(false) }
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, zIndex: 50 }}>
      <div style={{ background: S.surface, border: `1px solid ${S.border}`, borderRadius: 16, padding: 28, width: '100%', maxWidth: 440 }}>
        <h2 style={{ fontSize: 17, fontWeight: 600, marginBottom: 6 }}>Track a new page</h2>
        <p style={{ fontSize: 13, color: S.muted, marginBottom: 24 }}>Pricing pages, feature lists, changelogs — anything public.</p>

        {atLimit && (
          <div style={{ background: '#1a0a00', border: '1px solid #7c4a00', borderRadius: 10, padding: '12px 16px', marginBottom: 20 }}>
            <p style={{ fontSize: 13, color: '#fbbf24', margin: '0 0 6px', fontWeight: 600 }}>Free plan limit reached</p>
            <p style={{ fontSize: 12, color: S.muted, margin: 0 }}>You're tracking 3 pages. Upgrade to Pro to track up to 20.</p>
          </div>
        )}

        <div style={{ marginBottom: 14 }}>
          <label style={{ display: 'block', fontSize: 12, color: S.muted, marginBottom: 6 }}>URL *</label>
          <input type="url" value={url} onChange={e => setUrl(e.target.value)} disabled={atLimit}
            placeholder="https://competitor.com/pricing"
            style={{ width: '100%', background: S.bg, border: `1px solid ${S.border}`, borderRadius: 8, padding: '10px 12px', color: S.text, fontSize: 13, fontFamily: 'JetBrains Mono, monospace', outline: 'none', opacity: atLimit ? .5 : 1 }} />
        </div>
        <div style={{ marginBottom: 20 }}>
          <label style={{ display: 'block', fontSize: 12, color: S.muted, marginBottom: 6 }}>Label *</label>
          <input type="text" value={label} onChange={e => setLabel(e.target.value)} disabled={atLimit}
            placeholder="Acme Pricing Page"
            style={{ width: '100%', background: S.bg, border: `1px solid ${S.border}`, borderRadius: 8, padding: '10px 12px', color: S.text, fontSize: 13, outline: 'none', opacity: atLimit ? .5 : 1 }} />
        </div>

        {error && <p style={{ background: '#1a0505', color: S.red, borderRadius: 8, padding: '8px 12px', fontSize: 13, marginBottom: 16 }}>{error}</p>}

        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={onClose} style={{ flex: 1, padding: '10px 0', borderRadius: 8, border: `1px solid ${S.border}`, background: 'transparent', color: S.muted, cursor: 'pointer', fontSize: 13 }}>Cancel</button>
          {atLimit
            ? <button style={{ flex: 1, padding: '10px 0', borderRadius: 8, border: 'none', background: S.green, color: '#000', fontWeight: 700, cursor: 'pointer', fontSize: 13 }}>Upgrade to Pro →</button>
            : <button onClick={submit} disabled={loading || !url || !label}
                style={{ flex: 1, padding: '10px 0', borderRadius: 8, border: 'none', background: !url || !label ? S.surface2 : S.green, color: !url || !label ? S.muted : '#000', fontWeight: 600, cursor: 'pointer', fontSize: 13, opacity: loading ? .7 : 1 }}>
                {loading ? 'Adding…' : 'Add page'}
              </button>
          }
        </div>
      </div>
    </div>
  )
}

function ChangeCard({ c }: { c: Change }) {
  const [open, setOpen] = useState(false)
  return (
    <div style={{ border: `1px solid ${S.border}`, borderRadius: 12, overflow: 'hidden', marginBottom: 8 }}>
      <div onClick={() => setOpen(o => !o)} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: S.surface2, cursor: 'pointer' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontWeight: 500, fontSize: 14, margin: 0 }}>{c.label}</p>
          <p style={{ fontSize: 11, color: S.muted, fontFamily: 'JetBrains Mono, monospace', margin: '2px 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.url}</p>
        </div>
        <span style={{ background: S.greenDim, color: S.green, borderRadius: 99, padding: '2px 10px', fontSize: 11, fontFamily: 'JetBrains Mono, monospace', whiteSpace: 'nowrap' }}>{c.lineCount} Δ</span>
        <span style={{ color: S.muted, fontSize: 11, whiteSpace: 'nowrap' }}>{ago(c.detectedAt)}</span>
        <span style={{ color: S.muted, fontSize: 10 }}>{open ? '▲' : '▼'}</span>
      </div>
      {open && (
        <div style={{ padding: '14px 16px', background: S.surface }}>
          <p style={{ fontSize: 12, color: S.muted, marginBottom: 12 }}>{c.summary}</p>
          {c.added.length > 0 && (
            <div style={{ marginBottom: 10 }}>
              <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em', color: S.green, marginBottom: 6 }}>+ Added</p>
              <div style={{ background: '#021a0b', borderLeft: `3px solid ${S.green}`, borderRadius: '0 6px 6px 0', padding: '8px 12px' }}>
                {c.added.slice(0, 8).map((l, i) => <p key={i} style={{ fontSize: 11, fontFamily: 'JetBrains Mono, monospace', color: '#86efac', margin: '2px 0', wordBreak: 'break-word' }}>+ {l}</p>)}
                {c.added.length > 8 && <p style={{ fontSize: 11, color: S.muted, marginTop: 4 }}>…{c.added.length - 8} more</p>}
              </div>
            </div>
          )}
          {c.removed.length > 0 && (
            <div>
              <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em', color: S.red, marginBottom: 6 }}>− Removed</p>
              <div style={{ background: '#1a0505', borderLeft: `3px solid ${S.red}`, borderRadius: '0 6px 6px 0', padding: '8px 12px' }}>
                {c.removed.slice(0, 8).map((l, i) => <p key={i} style={{ fontSize: 11, fontFamily: 'JetBrains Mono, monospace', color: '#fca5a5', margin: '2px 0', wordBreak: 'break-word' }}>- {l}</p>)}
                {c.removed.length > 8 && <p style={{ fontSize: 11, color: S.muted, marginTop: 4 }}>…{c.removed.length - 8} more</p>}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default function Dashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [pages, setPages] = useState<Page[]>([])
  const [changes, setChanges] = useState<Change[]>([])
  const [tab, setTab] = useState<'pages' | 'changes'>('pages')
  const [showAdd, setShowAdd] = useState(false)
  const [checking, setChecking] = useState(false)
  const [sending, setSending] = useState(false)
  const [toast, setToast] = useState('')
  const [registered, setRegistered] = useState(false)

  const user = session?.user as { id?: string; name?: string | null; email?: string | null; image?: string | null } | undefined

  useEffect(() => {
    if (status === 'unauthenticated') router.replace('/login')
  }, [status, router])

  useEffect(() => {
    if (status === 'authenticated' && !registered) {
      fetch('/api/register', { method: 'POST' }).then(() => setRegistered(true))
    }
  }, [status, registered])

  const notify = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3500) }

  const load = useCallback(async () => {
    const [p, c] = await Promise.all([
      fetch('/api/pages').then(r => r.json()),
      fetch('/api/changes').then(r => r.json()),
    ])
    setPages(p.pages ?? [])
    setChanges(c.changes ?? [])
  }, [])

  useEffect(() => {
    if (status === 'authenticated') load()
  }, [status, load])

  async function checkNow() {
    setChecking(true)
    const r = await fetch('/api/snapshot', { method: 'POST' })
    const d = await r.json()
    const changed = d.results?.filter((x: { status: string }) => x.status === 'changed').length ?? 0
    notify(changed ? `✓ ${changed} change${changed > 1 ? 's' : ''} detected!` : '✓ No changes found')
    await load()
    setChecking(false)
  }

  async function sendTest() {
    const email = prompt('Send test digest to:')
    if (!email) return
    setSending(true)
    const r = await fetch('/api/digest', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ testEmail: email }) })
    const d = await r.json()
    notify(d.ok ? `✓ Digest sent to ${email}` : `✗ ${d.error}`)
    setSending(false)
  }

  async function removePage(id: string) {
    if (!confirm('Stop monitoring this page?')) return
    await fetch(`/api/pages?id=${id}`, { method: 'DELETE' })
    setPages(p => p.filter(x => x.id !== id))
    notify('Page removed')
  }

  if (status === 'loading' || status === 'unauthenticated') {
    return (
      <div style={{ minHeight: '100vh', background: S.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Spinner />
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    )
  }

  const atLimit = pages.length >= FREE_LIMIT
  const todayChanges = changes.filter(c => Date.now() - new Date(c.detectedAt).getTime() < 86400000).length

  return (
    <>
      <Head>
        <title>Dashboard — Peekly</title>
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />
      </Head>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}} @keyframes blink{0%,100%{opacity:1}50%{opacity:.3}}`}</style>

      <div style={{ minHeight: '100vh', background: S.bg, color: S.text, fontFamily: "'DM Sans', system-ui, sans-serif" }}>

        {toast && (
          <div style={{ position: 'fixed', top: 16, right: 16, zIndex: 100, background: S.surface2, border: `1px solid ${S.border}`, borderRadius: 10, padding: '10px 16px', fontSize: 13, boxShadow: '0 4px 24px rgba(0,0,0,.4)' }}>
            {toast}
          </div>
        )}

        <header style={{ background: S.bg, borderBottom: `1px solid ${S.border}`, padding: '0 24px', position: 'sticky', top: 0, zIndex: 10 }}>
          <div style={{ maxWidth: 960, margin: '0 auto', height: 58, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <a href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
                <div style={{ width: 30, height: 30, borderRadius: 8, background: S.green, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>👁</div>
                <span style={{ fontWeight: 700, fontSize: 18, color: S.text, letterSpacing: '-.02em' }}>Peekly</span>
              </a>
              <span style={{ fontSize: 11, color: S.green, background: S.greenDim, border: '1px solid #166534', borderRadius: 99, padding: '2px 8px', marginLeft: 4, letterSpacing: '.04em' }}>BETA</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ background: S.surface2, border: `1px solid ${S.border}`, borderRadius: 8, padding: '5px 10px', fontSize: 12, color: S.muted }}>
                <span style={{ color: atLimit ? S.yellow : S.green }}>{pages.length}</span>
                <span> / {FREE_LIMIT} pages</span>
                {atLimit && <span style={{ color: S.yellow }}> · Upgrade</span>}
              </div>

              <button onClick={sendTest} disabled={sending}
                style={{ padding: '7px 13px', borderRadius: 8, border: `1px solid ${S.border}`, background: 'transparent', color: S.muted, cursor: 'pointer', fontSize: 12, opacity: sending ? .5 : 1 }}>
                {sending ? 'Sending…' : 'Test digest'}
              </button>

              <button onClick={checkNow} disabled={checking}
                style={{ padding: '7px 14px', borderRadius: 8, border: 'none', background: checking ? S.surface2 : S.green, color: checking ? S.muted : '#000', cursor: 'pointer', fontSize: 12, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                {checking ? <><Spinner /> Checking…</> : '↻ Check now'}
              </button>

              <div style={{ width: 30, height: 30, borderRadius: '50%', background: S.surface2, border: `1px solid ${S.border}`, overflow: 'hidden', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, color: S.muted }}
                onClick={() => signOut({ callbackUrl: '/' })}
                title={`${user?.email} — click to sign out`}
              >
                {user?.image
                  ? <img src={user.image} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
                  : user?.name?.[0]?.toUpperCase() ?? '?'
                }
              </div>
            </div>
          </div>
        </header>

        <main style={{ maxWidth: 960, margin: '0 auto', padding: '28px 24px' }}>

          {pages.length === 0 && (
            <div style={{ background: S.greenDim, border: '1px solid #166534', borderRadius: 12, padding: '16px 20px', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 16 }}>
              <span style={{ fontSize: 24 }}>👋</span>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 14, fontWeight: 600, color: S.green, margin: '0 0 2px' }}>Welcome to Peekly! Start by adding a competitor URL.</p>
                <p style={{ fontSize: 13, color: S.muted, margin: 0 }}>Paste in a pricing page, features page, or changelog. We'll watch it daily and email you when something changes.</p>
              </div>
              <button onClick={() => setShowAdd(true)} style={{ padding: '8px 18px', borderRadius: 8, border: 'none', background: S.green, color: '#000', fontWeight: 700, fontSize: 13, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                Add first page →
              </button>
            </div>
          )}

          {atLimit && (
            <div style={{ background: '#1a0e00', border: '1px solid #7c4a00', borderRadius: 12, padding: '14px 20px', marginBottom: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <p style={{ fontSize: 14, fontWeight: 600, color: '#fbbf24', margin: '0 0 2px' }}>You've hit the free plan limit</p>
                <p style={{ fontSize: 13, color: S.muted, margin: 0 }}>Upgrade to Pro to track up to 20 pages for $29/mo.</p>
              </div>
              <button style={{ padding: '8px 18px', borderRadius: 8, border: 'none', background: '#fbbf24', color: '#000', fontWeight: 700, fontSize: 13, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                Upgrade to Pro
              </button>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 28 }}>
            {[
              { label: 'Pages tracked', value: pages.length, sub: `${pages.filter(p => p.status === 'active').length} active` },
              { label: 'Changes logged', value: changes.length, sub: `${todayChanges} today` },
              { label: 'Issues', value: pages.filter(p => p.status !== 'active').length, sub: 'errors / blocked', warn: true },
            ].map(s => (
              <div key={s.label} style={{ background: S.surface, border: `1px solid ${S.border}`, borderRadius: 12, padding: '16px 18px' }}>
                <p style={{ fontSize: 26, fontWeight: 600, fontFamily: 'JetBrains Mono, monospace', color: s.warn && s.value > 0 ? S.yellow : S.text, margin: '0 0 4px' }}>{s.value}</p>
                <p style={{ fontSize: 13, margin: '0 0 4px' }}>{s.label}</p>
                <p style={{ fontSize: 11, color: S.muted, margin: 0 }}>{s.sub}</p>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: 4, background: S.surface, borderRadius: 10, padding: 4, width: 'fit-content', marginBottom: 20 }}>
            {(['pages', 'changes'] as const).map(t => (
              <button key={t} onClick={() => setTab(t)} style={{ padding: '6px 18px', borderRadius: 7, border: 'none', fontSize: 13, cursor: 'pointer', background: tab === t ? S.green : 'transparent', color: tab === t ? '#000' : S.muted, fontWeight: tab === t ? 600 : 400 }}>
                {t}{t === 'changes' && changes.length > 0 ? ` (${changes.length})` : ''}
              </button>
            ))}
          </div>

          {tab === 'pages' && (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                <p style={{ fontSize: 13, color: S.muted }}>{pages.length}/{FREE_LIMIT} free pages · checked daily at 8 AM UTC</p>
                <button onClick={() => setShowAdd(true)} style={{ padding: '8px 16px', borderRadius: 8, border: `1px solid ${S.border}`, background: S.surface2, color: S.text, cursor: 'pointer', fontSize: 13 }}>
                  + Add page
                </button>
              </div>

              {pages.length === 0 ? (
                <div style={{ border: `2px dashed ${S.border}`, borderRadius: 14, padding: '56px 24px', textAlign: 'center' }}>
                  <p style={{ fontSize: 16, marginBottom: 8 }}>No pages tracked yet</p>
                  <p style={{ color: S.muted, fontSize: 14, marginBottom: 24 }}>Add a competitor URL and we'll watch it daily</p>
                  <button onClick={() => setShowAdd(true)} style={{ padding: '11px 24px', borderRadius: 9, border: 'none', background: S.green, color: '#000', fontWeight: 700, cursor: 'pointer', fontSize: 14 }}>
                    Add your first page
                  </button>
                </div>
              ) : (
                pages.map(page => (
                  <div key={page.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: S.surface, border: `1px solid ${S.border}`, borderRadius: 12, marginBottom: 8 }}>
                    <Dot status={page.status} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontWeight: 500, fontSize: 14, margin: 0 }}>{page.label}</p>
                      <a href={page.url} target="_blank" rel="noopener" style={{ fontSize: 11, color: S.muted, fontFamily: 'JetBrains Mono, monospace', textDecoration: 'none', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 420, marginTop: 2 }}>
                        {page.url}
                      </a>
                      {page.errorMessage && <p style={{ fontSize: 11, color: S.yellow, marginTop: 3 }}>⚠ {page.errorMessage}</p>}
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      {page.lastChanged && <p style={{ fontSize: 11, color: S.green, margin: 0 }}>Changed {ago(page.lastChanged)}</p>}
                      <p style={{ fontSize: 11, color: S.muted, margin: 0 }}>{page.lastChecked ? `Checked ${ago(page.lastChecked)}` : 'Not yet checked'}</p>
                    </div>
                    <button onClick={() => removePage(page.id)} style={{ background: '#1a0505', border: 'none', color: S.red, borderRadius: 6, padding: '4px 10px', fontSize: 11, cursor: 'pointer' }}>
                      Remove
                    </button>
                  </div>
                ))
              )}
            </>
          )}

          {tab === 'changes' && (
            changes.length === 0 ? (
              <div style={{ border: `2px dashed ${S.border}`, borderRadius: 14, padding: '56px 24px', textAlign: 'center' }}>
                <p style={{ fontSize: 16, marginBottom: 8 }}>No changes detected yet</p>
                <p style={{ color: S.muted, fontSize: 14 }}>Hit "Check now" to take your first snapshot</p>
              </div>
            ) : (
              changes.map(c => <ChangeCard key={c.id} c={c} />)
            )
          )}
        </main>
      </div>

      {showAdd && <AddModal onClose={() => setShowAdd(false)} atLimit={atLimit} onAdd={async p => {
        setPages(prev => [...prev, p])
        await load()
        notify('✓ Added — snapshot taken, watching for changes')
      }} />}
    </>
  )
}

export const getServerSideProps = async () => ({ props: {} })
