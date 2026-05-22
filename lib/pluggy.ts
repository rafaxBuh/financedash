import { PluggyClient } from 'pluggy-sdk'
import { getDB } from './db'
import { format, subMonths } from 'date-fns'

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

function mapCategory(pluggyCategory: string | null | undefined, type: 'income' | 'expense'): string {
  if (pluggyCategory && CATEGORY_MAP[pluggyCategory]) return CATEGORY_MAP[pluggyCategory]
  return 'Outros'
}

export async function syncItem(itemId: string): Promise<number> {
  const sql = getDB()
  const from = format(subMonths(new Date(), 6), 'yyyy-MM-dd')
  const to = format(new Date(), 'yyyy-MM-dd')
  let imported = 0

  const pluggyAccounts = await getAccounts(itemId)
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

  await sql`UPDATE connected_accounts SET last_synced_at = NOW() WHERE item_id = ${itemId}`
  return imported
}

export function getPluggyClient(): PluggyClient {
  return new PluggyClient({
    clientId: process.env.PLUGGY_CLIENT_ID!,
    clientSecret: process.env.PLUGGY_CLIENT_SECRET!,
  })
}

export async function getConnectToken(clientUserId?: string): Promise<string> {
  const pluggy = getPluggyClient()
  const result = await pluggy.createConnectToken(undefined, { clientUserId })
  return result.accessToken
}

export async function getAccounts(itemId: string) {
  const pluggy = getPluggyClient()
  const result = await pluggy.fetchAccounts(itemId)
  return result.results
}

export async function getTransactions(accountId: string, from: string, to: string) {
  const pluggy = getPluggyClient()
  const all = []
  let page = 1

  while (true) {
    const result = await pluggy.fetchTransactions(accountId, {
      from,
      to,
      pageSize: 100,
      page,
    })
    all.push(...result.results)
    if (result.results.length < 100) break
    page++
  }

  return all
}
