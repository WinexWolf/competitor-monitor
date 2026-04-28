import type { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'
import { summarizePage } from '@/lib/summarize'
import { sendPageAddedConfirmation } from '@/lib/email'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const results: Record<string, unknown> = {}

  // 1. Check env vars
  results.env = {
    GEMINI_API_KEY: !!process.env.GEMINI_API_KEY ? `set (${process.env.GEMINI_API_KEY?.slice(0,8)}...)` : 'MISSING',
    GMAIL_USER: process.env.GMAIL_USER ?? 'MISSING',
    GMAIL_APP_PASSWORD: !!process.env.GMAIL_APP_PASSWORD ? 'set' : 'MISSING',
    APP_URL: process.env.APP_URL ?? 'MISSING',
    NEXTAUTH_SECRET: !!process.env.NEXTAUTH_SECRET ? 'set' : 'MISSING',
    ADMIN_EMAIL: process.env.ADMIN_EMAIL ?? 'MISSING',
  }

  // 2. Check session
  try {
    const session = await getServerSession(req, res, authOptions)
    results.session = session ? { email: session.user?.email, hasId: !!(session.user as { id?: string })?.id } : null
  } catch (e) {
    results.session = `ERROR: ${e}`
  }

  // 3. Test Gemini
  try {
    const summary = await summarizePage('Acme offers 3 pricing tiers: Starter at $9/mo, Pro at $39/mo, Enterprise custom. Free trial available.', 'https://acme.com/pricing', 'Acme Pricing')
    results.gemini = summary ? `OK: "${summary.slice(0, 100)}..."` : 'EMPTY RESPONSE — check API key'
  } catch (e) {
    results.gemini = `ERROR: ${e}`
  }

  // 4. Test email (only if testEmail query param provided)
  const testEmail = req.query.email as string
  if (testEmail) {
    try {
      const r = await sendPageAddedConfirmation(testEmail, 'Test Page', 'https://example.com', 'This is a test summary from Peekly debug endpoint.')
      results.email = r.ok ? 'SENT OK' : `FAILED: ${(r as { error?: string }).error}`
    } catch (e) {
      results.email = `ERROR: ${e}`
    }
  } else {
    results.email = 'Not tested — add ?email=you@gmail.com to test'
  }

  res.json(results)
}
