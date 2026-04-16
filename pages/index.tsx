import Head from 'next/head'
import { useState } from 'react'

const S = {
  bg: '#0a0a0f',
  surface: '#111118',
  border: '#2a2a38',
  text: '#f0f0f5',
  muted: '#6b6b85',
  green: '#22c55e',
  greenDim: '#052e16',
}

export default function Landing() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  async function join() {
    if (!email.includes('@')) return
    setLoading(true)
    await fetch('/api/subscribers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    })
    setSubmitted(true)
    setLoading(false)
  }

  return (
    <>
      <Head>
        <title>Competitor Monitor — Know when competitors change their pages</title>
        <meta name="description" content="Track competitor pricing, features, and landing pages. Get a weekly digest email when something changes. Built for founders and product marketers." />
      </Head>

      <div style={{ minHeight: '100vh', background: S.bg, color: S.text, fontFamily: "'DM Sans', system-ui, sans-serif" }}>

        <nav style={{ borderBottom: `1px solid ${S.border}`, padding: '0 24px' }}>
          <div style={{ maxWidth: 900, margin: '0 auto', height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 26, height: 26, borderRadius: 7, background: S.green, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, color: '#000', fontWeight: 700 }}>⌕</div>
              <span style={{ fontWeight: 600, fontSize: 14 }}>Competitor Monitor</span>
            </div>
            <a href="/dashboard" style={{ padding: '7px 16px', borderRadius: 8, background: S.surface, border: `1px solid ${S.border}`, color: S.text, textDecoration: 'none', fontSize: 13 }}>
              Dashboard →
            </a>
          </div>
        </nav>

        <section style={{ maxWidth: 720, margin: '0 auto', padding: '80px 24px 64px', textAlign: 'center' }}>
          <div style={{ display: 'inline-block', background: S.greenDim, border: '1px solid #166534', borderRadius: 99, padding: '4px 14px', fontSize: 12, color: S.green, marginBottom: 24, letterSpacing: '.04em' }}>
            FREE DURING BETA
          </div>
          <h1 style={{ fontSize: 'clamp(32px, 6vw, 52px)', fontWeight: 700, lineHeight: 1.15, margin: '0 0 20px' }}>
            Know the moment a competitor<br />
            <span style={{ color: S.green }}>changes their pricing</span>
          </h1>
          <p style={{ fontSize: 18, color: S.muted, lineHeight: 1.6, margin: '0 auto 40px', maxWidth: 520 }}>
            Crayon costs $15,000/year. You don't need that. Track competitor pages, get a weekly digest when something changes. $29/mo.
          </p>
          {submitted ? (
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: S.greenDim, border: '1px solid #166534', borderRadius: 10, padding: '12px 20px', fontSize: 14, color: S.green }}>
              ✓ You're on the list — we'll be in touch
            </div>
          ) : (
            <div style={{ display: 'flex', gap: 8, maxWidth: 420, margin: '0 auto' }}>
              <input
                type="email" value={email} onChange={e => setEmail(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && join()}
                placeholder="your@email.com"
                style={{ flex: 1, background: S.surface, border: `1px solid ${S.border}`, borderRadius: 9, padding: '12px 16px', color: S.text, fontSize: 14, outline: 'none' }}
              />
              <button onClick={join} disabled={loading || !email.includes('@')}
                style={{ padding: '12px 22px', borderRadius: 9, border: 'none', background: S.green, color: '#000', fontWeight: 600, fontSize: 14, cursor: 'pointer', whiteSpace: 'nowrap', opacity: loading ? .7 : 1 }}>
                {loading ? '…' : 'Get early access'}
              </button>
            </div>
          )}
          <p style={{ fontSize: 12, color: S.muted, marginTop: 12 }}>No credit card. Free during beta.</p>
        </section>

        <section style={{ maxWidth: 900, margin: '0 auto', padding: '0 24px 80px' }}>
          <p style={{ textAlign: 'center', fontSize: 12, color: S.muted, letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: 40 }}>How it works</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
            {[
              { n: '01', title: 'Add competitor URLs', body: 'Paste in any competitor page — pricing, features, changelog, whatever you care about.' },
              { n: '02', title: 'We watch it daily', body: 'Every day we snapshot the page and compare it to the last version using a line-by-line diff.' },
              { n: '03', title: 'You get a digest', body: 'Every Monday morning, get an email showing exactly what changed — added lines in green, removed in red.' },
            ].map(step => (
              <div key={step.n} style={{ background: S.surface, border: `1px solid ${S.border}`, borderRadius: 14, padding: '24px 22px' }}>
                <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: S.green, marginBottom: 12, letterSpacing: '.06em' }}>{step.n}</p>
                <p style={{ fontWeight: 600, fontSize: 15, marginBottom: 8 }}>{step.title}</p>
                <p style={{ fontSize: 13, color: S.muted, lineHeight: 1.6 }}>{step.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section style={{ maxWidth: 900, margin: '0 auto', padding: '0 24px 80px' }}>
          <p style={{ textAlign: 'center', fontSize: 12, color: S.muted, letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: 40 }}>vs the alternative</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, maxWidth: 600, margin: '0 auto' }}>
            {[
              { label: 'Crayon / Klue', price: '$15,000/yr', points: ['Built for enterprise sales teams', 'Requires a demo call', 'Overkill for most startups', 'Months to onboard'], bad: true },
              { label: 'Competitor Monitor', price: '$29/mo', points: ['Built for founders & PMs', 'Set up in 5 minutes', 'Just the changes you care about', 'Weekly digest to your inbox'], bad: false },
            ].map(col => (
              <div key={col.label} style={{ background: S.surface, border: `1px solid ${col.bad ? S.border : '#166534'}`, borderRadius: 14, padding: '22px 20px' }}>
                <p style={{ fontSize: 13, color: S.muted, marginBottom: 4 }}>{col.label}</p>
                <p style={{ fontSize: 24, fontWeight: 700, fontFamily: 'JetBrains Mono, monospace', color: col.bad ? S.muted : S.green, marginBottom: 16 }}>{col.price}</p>
                {col.points.map(p => (
                  <div key={p} style={{ display: 'flex', gap: 8, alignItems: 'flex-start', marginBottom: 8 }}>
                    <span style={{ color: col.bad ? '#ef4444' : S.green, fontSize: 12, marginTop: 2 }}>{col.bad ? '✗' : '✓'}</span>
                    <p style={{ fontSize: 13, color: col.bad ? S.muted : S.text, lineHeight: 1.5 }}>{p}</p>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </section>

        <section style={{ maxWidth: 900, margin: '0 auto', padding: '0 24px 80px' }}>
          <p style={{ textAlign: 'center', fontSize: 12, color: S.muted, letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: 40 }}>Built for</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
            {[
              { who: 'SaaS Founders', what: 'Know the moment a competitor changes their pricing or drops a new feature — before your customers do.' },
              { who: 'Product Marketers', what: 'Stop manually checking 10 tabs every week. Get one clean email with everything that moved.' },
              { who: 'Startup Teams', what: "Can't afford Crayon. Don't have time for manual checks. This is the tool for the gap in between." },
            ].map(item => (
              <div key={item.who} style={{ background: S.surface, border: `1px solid ${S.border}`, borderRadius: 14, padding: '22px 20px' }}>
                <p style={{ fontWeight: 600, fontSize: 15, marginBottom: 8 }}>{item.who}</p>
                <p style={{ fontSize: 13, color: S.muted, lineHeight: 1.6 }}>{item.what}</p>
              </div>
            ))}
          </div>
        </section>

        <section style={{ borderTop: `1px solid ${S.border}`, padding: '64px 24px', textAlign: 'center' }}>
          <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 12 }}>Start monitoring for free</h2>
          <p style={{ color: S.muted, fontSize: 15, marginBottom: 32 }}>No credit card. No demo call. Set up in 5 minutes.</p>
          {!submitted ? (
            <div style={{ display: 'flex', gap: 8, maxWidth: 380, margin: '0 auto' }}>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="your@email.com"
                style={{ flex: 1, background: S.surface, border: `1px solid ${S.border}`, borderRadius: 9, padding: '12px 16px', color: S.text, fontSize: 14, outline: 'none' }} />
              <button onClick={join} disabled={loading || !email.includes('@')}
                style={{ padding: '12px 20px', borderRadius: 9, border: 'none', background: S.green, color: '#000', fontWeight: 600, fontSize: 14, cursor: 'pointer', opacity: loading ? .7 : 1 }}>
                Join
              </button>
            </div>
          ) : (
            <p style={{ color: S.green, fontSize: 15 }}>✓ You're on the list!</p>
          )}
        </section>

        <footer style={{ borderTop: `1px solid ${S.border}`, padding: '20px 24px', textAlign: 'center' }}>
          <p style={{ fontSize: 12, color: S.muted }}>Competitor Monitor · Built for founders who move fast</p>
        </footer>

      </div>
    </>
  )
}
