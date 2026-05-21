import { NextRequest, NextResponse } from 'next/server'
import { getDB } from '@/lib/db'

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const sql = getDB()
    const { id } = params

    await sql`DELETE FROM transactions WHERE id = ${id}`

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('DELETE /api/transactions/[id] error:', error)
    return NextResponse.json({ error: 'Erro ao deletar transação' }, { status: 500 })
  }
}
