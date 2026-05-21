import { NextResponse } from 'next/server'
import { getConnectToken } from '@/lib/pluggy'

export async function POST() {
  try {
    const token = await getConnectToken()
    return NextResponse.json({ token })
  } catch (error) {
    console.error('Pluggy connect-token error:', error)
    return NextResponse.json({ error: 'Erro ao gerar token de conexão' }, { status: 500 })
  }
}
