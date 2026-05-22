import { NextRequest, NextResponse } from 'next/server'
import { getDB } from '@/lib/db'
import { requireSession } from '@/lib/api-auth'

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { itemId: string } }
) {
  const { error } = await requireSession()
  if (error) return error

  try {
    const sql = getDB()
    const itemId = params.itemId?.trim()
    if (!itemId) return NextResponse.json({ error: 'itemId inválido' }, { status: 400 })

    await sql`DELETE FROM connected_accounts WHERE item_id = ${itemId}`
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
