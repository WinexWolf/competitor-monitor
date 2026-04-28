import type { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'
import { registerUser } from '@/lib/storage'
import { sendWelcome, notifyAdminOfSignup } from '@/lib/email'
import { kv } from '@vercel/kv'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end()

  const session = await getServerSession(req, res, authOptions)
  const user = session?.user as { id?: string; email?: string | null; name?: string | null } | undefined

  if (!user?.id || !user?.email) return res.status(401).json({ error: 'Not signed in' })

  const isNew = await registerUser(user.id, user.email)

  // Only send emails on first signup, not every login
  if (isNew) {
    const name = user.name ?? user.email
    await Promise.all([
      sendWelcome(user.email, name),
      notifyAdminOfSignup(user.email, name),
    ])
  }

  res.json({ ok: true, isNew })
}
