import { NextRequest, NextResponse } from 'next/server'
import { getDB } from '@/lib/db'

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { itemId: string } }
) {
  try {
    const sql = getDB()
    await sql`DELETE FROM connected_accounts WHERE item_id = ${params.itemId}`
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('DELETE /api/pluggy/accounts/[itemId] error:', error)
    return NextResponse.json({ error: 'Erro ao remover conta' }, { status: 500 })
  }
}
