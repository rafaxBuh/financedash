'use server'

import { revalidatePath } from 'next/cache'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getDB, initDB } from '@/lib/db'
import { transactionSchema, safeId } from '@/lib/validate'
import type { Transaction } from '@/lib/types'

async function checkAuth() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) throw new Error('Não autorizado')
}

export async function createTransaction(
  data: Omit<Transaction, 'id' | 'createdAt'>
): Promise<Transaction> {
  await checkAuth()

  const parsed = transactionSchema.safeParse(data)
  if (!parsed.success) throw new Error(parsed.error.issues[0].message)

  await initDB()
  const sql = getDB()

  const { description, amount, type, category, date } = parsed.data
  const id = safeId()

  const rows = await sql`
    INSERT INTO transactions (id, description, amount, type, category, date)
    VALUES (${id}, ${description}, ${amount}, ${type}, ${category}, ${date})
    RETURNING id, description, amount, type, category,
              to_char(date, 'YYYY-MM-DD') AS date,
              created_at AS "createdAt"
  `

  revalidatePath('/transacoes')
  return { ...rows[0], amount: Number(rows[0].amount) } as Transaction
}

export async function removeTransaction(id: string): Promise<void> {
  await checkAuth()

  if (!id?.trim()) throw new Error('ID inválido')

  await initDB()
  const sql = getDB()

  await sql`UPDATE transactions SET deleted = TRUE WHERE id = ${id}`
  revalidatePath('/transacoes')
}
