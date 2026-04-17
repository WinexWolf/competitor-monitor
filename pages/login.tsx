import { signIn, useSession } from 'next-auth/react'
import { useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'

const S = {
  bg: '#0a0a0f',
  surface: '#111118',
  surface2: '#1a1a24',
  border: '#2a2a38',
  text: '#f0f0f5',
  muted: '#6b6b85',
  green: '#22c55e',
  greenDim: '#052e16',
}

export default function Login() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'authenticated') router.replace('/dashboard')
  }, [status, router])

  if (status === 'loading' || status === 'authenticated') {
    return (
      <div style={{ minHeight: '100vh', background: S.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 20, height: 20, border: `2px solid ${S.border}`, borderTopColor: S.green, borderRadius: '50%', animation: 'spin .7s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      </div>
    )
  }

  return (
    <>
      <Head>
        <title>Sign in — Peekly</title>
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />
      </Head>

      <div style={{ minHeight: '100vh', background: S.bg, color: S.text, fontFamily: "'DM Sans', system-ui, sans-serif", display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24 }}>

        {/* Logo */}
        <a href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none', marginBottom: 48 }}>
          <div style={{ width: 32, height: 32, borderRadius: 9, background: S.green, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>👁</div>
          <span style={{ fontWeight: 700, fontSize: 20, color: S.text, letterSpacing: '-.02em' }}>Peekly</span>
        </a>

        {/* Card */}
        <div style={{ background: S.surface, border: `1px solid ${S.border}`, borderRadius: 18, padding: '40px 36px', width: '100%', maxWidth: 380, textAlign: 'center' }}>
          <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8, letterSpacing: '-.02em' }}>Welcome back</h1>
          <p style={{ fontSize: 14, color: S.muted, marginBottom: 32, lineHeight: 1.5 }}>
            Sign in to see what your competitors<br />changed this week.
          </p>

          <button
            onClick={() => signIn('google', { callbackUrl: '/dashboard' })}
            style={{
              width: '100%', padding: '13px 20px', borderRadius: 10,
              border: `1px solid ${S.border}`, background: S.surface2,
              color: S.text, fontSize: 15, fontWeight: 600,
              cursor: 'pointer', display: 'flex', alignItems: 'center',
              justifyContent: 'center', gap: 12, transition: 'border-color .15s',
            }}
            onMouseEnter={e => (e.currentTarget.style.borderColor = '#4a4a5a')}
            onMouseLeave={e => (e.currentTarget.style.borderColor = S.border)}
          >
            <svg width="18" height="18" viewBox="0 0 18 18">
              <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"/>
              <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"/>
              <path fill="#FBBC05" d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"/>
              <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58z"/>
            </svg>
            Continue with Google
          </button>

          <p style={{ fontSize: 12, color: S.muted, marginTop: 24, lineHeight: 1.6 }}>
            By signing in you agree to our terms.<br />
            Free for 3 pages. No credit card required.
          </p>
        </div>

        <a href="/" style={{ marginTop: 24, fontSize: 13, color: S.muted, textDecoration: 'none' }}>
          ← Back to home
        </a>
      </div>
    </>
  )
}
export const getServerSideProps = async () => ({ props: {} })
