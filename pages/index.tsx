'use client'
import { useState, useEffect, useCallback } from 'react'
import type { Page, Change } from '@/lib/types'

// ── Helpers ───────────────────────────────────────────────────────────────────
function ago(iso: string) {
  const m = Math.floor((Date.now() - new Date(iso).getTime()) / 60000)
  if (m < 1) return 'just now'
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}

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

// ── Status dot ────────────────────────────────────────────────────────────────
function Dot({ status }: { status: Page['status'] }) {
  const color = status === 'active' ? S.green : status === 'blocked' ? S.yellow : S.red
  return (
    <span style={{
      display: 'inline-block', width: 8, height: 8, borderRadius: '50%',
      background: color, flexShrink: 0,
      animation: status === 'active' ? 'blink 2s infinite' : 'none',
    }} />
  )
}

// ── Add Page Modal ────────────────────────────────────────────────────────────
function AddModal({ onClose, onAdd }: { onClose: () => void; onAdd: (p: Page) => void }) {
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
      setError(e instanceof Error ? e.message : 'Error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, zIndex: 50 }}>
      <div style={{ background: S.surface, border: `1px solid ${S.border}`, borderRadius: 14, padding: 24, width: '100%', maxWidth: 440 }} className="fade-up">
        <h2 style={{ marginBottom: 20, fontSize: 16, fontWeight: 600 }}>Track a new page</h2>

        {(['url', 'label'] as const).map(field => (
          <div key={field} style={{ marginBottom: 14 }}>
            <label style={{ display: 'block', fontSize: 12, color: S.muted, marginBottom: 6, textTransform: 'capitalize' }}>{field} *</label>
            <input
              type={field === 'url' ? 'url' : 'text'}
              value={field === 'url' ? url : label}
              onChange={e => field === 'url' ? setUrl(e.target.value) : setLabel(e.target.value)}
              placeholder={field === 'url' ? 'https://competitor.com/pricing' : 'Acme Pricing Page'}
              style={{
                width: '100%', background: S.bg, border: `1px solid ${S.border}`,
                borderRadius: 8, padding: '9px 12px', color: S.text, fontSize: 13,
                fontFamily: field === 'url' ? 'JetBrains Mono, monospace' : 'inherit',
                outline: 'none',
              }}
            />
          </div>
        ))}

        {error && (
          <p style={{ background: '#1a0505', color: S.red, borderRadius: 8, padding: '8px 12px', fontSize: 13, marginBottom: 14 }}>{error}</p>
        )}

        <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
          <button onClick={onClose} style={{ flex: 1, padding: '9px 0', borderRadius: 8, border: `1px solid ${S.border}`, background: 'transparent', color: S.muted, cursor: 'pointer', fontSize: 13 }}>
            Cancel
          </button>
          <button
            onClick={submit}
            disabled={loading || !url || !label}
            style={{ flex: 1, padding: '9px 0', borderRadius: 8, border: 'none', background: loading || !url || !label ? '#1a3a1a' : S.green, color: loading || !url || !label ? S.muted : '#000', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}
          >
            {loading ? 'Adding…' : 'Add page'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Subscribers Modal ─────────────────────────────────────────────────────────
function SubsModal({ onClose }: { onClose: () => void }) {
  const [email, setEmail] = useState('')
  const [subs, setSubs] = useState<string[]>([])
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    fetch('/api/subscribers').then(r => r.json()).then(d => setSubs(d.subscribers ?? []))
  }, [])

  async function add() {
    setBusy(true)
    const r = await fetch('/api/subscribers', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email }) })
    if (r.ok) { setSubs(s => [...s, email]); setEmail('') }
    setBusy(false)
  }

  async function remove(e: string) {
    await fetch('/api/subscribers', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: e }) })
    setSubs(s => s.filter(x => x !== e))
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, zIndex: 50 }}>
      <div style={{ background: S.surface, border: `1px solid ${S.border}`, borderRadius: 14, padding: 24, width: '100%', maxWidth: 420 }} className="fade-up">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
          <h2 style={{ fontSize: 16, fontWeight: 600 }}>Digest subscribers</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: S.muted, cursor: 'pointer', fontSize: 18, lineHeight: 1 }}>×</button>
        </div>

        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          <input
            type="email" value={email} onChange={e => setEmail(e.target.value)}
            placeholder="name@company.com"
            style={{ flex: 1, background: S.bg, border: `1px solid ${S.border}`, borderRadius: 8, padding: '9px 12px', color: S.text, fontSize: 13, outline: 'none' }}
          />
          <button
            onClick={add} disabled={busy || !email.includes('@')}
            style={{ padding: '9px 16px', borderRadius: 8, border: 'none', background: S.green, color: '#000', cursor: 'pointer', fontSize: 13, fontWeight: 600, opacity: busy || !email.includes('@') ? .5 : 1 }}
          >
            Add
          </button>
        </div>

        {subs.length === 0
          ? <p style={{ color: S.muted, fontSize: 13 }}>No subscribers yet.</p>
          : subs.map(s => (
            <div key={s} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: S.bg, borderRadius: 8, marginBottom: 6 }}>
              <span style={{ fontSize: 13, fontFamily: 'JetBrains Mono, monospace' }}>{s}</span>
              <button onClick={() => remove(s)} style={{ background: 'none', border: 'none', color: S.red, cursor: 'pointer', fontSize: 12, opacity: .6 }}>Remove</button>
            </div>
          ))
        }
      </div>
    </div>
  )
}

// ── Change card ───────────────────────────────────────────────────────────────
function ChangeCard({ c }: { c: Change }) {
  const [open, setOpen] = useState(false)

  return (
    <div style={{ border: `1px solid ${S.border}`, borderRadius: 12, overflow: 'hidden', marginBottom: 8 }} className="fade-up">
      <div
        onClick={() => setOpen(o => !o)}
        style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: S.surface2, cursor: 'pointer' }}
      >
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontWeight: 500, fontSize: 14, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.label}</p>
          <p style={{ fontSize: 11, color: S.muted, fontFamily: 'JetBrains Mono, monospace', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginTop: 2 }}>{c.url}</p>
        </div>
        <span style={{ background: S.greenDim, color: S.green, borderRadius: 99, padding: '2px 10px', fontSize: 11, fontFamily: 'JetBrains Mono, monospace', whiteSpace: 'nowrap' }}>
          {c.lineCount} Δ
        </span>
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
                {c.added.slice(0, 8).map((l, i) => (
                  <p key={i} style={{ fontSize: 11, fontFamily: 'JetBrains Mono, monospace', color: '#86efac', margin: '2px 0', wordBreak: 'break-word' }}>+ {l}</p>
                ))}
                {c.added.length > 8 && <p style={{ fontSize: 11, color: S.muted, marginTop: 4 }}>…{c.added.length - 8} more</p>}
              </div>
            </div>
          )}

          {c.removed.length > 0 && (
            <div>
              <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em', color: S.red, marginBottom: 6 }}>− Removed</p>
              <div style={{ background: '#1a0505', borderLeft: `3px solid ${S.red}`, borderRadius: '0 6px 6px 0', padding: '8px 12px' }}>
                {c.removed.slice(0, 8).map((l, i) => (
                  <p key={i} style={{ fontSize: 11, fontFamily: 'JetBrains Mono, monospace', color: '#fca5a5', margin: '2px 0', wordBreak: 'break-word' }}>- {l}</p>
                ))}
                {c.removed.length > 8 && <p style={{ fontSize: 11, color: S.muted, marginTop: 4 }}>…{c.removed.length - 8} more</p>}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ── Dashboard ─────────────────────────────────────────────────────────────────
export default function Dashboard() {
  const [pages, setPages] = useState<Page[]>([])
  const [changes, setChanges] = useState<Change[]>([])
  const [tab, setTab] = useState<'pages' | 'changes'>('pages')
  const [showAdd, setShowAdd] = useState(false)
  const [showSubs, setShowSubs] = useState(false)
  const [checking, setChecking] = useState(false)
  const [sending, setSending] = useState(false)
  const [toast, setToast] = useState('')

  const notify = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000) }

  const load = useCallback(async () => {
    const [p, c] = await Promise.all([fetch('/api/pages').then(r => r.json()), fetch('/api/changes').then(r => r.json())])
    setPages(p.pages ?? [])
    setChanges(c.changes ?? [])
  }, [])

  useEffect(() => { load() }, [load])

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
    notify(d.ok ? `✓ Sent to ${email}` : `✗ ${d.error}`)
    setSending(false)
  }

  async function removePage(id: string) {
    if (!confirm('Stop monitoring this page?')) return
    await fetch(`/api/pages?id=${id}`, { method: 'DELETE' })
    setPages(p => p.filter(x => x.id !== id))
    notify('Removed')
  }

  const btn = (label: string, onClick: () => void, disabled = false, primary = false) => (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        padding: '8px 14px', borderRadius: 8, fontSize: 12, fontWeight: primary ? 600 : 400,
        border: primary ? 'none' : `1px solid ${S.border}`,
        background: primary ? S.green : 'transparent',
        color: primary ? '#000' : S.muted,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? .5 : 1,
        whiteSpace: 'nowrap',
      }}
    >{label}</button>
  )

  return (
    <div style={{ minHeight: '100vh', background: S.bg }}>

      {/* Toast */}
      {toast && (
        <div style={{ position: 'fixed', top: 16, right: 16, zIndex: 100, background: S.surface2, border: `1px solid ${S.border}`, borderRadius: 10, padding: '10px 16px', fontSize: 13 }} className="fade-up">
          {toast}
        </div>
      )}

      {/* Header */}
      <header style={{ background: S.surface, borderBottom: `1px solid ${S.border}`, padding: '0 24px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 28, height: 28, borderRadius: 8, background: S.green, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, color: '#000', fontWeight: 700 }}>⌕</div>
            <span style={{ fontWeight: 600, fontSize: 14 }}>Competitor Monitor</span>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            {btn('Subscribers', () => setShowSubs(true))}
            {btn(sending ? 'Sending…' : 'Send test digest', sendTest, sending)}
            {btn(checking ? 'Checking…' : '↻ Check now', checkNow, checking, true)}
          </div>
        </div>
      </header>

      <main style={{ maxWidth: 900, margin: '0 auto', padding: '28px 24px' }}>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 28 }}>
          {[
            { label: 'Pages tracked', value: pages.length, sub: `${pages.filter(p => p.status === 'active').length} active` },
            { label: 'Changes logged', value: changes.length, sub: `${changes.filter(c => Date.now() - new Date(c.detectedAt).getTime() < 86400000).length} today` },
            { label: 'Issues', value: pages.filter(p => p.status !== 'active').length, sub: 'errors / blocked', warn: true },
          ].map(s => (
            <div key={s.label} style={{ background: S.surface, border: `1px solid ${S.border}`, borderRadius: 12, padding: '16px 18px' }}>
              <p style={{ fontSize: 26, fontWeight: 600, fontFamily: 'JetBrains Mono, monospace', color: s.warn && s.value > 0 ? S.yellow : S.text }}>{s.value}</p>
              <p style={{ fontSize: 13, marginTop: 2 }}>{s.label}</p>
              <p style={{ fontSize: 11, color: S.muted, marginTop: 4 }}>{s.sub}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 4, background: S.surface, borderRadius: 10, padding: 4, width: 'fit-content', marginBottom: 20 }}>
          {(['pages', 'changes'] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              style={{
                padding: '6px 18px', borderRadius: 7, border: 'none', fontSize: 13, cursor: 'pointer',
                background: tab === t ? S.green : 'transparent',
                color: tab === t ? '#000' : S.muted,
                fontWeight: tab === t ? 600 : 400,
              }}
            >
              {t}{t === 'changes' && changes.length > 0 && ` (${changes.length})`}
            </button>
          ))}
        </div>

        {/* Pages tab */}
        {tab === 'pages' && (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <p style={{ fontSize: 13, color: S.muted }}>{pages.length}/20 pages · checked every 6h by cron</p>
              <button
                onClick={() => setShowAdd(true)}
                style={{ padding: '8px 16px', borderRadius: 8, border: `1px solid ${S.border}`, background: S.surface2, color: S.text, cursor: 'pointer', fontSize: 13 }}
              >
                + Add page
              </button>
            </div>

            {pages.length === 0 ? (
              <div style={{ border: `2px dashed ${S.border}`, borderRadius: 14, padding: '48px 24px', textAlign: 'center' }}>
                <p style={{ fontSize: 16, marginBottom: 8 }}>No pages tracked yet</p>
                <p style={{ color: S.muted, fontSize: 13, marginBottom: 20 }}>Add a competitor URL to start monitoring</p>
                <button onClick={() => setShowAdd(true)} style={{ padding: '10px 22px', borderRadius: 9, border: 'none', background: S.green, color: '#000', fontWeight: 600, cursor: 'pointer', fontSize: 14 }}>
                  Add first page
                </button>
              </div>
            ) : (
              pages.map(page => (
                <div
                  key={page.id}
                  style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: S.surface, border: `1px solid ${S.border}`, borderRadius: 12, marginBottom: 8 }}
                >
                  <Dot status={page.status} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontWeight: 500, fontSize: 14 }}>{page.label}</p>
                    <a href={page.url} target="_blank" rel="noopener" style={{ fontSize: 11, color: S.muted, fontFamily: 'JetBrains Mono, monospace', textDecoration: 'none', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 400 }}>
                      {page.url}
                    </a>
                    {page.errorMessage && <p style={{ fontSize: 11, color: S.yellow, marginTop: 3 }}>⚠ {page.errorMessage}</p>}
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    {page.lastChanged && <p style={{ fontSize: 11, color: S.green }}>Changed {ago(page.lastChanged)}</p>}
                    <p style={{ fontSize: 11, color: S.muted }}>{page.lastChecked ? `Checked ${ago(page.lastChecked)}` : 'Not yet checked'}</p>
                  </div>
                  <button
                    onClick={() => removePage(page.id)}
                    style={{ background: '#1a0505', border: 'none', color: S.red, borderRadius: 6, padding: '4px 10px', fontSize: 11, cursor: 'pointer' }}
                  >
                    Remove
                  </button>
                </div>
              ))
            )}
          </>
        )}

        {/* Changes tab */}
        {tab === 'changes' && (
          <>
            {changes.length === 0 ? (
              <div style={{ border: `2px dashed ${S.border}`, borderRadius: 14, padding: '48px 24px', textAlign: 'center' }}>
                <p style={{ fontSize: 16, marginBottom: 8 }}>No changes detected yet</p>
                <p style={{ color: S.muted, fontSize: 13 }}>Hit "Check now" to take a first snapshot</p>
              </div>
            ) : (
              changes.map(c => <ChangeCard key={c.id} c={c} />)
            )}
          </>
        )}
      </main>

      {showAdd && <AddModal onClose={() => setShowAdd(false)} onAdd={p => { setPages(prev => [...prev, p]); notify('Added — hit Check now to snapshot it') }} />}
      {showSubs && <SubsModal onClose={() => setShowSubs(false)} />}
    </div>
  )
}
