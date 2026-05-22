import { NextResponse } from 'next/server'
import { getDB } from '@/lib/db'
import { syncItem } from '@/lib/pluggy'
import { requireSession } from '@/lib/api-auth'
import { isRateLimited } from '@/lib/rate-limit'

export async function POST() {
  const { session, error } = await requireSession()
  if (error) return error

  // Rate limit sync: 5 times per 10 minutes per user
  const userKey = `sync:${session!.user!.email}`
  if (isRateLimited(userKey, 5, 10 * 60 * 1000)) {
    return NextResponse.json({ error: 'Muitas sincronizações. Aguarde alguns minutos.' }, { status: 429 })
  }

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
  } catch {
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
