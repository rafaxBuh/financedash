'use server'

import { revalidatePath } from 'next/cache'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getDB, initDB } from '@/lib/db'
import { goalSchema, goalContributionSchema, safeId } from '@/lib/validate'

async function checkAuth() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) throw new Error('Não autorizado')
}

function revalidateAll() {
  revalidatePath('/metas')
  revalidatePath('/')
}

export async function createGoal(data: {
  name: string
  type: string
  target_amount: number
  category: string | null
  deadline: string | null
}): Promise<void> {
  await checkAuth()

  const parsed = goalSchema.safeParse(data)
  if (!parsed.success) throw new Error(parsed.error.issues[0].message)

  await initDB()
  const sql = getDB()

  const { name, type, target_amount, category, deadline } = parsed.data
  const id = safeId()

  await sql`
    INSERT INTO goals (id, name, type, target_amount, category, deadline)
    VALUES (${id}, ${name}, ${type}, ${target_amount}, ${category ?? null}, ${deadline ?? null})
  `

  revalidateAll()
}

export async function deleteGoal(id: string): Promise<void> {
  await checkAuth()
  await initDB()
  const sql = getDB()
  await sql`DELETE FROM goals WHERE id = ${id}`
  revalidateAll()
}

export async function addContribution(data: {
  goalId: string
  amount: number
  note?: string
  date: string
}): Promise<void> {
  await checkAuth()

  const parsed = goalContributionSchema.safeParse({
    amount: data.amount,
    note: data.note,
    date: data.date,
  })
  if (!parsed.success) throw new Error(parsed.error.issues[0].message)

  await initDB()
  const sql = getDB()

  const id = safeId()
  await sql`
    INSERT INTO goal_contributions (id, goal_id, amount, note, date)
    VALUES (${id}, ${data.goalId}, ${parsed.data.amount}, ${parsed.data.note ?? null}, ${parsed.data.date ?? new Date().toISOString().split('T')[0]})
  `

  revalidateAll()
}
