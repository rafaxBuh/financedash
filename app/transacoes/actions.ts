'use server'

import { revalidatePath } from 'next/cache'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getDB, initDB } from '@/lib/db'
import { transactionSchema, safeId } from '@/lib/validate'
import type { Transaction } from '@/lib/types'

async function getAuthUserId(): Promise<string> {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) throw new Error('Não autorizado')
  return (session.user as { id: string }).id
}

export async function createTransaction(
  data: Omit<Transaction, 'id' | 'createdAt'>
): Promise<Transaction> {
  const userId = await getAuthUserId()

  const parsed = transactionSchema.safeParse(data)
  if (!parsed.success) throw new Error(parsed.error.issues[0].message)

  await initDB()
  const sql = getDB()

  const { description, amount, type, category, date } = parsed.data
  const id = safeId()

  const rows = await sql`
    INSERT INTO transactions (id, user_id, description, amount, type, category, date)
    VALUES (${id}, ${userId}, ${description}, ${amount}, ${type}, ${category}, ${date})
    RETURNING id, description, amount, type, category,
              to_char(date, 'YYYY-MM-DD') AS date,
              created_at AS "createdAt"
  `

  revalidatePath('/transacoes')
  revalidatePath('/')
  return { ...rows[0], amount: Number(rows[0].amount) } as Transaction
}

export async function removeTransaction(id: string): Promise<void> {
  const userId = await getAuthUserId()

  if (!id?.trim()) throw new Error('ID inválido')

  await initDB()
  const sql = getDB()

  const result = await sql`
    UPDATE transactions SET deleted = TRUE
    WHERE id = ${id} AND user_id = ${userId}
    RETURNING id
  `
  if (result.length === 0) throw new Error('Transação não encontrada')

  revalidatePath('/transacoes')
  revalidatePath('/')
}
