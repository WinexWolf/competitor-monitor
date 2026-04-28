import Head from 'next/head'
import { useState } from 'react'

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
}

function EmailCapture({ size = 'large' }: { size?: 'large' | 'small' }) {
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

  if (submitted) return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: S.greenDim, border: '1px solid #166534', borderRadius: 10, padding: '12px 20px', fontSize: 14, color: S.green }}>
      ✓ You're on the list — see you Monday morning
    </div>
  )

  const h = size === 'large' ? '52px' : '44px'
  return (
    <div style={{ display: 'flex', gap: 8, maxWidth: size === 'large' ? 460 : 400, margin: '0 auto' }}>
      <input
        type="email" value={email}
        onChange={e => setEmail(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && join()}
        placeholder="you@company.com"
        style={{ flex: 1, height: h, background: S.surface, border: `1px solid ${S.border}`, borderRadius: 10, padding: '0 16px', color: S.text, fontSize: 14, outline: 'none' }}
      />
      <button onClick={join} disabled={loading || !email.includes('@')}
        style={{ height: h, padding: '0 24px', borderRadius: 10, border: 'none', background: S.green, color: '#000', fontWeight: 700, fontSize: 14, cursor: 'pointer', whiteSpace: 'nowrap', opacity: loading || !email.includes('@') ? .5 : 1, transition: 'opacity .15s' }}>
        {loading ? '…' : 'Get early access →'}
      </button>
    </div>
  )
}

export default function Landing() {
  return (
    <>
      <Head>
        <title>Peekly — Your competitors moved. Did you notice?</title>
        <meta name="description" content="Peekly watches your competitor pages daily and sends you one clean email every Monday with exactly what changed. For founders and product marketers who hate surprises." />

        {/* Open Graph — LinkedIn, Slack, iMessage */}
        <meta property="og:title" content="Peekly — Your competitors moved. Did you notice?" />
        <meta property="og:description" content="Track competitor pages. Get a weekly digest when something changes. Free for 3 pages." />
        <meta property="og:image" content="https://competitor-board.vercel.app/og.png" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:url" content="https://competitor-board.vercel.app" />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Peekly" />

        {/* Twitter / X */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Peekly — Your competitors moved. Did you notice?" />
        <meta name="twitter:description" content="Track competitor pages. Get a weekly digest when something changes. Free for 3 pages." />
        <meta name="twitter:image" content="https://competitor-board.vercel.app/og.png" />

        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />

        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,400;0,500;0,600;0,700;1,400&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />
      </Head>

      <div style={{ minHeight: '100vh', background: S.bg, color: S.text, fontFamily: "'DM Sans', system-ui, sans-serif" }}>

        {/* Nav */}
        <nav style={{ borderBottom: `1px solid ${S.border}`, padding: '0 24px', position: 'sticky', top: 0, zIndex: 10, background: S.bg }}>
          <div style={{ maxWidth: 960, margin: '0 auto', height: 58, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 30, height: 30, borderRadius: 8, background: S.green, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>👁</div>
              <span style={{ fontWeight: 700, fontSize: 18, letterSpacing: '-.02em' }}>Peekly</span>
              <span style={{ fontSize: 11, color: S.green, background: S.greenDim, border: '1px solid #166534', borderRadius: 99, padding: '2px 8px', marginLeft: 4, letterSpacing: '.04em' }}>BETA</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <a href="#pricing" style={{ fontSize: 13, color: S.muted, textDecoration: 'none' }}>Pricing</a>
              <a href="/dashboard" style={{ padding: '7px 16px', borderRadius: 8, background: S.surface2, border: `1px solid ${S.border}`, color: S.text, textDecoration: 'none', fontSize: 13, fontWeight: 500 }}>
                Dashboard →
              </a>
            </div>
          </div>
        </nav>

        {/* Hero */}
        <section style={{ maxWidth: 780, margin: '0 auto', padding: '96px 24px 80px', textAlign: 'center' }}>
          <p style={{ fontSize: 13, color: S.muted, letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: 20 }}>
            For founders & product marketers
          </p>

          <h1 style={{ fontSize: 'clamp(36px, 6vw, 58px)', fontWeight: 700, lineHeight: 1.1, margin: '0 0 8px', letterSpacing: '-.02em' }}>
            Your competitors moved.
          </h1>
          <h1 style={{ fontSize: 'clamp(36px, 6vw, 58px)', fontWeight: 700, lineHeight: 1.1, margin: '0 0 28px', letterSpacing: '-.02em', color: S.green }}>
            Did you notice?
          </h1>

          <p style={{ fontSize: 19, color: S.muted, lineHeight: 1.65, margin: '0 auto 16px', maxWidth: 540 }}>
            Peekly watches your competitor pages daily and sends you <em style={{ color: S.text, fontStyle: 'italic' }}>one clean email every Monday</em> with exactly what changed.
          </p>
          <p style={{ fontSize: 15, color: S.muted, marginBottom: 44 }}>
            No dashboards. No noise. Just the diff.
          </p>

          <EmailCapture size="large" />
          <p style={{ fontSize: 12, color: S.muted, marginTop: 14 }}>Free for 3 pages. No credit card. No demo call.</p>
        </section>

        {/* Social proof bar */}
        <div style={{ borderTop: `1px solid ${S.border}`, borderBottom: `1px solid ${S.border}`, padding: '16px 24px', textAlign: 'center', background: S.surface }}>
          <p style={{ fontSize: 13, color: S.muted, margin: 0 }}>
            Built for teams who are <span style={{ color: S.text }}>tired of finding out from customers</span> that a competitor changed something
          </p>
        </div>

        {/* Pain section */}
        <section style={{ maxWidth: 720, margin: '0 auto', padding: '80px 24px' }}>
          <div style={{ background: S.surface, border: `1px solid ${S.border}`, borderRadius: 16, padding: '36px 40px' }}>
            <p style={{ fontSize: 13, color: S.muted, letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: 20 }}>Sound familiar?</p>
            {[
              'Your competitor dropped their prices last Tuesday. You found out Friday — from a churned customer.',
              'Someone has a Notion doc of competitor pages. Nobody remembers to check it.',
              'Your PM spent 3 hours on a Friday manually comparing competitor features. Again.',
              "You find out about a competitor's new feature when a prospect mentions it on a demo call.",
            ].map((line, i) => (
              <div key={i} style={{ display: 'flex', gap: 14, alignItems: 'flex-start', marginBottom: i < 3 ? 18 : 0 }}>
                <span style={{ color: S.red, fontSize: 16, marginTop: 1, flexShrink: 0 }}>×</span>
                <p style={{ fontSize: 15, color: S.muted, lineHeight: 1.6, margin: 0 }}>{line}</p>
              </div>
            ))}
            <div style={{ borderTop: `1px solid ${S.border}`, marginTop: 28, paddingTop: 24 }}>
              <p style={{ fontSize: 16, color: S.text, fontWeight: 600, margin: '0 0 6px' }}>That's not a process. That's hope.</p>
              <p style={{ fontSize: 14, color: S.muted, margin: 0 }}>Peekly is the process.</p>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section style={{ maxWidth: 960, margin: '0 auto', padding: '0 24px 80px' }}>
          <p style={{ textAlign: 'center', fontSize: 12, color: S.muted, letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: 40 }}>How it works</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
            {[
              { n: '01', title: 'Paste any URL', body: "Competitor's pricing page. Feature comparison. Changelog. Job board. If it's public, we can watch it.", note: 'Takes 30 seconds.' },
              { n: '02', title: 'We do the boring part', body: 'Every day, Peekly snapshots the page and runs a line-by-line diff against the last version.', note: 'Zero effort from you.' },
              { n: '03', title: 'Monday. Your inbox.', body: 'One clean email with every change from the past week. Added lines in green, removed in red.', note: 'Read it in 60 seconds.' },
            ].map(step => (
              <div key={step.n} style={{ background: S.surface, border: `1px solid ${S.border}`, borderRadius: 14, padding: '28px 24px' }}>
                <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: S.green, marginBottom: 14, letterSpacing: '.08em' }}>{step.n}</p>
                <p style={{ fontWeight: 600, fontSize: 16, marginBottom: 10 }}>{step.title}</p>
                <p style={{ fontSize: 13, color: S.muted, lineHeight: 1.65, marginBottom: 14 }}>{step.body}</p>
                <p style={{ fontSize: 12, color: S.green, fontWeight: 500 }}>→ {step.note}</p>
              </div>
            ))}
          </div>
        </section>

        {/* What the email looks like */}
        <section style={{ maxWidth: 720, margin: '0 auto', padding: '0 24px 80px' }}>
          <p style={{ textAlign: 'center', fontSize: 12, color: S.muted, letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: 40 }}>What lands in your inbox</p>
          <div style={{ background: S.surface, border: `1px solid ${S.border}`, borderRadius: 16, overflow: 'hidden' }}>
            <div style={{ background: S.surface2, padding: '16px 24px', borderBottom: `1px solid ${S.border}` }}>
              <p style={{ fontSize: 13, color: S.muted, margin: '0 0 4px' }}>From: <span style={{ color: S.text }}>digest@peekly.io</span></p>
              <p style={{ fontSize: 13, color: S.muted, margin: '0 0 4px' }}>Subject: <span style={{ color: S.text }}>🔍 3 competitor changes this week — Mon Apr 14</span></p>
            </div>
            <div style={{ padding: '24px' }}>
              {[
                { label: 'Acme Co — Pricing Page', url: 'acme.com/pricing', changes: '4 changes', added: ['Pro plan: $49/mo → $39/mo', 'New: Starter plan at $9/mo added', 'Annual discount increased to 30%'], removed: ['Free tier removed from pricing page'] },
                { label: 'Rival Inc — Features', url: 'rivalinc.com/features', changes: '2 changes', added: ['AI Assistant now listed under all plans'], removed: ['SSO removed from Starter tier'] },
              ].map((item, i) => (
                <div key={i} style={{ border: `1px solid ${S.border}`, borderRadius: 10, overflow: 'hidden', marginBottom: i === 0 ? 12 : 0 }}>
                  <div style={{ background: '#0d1117', padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <p style={{ fontSize: 13, fontWeight: 600, color: S.text, margin: '0 0 2px' }}>{item.label}</p>
                      <p style={{ fontSize: 11, color: S.muted, fontFamily: 'JetBrains Mono, monospace', margin: 0 }}>{item.url}</p>
                    </div>
                    <span style={{ background: S.greenDim, color: S.green, borderRadius: 99, padding: '2px 10px', fontSize: 11, fontFamily: 'JetBrains Mono, monospace' }}>{item.changes}</span>
                  </div>
                  <div style={{ padding: '12px 16px' }}>
                    <div style={{ background: '#021a0b', borderLeft: `3px solid ${S.green}`, borderRadius: '0 6px 6px 0', padding: '8px 12px', marginBottom: 8 }}>
                      {item.added.map((l, j) => <p key={j} style={{ fontSize: 11, fontFamily: 'JetBrains Mono, monospace', color: '#86efac', margin: '2px 0' }}>+ {l}</p>)}
                    </div>
                    <div style={{ background: '#1a0505', borderLeft: '3px solid #ef4444', borderRadius: '0 6px 6px 0', padding: '8px 12px' }}>
                      {item.removed.map((l, j) => <p key={j} style={{ fontSize: 11, fontFamily: 'JetBrains Mono, monospace', color: '#fca5a5', margin: '2px 0' }}>- {l}</p>)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <p style={{ textAlign: 'center', fontSize: 12, color: S.muted, marginTop: 16 }}>Every Monday. Read it with your coffee. Done.</p>
        </section>

        {/* Who it's for */}
        <section style={{ maxWidth: 960, margin: '0 auto', padding: '0 24px 80px' }}>
          <p style={{ textAlign: 'center', fontSize: 12, color: S.muted, letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: 40 }}>Who it's for</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
            {[
              { who: 'Startup Founders', icon: '🚀', pain: 'Got blindsided by a competitor move', fix: "You'll know about it before your customers do." },
              { who: 'Product Marketers', icon: '📊', pain: 'Spend Fridays manually checking competitor tabs', fix: 'That Friday ritual just became a Monday email.' },
              { who: 'Small SaaS Teams', icon: '⚡', pain: 'No budget for enterprise intel tools', fix: 'Same signal, $29/mo, no sales call required.' },
            ].map(item => (
              <div key={item.who} style={{ background: S.surface, border: `1px solid ${S.border}`, borderRadius: 14, padding: '28px 24px' }}>
                <p style={{ fontSize: 24, marginBottom: 14 }}>{item.icon}</p>
                <p style={{ fontWeight: 700, fontSize: 16, marginBottom: 10 }}>{item.who}</p>
                <p style={{ fontSize: 13, color: S.red, marginBottom: 10, display: 'flex', gap: 6 }}><span>×</span><span>{item.pain}</span></p>
                <p style={{ fontSize: 13, color: S.green, display: 'flex', gap: 6 }}><span>✓</span><span>{item.fix}</span></p>
              </div>
            ))}
          </div>
        </section>

        {/* Pricing */}
        <section id="pricing" style={{ maxWidth: 720, margin: '0 auto', padding: '0 24px 80px' }}>
          <p style={{ textAlign: 'center', fontSize: 12, color: S.muted, letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: 12 }}>Pricing</p>
          <p style={{ textAlign: 'center', fontSize: 28, fontWeight: 700, marginBottom: 8, letterSpacing: '-.02em' }}>Simple. No tricks.</p>
          <p style={{ textAlign: 'center', fontSize: 15, color: S.muted, marginBottom: 40 }}>Start free. Pay when it's obviously worth it.</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            {[
              { name: 'Free', price: '$0', sub: 'forever', features: ['3 competitor pages', 'Weekly Monday digest', 'Change history', 'Email alerts', 'No credit card'], cta: 'Start free', href: '/dashboard', highlight: false },
              { name: 'Pro', price: '$29', sub: 'per month', features: ['20 competitor pages', 'Daily change alerts', 'Full change history', 'AI page summaries', 'LinkedIn monitoring 🔜', 'Cancel anytime'], cta: 'Get early access', href: '/dashboard', highlight: true },
            ].map(plan => (
              <div key={plan.name} style={{ background: S.surface, border: `1px solid ${plan.highlight ? '#166534' : S.border}`, borderRadius: 16, padding: '28px 24px', position: 'relative' }}>
                {plan.highlight && (
                  <div style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', background: S.green, color: '#000', fontSize: 11, fontWeight: 700, borderRadius: 99, padding: '3px 12px', whiteSpace: 'nowrap', letterSpacing: '.04em' }}>
                    MOST POPULAR
                  </div>
                )}
                <p style={{ fontSize: 14, color: S.muted, marginBottom: 8 }}>{plan.name}</p>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 4 }}>
                  <span style={{ fontSize: 36, fontWeight: 700, fontFamily: 'JetBrains Mono, monospace', color: plan.highlight ? S.green : S.text }}>{plan.price}</span>
                  <span style={{ fontSize: 13, color: S.muted }}>{plan.sub}</span>
                </div>
                <div style={{ borderTop: `1px solid ${S.border}`, margin: '20px 0' }} />
                {plan.features.map(f => (
                  <div key={f} style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 10 }}>
                    <span style={{ color: S.green, fontSize: 13 }}>✓</span>
                    <span style={{ fontSize: 13, color: S.text }}>{f}</span>
                  </div>
                ))}
                <a href={plan.href} style={{ display: 'block', textAlign: 'center', marginTop: 24, padding: '11px 0', borderRadius: 9, textDecoration: 'none', background: plan.highlight ? S.green : S.surface2, border: `1px solid ${plan.highlight ? 'transparent' : S.border}`, color: plan.highlight ? '#000' : S.text, fontWeight: 600, fontSize: 14 }}>
                  {plan.cta}
                </a>
              </div>
            ))}
          </div>
          <p style={{ textAlign: 'center', fontSize: 12, color: S.muted, marginTop: 20 }}>
            No demo call. No annual contract. No sales team in your inbox. Just sign up.
          </p>
        </section>

        {/* Bottom CTA */}
        <section style={{ borderTop: `1px solid ${S.border}`, padding: '80px 24px', textAlign: 'center', background: S.surface }}>
          <h2 style={{ fontSize: 'clamp(24px, 4vw, 36px)', fontWeight: 700, marginBottom: 12, letterSpacing: '-.02em' }}>
            Stop finding out last.
          </h2>
          <p style={{ color: S.muted, fontSize: 16, marginBottom: 36, maxWidth: 400, margin: '0 auto 36px' }}>
            Join founders and PMs who get the Monday digest. Free to start.
          </p>
          <EmailCapture size="small" />
        </section>

        {/* Footer */}
        <footer style={{ borderTop: `1px solid ${S.border}`, padding: '24px', textAlign: 'center' }}>
          <p style={{ fontSize: 12, color: S.muted }}>
            © 2025 Peekly · <a href="/dashboard" style={{ color: S.muted, textDecoration: 'none' }}>Dashboard</a>
          </p>
        </footer>

      </div>
    </>
  )
}
