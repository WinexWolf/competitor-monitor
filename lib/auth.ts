import { getServerSession } from 'next-auth'
import { authOptions } from './authOptions'
import type { NextApiRequest, NextApiResponse } from 'next'

export async function getUserId(req: NextApiRequest, res: NextApiResponse): Promise<string | null> {
  const session = await getServerSession(req, res, authOptions)
  const user = session?.user as { id?: string } | undefined
  return user?.id ?? null
}
