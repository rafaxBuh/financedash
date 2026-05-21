import { NextRequest, NextResponse } from 'next/server'
import { getDB, initDB } from '@/lib/db'

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

export async function GET() {
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
  } catch (error) {
    console.error('GET /api/pluggy/accounts error:', error)
    return NextResponse.json({ error: 'Erro ao buscar contas' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    await initDB()
    const sql = getDB()
    const { itemId, institutionName } = await req.json()

    if (!itemId) {
      return NextResponse.json({ error: 'itemId obrigatório' }, { status: 400 })
    }

    const id = generateId()
    const rows = await sql`
      INSERT INTO connected_accounts (id, item_id, institution_name)
      VALUES (${id}, ${itemId}, ${institutionName ?? null})
      ON CONFLICT (item_id) DO UPDATE SET institution_name = EXCLUDED.institution_name
      RETURNING id, item_id AS "itemId", institution_name AS "institutionName", last_synced_at AS "lastSyncedAt"
    `
    return NextResponse.json(rows[0], { status: 201 })
  } catch (error) {
    console.error('POST /api/pluggy/accounts error:', error)
    return NextResponse.json({ error: 'Erro ao salvar conta' }, { status: 500 })
  }
}
