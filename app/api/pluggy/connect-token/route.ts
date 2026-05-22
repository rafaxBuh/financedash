import { NextRequest, NextResponse } from 'next/server'
import { getConnectToken } from '@/lib/pluggy'
import { requireSession } from '@/lib/api-auth'

export async function POST(req: NextRequest) {
  const { error } = await requireSession()
  if (error) return error

  try {
    const body = await req.json().catch(() => ({}))
    const clientUserId = typeof body.clientUserId === 'string' ? body.clientUserId.slice(0, 200) : undefined
    const token = await getConnectToken(clientUserId)
    return NextResponse.json({ accessToken: token })
  } catch {
    return NextResponse.json({ error: 'Erro ao gerar token de conexão' }, { status: 500 })
  }
}
