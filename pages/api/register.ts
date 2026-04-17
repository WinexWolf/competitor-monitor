import type { NextApiRequest, NextApiResponse } from 'next'
import { getUserId } from '@/lib/auth'
import { registerUser } from '@/lib/storage'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end()

  const session = await getServerSession(req, res, authOptions)
  const user = session?.user as { id?: string; email?: string | null } | undefined

  if (!user?.id || !user?.email) return res.status(401).json({ error: 'Not signed in' })

  await registerUser(user.id, user.email)
  res.json({ ok: true })
}
