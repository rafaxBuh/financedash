import { NextRequest, NextResponse } from 'next/server'
import { getConnectToken } from '@/lib/pluggy'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}))
    const token = await getConnectToken(body.clientUserId)
    return NextResponse.json({ accessToken: token })
  } catch (error) {
    console.error('Pluggy connect-token error:', error)
    return NextResponse.json({ error: 'Erro ao gerar token de conexão' }, { status: 500 })
  }
}
