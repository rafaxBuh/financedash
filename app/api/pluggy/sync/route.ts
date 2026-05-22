import { NextResponse } from 'next/server'
import { getDB } from '@/lib/db'
import { syncItem } from '@/lib/pluggy'

export async function POST() {
  try {
    const sql = getDB()
    const accounts = await sql`SELECT item_id AS "itemId" FROM connected_accounts`

    if (accounts.length === 0) {
      return NextResponse.json({ imported: 0, message: 'Nenhuma conta conectada' })
    }

    let imported = 0
    for (const { itemId } of accounts) {
      imported += await syncItem(itemId as string)
    }

    return NextResponse.json({ imported, message: `${imported} transações importadas` })
  } catch (error) {
    console.error('POST /api/pluggy/sync error:', error)
    return NextResponse.json({ error: 'Erro ao sincronizar' }, { status: 500 })
  }
}
