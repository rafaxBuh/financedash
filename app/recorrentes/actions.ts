'use server'

import { revalidatePath } from 'next/cache'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getDB, initDB } from '@/lib/db'
import { recurringSchema, safeId } from '@/lib/validate'
import type { RecurringTransaction } from '@/lib/types'

async function getAuthUserId(): Promise<string> {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) throw new Error('Não autorizado')
  return (session.user as { id: string }).id
}

function revalidateAll() {
  revalidatePath('/recorrentes')
  revalidatePath('/transacoes')
  revalidatePath('/')
}

export async function createRecurring(
  data: { description: string; amount: number; type: string; category: string; frequency: string; start_date: string; end_date?: string | null }
): Promise<RecurringTransaction> {
  const userId = await getAuthUserId()

  const parsed = recurringSchema.safeParse(data)
  if (!parsed.success) throw new Error(parsed.error.issues[0].message)

  await initDB()
  const sql = getDB()

  const { description, amount, type, category, frequency, start_date, end_date } = parsed.data

  if (end_date && end_date <= start_date) {
    throw new Error('A data de término deve ser posterior à data de início')
  }

  const id = safeId()
  const today = new Date().toISOString().split('T')[0]
  // next_date starts from today if start_date is in the past (prevents retroactive generation)
  const next_date = start_date < today ? today : start_date

  const rows = await sql`
    INSERT INTO recurring_transactions (id, user_id, description, amount, type, category, frequency, start_date, next_date, end_date)
    VALUES (${id}, ${userId}, ${description}, ${amount}, ${type}, ${category}, ${frequency}, ${start_date}, ${next_date}, ${end_date ?? null})
    RETURNING id, description, amount, type, category, frequency,
              to_char(start_date, 'YYYY-MM-DD') AS "startDate",
              to_char(next_date,  'YYYY-MM-DD') AS "nextDate",
              to_char(end_date,   'YYYY-MM-DD') AS "endDate",
              active, created_at AS "createdAt"
  `

  revalidateAll()
  return { ...rows[0], amount: Number(rows[0].amount) } as RecurringTransaction
}

export async function toggleRecurring(id: string, active: boolean): Promise<void> {
  const userId = await getAuthUserId()
  await initDB()
  const sql = getDB()

  const result = await sql`
    UPDATE recurring_transactions SET active = ${active}
    WHERE id = ${id} AND user_id = ${userId}
    RETURNING id
  `
  if (result.length === 0) throw new Error('Recorrente não encontrada')

  revalidateAll()
}

export async function deleteRecurring(id: string): Promise<void> {
  const userId = await getAuthUserId()
  await initDB()
  const sql = getDB()

  const result = await sql`
    DELETE FROM recurring_transactions WHERE id = ${id} AND user_id = ${userId} RETURNING id
  `
  if (result.length === 0) throw new Error('Recorrente não encontrada')

  revalidateAll()
}
