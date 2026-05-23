'use server'

import { revalidatePath } from 'next/cache'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getDB, initDB } from '@/lib/db'
import { goalSchema, goalContributionSchema, safeId } from '@/lib/validate'

async function getAuthUserId(): Promise<string> {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) throw new Error('Não autorizado')
  return (session.user as { id: string }).id
}

function revalidateAll() {
  revalidatePath('/metas')
  revalidatePath('/transacoes')
  revalidatePath('/')
}

export async function createGoal(data: {
  name: string
  type: string
  target_amount: number
  category: string | null
  deadline: string | null
}): Promise<void> {
  const userId = await getAuthUserId()

  const parsed = goalSchema.safeParse(data)
  if (!parsed.success) throw new Error(parsed.error.issues[0].message)

  await initDB()
  const sql = getDB()

  const { name, type, target_amount, category, deadline } = parsed.data
  const id = safeId()

  await sql`
    INSERT INTO goals (id, user_id, name, type, target_amount, category, deadline)
    VALUES (${id}, ${userId}, ${name}, ${type}, ${target_amount}, ${category ?? null}, ${deadline ?? null})
  `

  revalidateAll()
}

export async function deleteGoal(id: string): Promise<void> {
  const userId = await getAuthUserId()
  await initDB()
  const sql = getDB()

  const result = await sql`
    DELETE FROM goals WHERE id = ${id} AND user_id = ${userId} RETURNING id
  `
  if (result.length === 0) throw new Error('Meta não encontrada')

  revalidateAll()
}

export async function addContribution(data: {
  goalId: string
  amount: number
  note?: string
  date: string
}): Promise<void> {
  const userId = await getAuthUserId()

  const parsed = goalContributionSchema.safeParse({
    amount: data.amount,
    note: data.note,
    date: data.date,
  })
  if (!parsed.success) throw new Error(parsed.error.issues[0].message)

  await initDB()
  const sql = getDB()

  const contributionDate = parsed.data.date ?? new Date().toISOString().split('T')[0]

  // Verify goal belongs to this user
  const goalRows = await sql`SELECT name FROM goals WHERE id = ${data.goalId} AND user_id = ${userId} LIMIT 1`
  if (goalRows.length === 0) throw new Error('Meta não encontrada')
  const goalName = goalRows[0].name

  // Insert contribution
  const contribId = safeId()
  await sql`
    INSERT INTO goal_contributions (id, goal_id, amount, note, date)
    VALUES (${contribId}, ${data.goalId}, ${parsed.data.amount}, ${parsed.data.note ?? null}, ${contributionDate})
  `

  // Create an expense transaction so the amount leaves the balance
  const txId = safeId()
  const description = parsed.data.note?.trim()
    ? `Meta: ${goalName} — ${parsed.data.note.trim()}`
    : `Meta: ${goalName}`
  await sql`
    INSERT INTO transactions (id, user_id, description, amount, type, category, date)
    VALUES (${txId}, ${userId}, ${description}, ${parsed.data.amount}, 'expense', 'Outros', ${contributionDate})
  `

  revalidateAll()
}
