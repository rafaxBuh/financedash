import { getDB, initDB } from '@/lib/db'
import { RecurringTransaction } from '@/lib/types'
import { processDueRecurring } from '@/lib/recurring'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import RecorrentesClient from './RecorrentesClient'

export const dynamic = 'force-dynamic'

export default async function RecorrentesPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user) redirect('/login')
  const userId = (session.user as { id: string }).id

  await initDB()
  await processDueRecurring()
  const sql = getDB()

  const [recurRows, catRows] = await Promise.all([
    sql`
      SELECT id, description, amount, type, category, frequency,
             to_char(start_date, 'YYYY-MM-DD') AS "startDate",
             to_char(next_date,  'YYYY-MM-DD') AS "nextDate",
             to_char(end_date,   'YYYY-MM-DD') AS "endDate",
             active, created_at AS "createdAt"
      FROM recurring_transactions
      WHERE user_id = ${userId}
      ORDER BY created_at DESC
    `,
    sql`SELECT id, name, type FROM categories ORDER BY type, name`,
  ])

  const recurring: RecurringTransaction[] = recurRows.map((r) => ({
    ...r,
    amount: Number(r.amount),
  })) as RecurringTransaction[]

  const categories = catRows as { id: string; name: string; type: string }[]

  return <RecorrentesClient initialRecurring={recurring} initialCategories={categories} />
}
