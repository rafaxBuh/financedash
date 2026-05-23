import { getDB, initDB } from '@/lib/db'
import { Transaction } from '@/lib/types'
import { processDueRecurring } from '@/lib/recurring'
import TransacoesClient from './TransacoesClient'

export const dynamic = 'force-dynamic'

export default async function TransacoesPage() {
  await initDB()
  await processDueRecurring()
  const sql = getDB()

  const [txRows, catRows] = await Promise.all([
    sql`
      SELECT id, description, amount, type, category,
             to_char(date, 'YYYY-MM-DD') AS date,
             created_at AS "createdAt"
      FROM transactions
      WHERE deleted = FALSE
      ORDER BY date DESC, created_at DESC
    `,
    sql`SELECT id, name, type FROM categories ORDER BY type, name`,
  ])

  const transactions: Transaction[] = txRows.map((r) => ({
    ...r,
    amount: Number(r.amount),
  })) as Transaction[]

  const categories = catRows as { id: string; name: string; type: string }[]

  return <TransacoesClient initialTransactions={transactions} initialCategories={categories} />
}
