import { NextRequest, NextResponse } from 'next/server'
import { getDB } from '@/lib/db'
import { requireSession } from '@/lib/api-auth'

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { error } = await requireSession()
  if (error) return error

  try {
    const sql = getDB()
    const id = params.id?.trim()
    if (!id) return NextResponse.json({ error: 'ID inválido' }, { status: 400 })

    await sql`DELETE FROM categories WHERE id = ${id}`
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
