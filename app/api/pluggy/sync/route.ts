import { NextResponse } from 'next/server'
import { getDB } from '@/lib/db'
import { getAccounts, getTransactions } from '@/lib/pluggy'
import { format, subMonths } from 'date-fns'

// Maps Pluggy categories to our categories (best effort)
const CATEGORY_MAP: Record<string, string> = {
  'Food and Drink': 'Alimentação',
  'Restaurants': 'Alimentação',
  'Supermarkets': 'Alimentação',
  'Transport': 'Transporte',
  'Travel': 'Transporte',
  'Health': 'Saúde',
  'Entertainment': 'Lazer',
  'Housing': 'Moradia',
  'Education': 'Educação',
  'Shopping': 'Compras',
  'Salary': 'Salário',
  'Investment': 'Investimentos',
}

function mapCategory(pluggyCategory: string | null, type: 'income' | 'expense'): string {
  if (pluggyCategory && CATEGORY_MAP[pluggyCategory]) return CATEGORY_MAP[pluggyCategory]
  return type === 'income' ? 'Outros' : 'Outros'
}

export async function POST() {
  try {
    const sql = getDB()

    const accounts = await sql`SELECT item_id AS "itemId" FROM connected_accounts`
    if (accounts.length === 0) {
      return NextResponse.json({ imported: 0, message: 'Nenhuma conta conectada' })
    }

    const from = format(subMonths(new Date(), 6), 'yyyy-MM-dd')
    const to = format(new Date(), 'yyyy-MM-dd')

    let imported = 0

    for (const { itemId } of accounts) {
      const pluggyAccounts = await getAccounts(itemId as string)

      for (const account of pluggyAccounts) {
        const txs = await getTransactions(account.id, from, to)

        for (const tx of txs) {
          const type: 'income' | 'expense' = tx.type === 'CREDIT' ? 'income' : 'expense'
          const category = mapCategory(tx.category, type)
          const txId = `pluggy_${tx.id}`
          const txDate = format(new Date(tx.date), 'yyyy-MM-dd')

          const existing = await sql`SELECT id FROM transactions WHERE id = ${txId} LIMIT 1`
          if (existing.length > 0) continue

          await sql`
            INSERT INTO transactions (id, description, amount, type, category, date)
            VALUES (${txId}, ${tx.description}, ${Math.abs(tx.amount)}, ${type}, ${category}, ${txDate})
          `
          imported++
        }
      }

      await sql`
        UPDATE connected_accounts SET last_synced_at = NOW() WHERE item_id = ${itemId}
      `
    }

    return NextResponse.json({ imported, message: `${imported} transações importadas` })
  } catch (error) {
    console.error('POST /api/pluggy/sync error:', error)
    return NextResponse.json({ error: 'Erro ao sincronizar transações' }, { status: 500 })
  }
}
