import { NextRequest, NextResponse } from 'next/server'
import { getDB, initDB } from '@/lib/db'
import { requireSession } from '@/lib/api-auth'
import { pluggyAccountSchema, safeId } from '@/lib/validate'

export async function GET() {
  const { error } = await requireSession()
  if (error) return error

  try {
    await initDB()
    const sql = getDB()
    const rows = await sql`
      SELECT id, item_id AS "itemId", institution_name AS "institutionName",
             last_synced_at AS "lastSyncedAt", created_at AS "createdAt"
      FROM connected_accounts
      ORDER BY created_at DESC
    `
    return NextResponse.json(rows)
  } catch {
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const { error } = await requireSession()
  if (error) return error

  try {
    await initDB()
    const sql = getDB()

    const body = await req.json().catch(() => null)
    if (!body) return NextResponse.json({ error: 'Corpo inválido' }, { status: 400 })

    const parsed = pluggyAccountSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })
    }

    const { itemId, institutionName } = parsed.data
    const id = safeId()

    const rows = await sql`
      INSERT INTO connected_accounts (id, item_id, institution_name)
      VALUES (${id}, ${itemId}, ${institutionName ?? null})
      ON CONFLICT (item_id) DO UPDATE SET institution_name = EXCLUDED.institution_name
      RETURNING id, item_id AS "itemId", institution_name AS "institutionName", last_synced_at AS "lastSyncedAt"
    `
    return NextResponse.json(rows[0], { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
