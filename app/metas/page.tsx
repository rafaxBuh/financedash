import { getDB, initDB } from '@/lib/db'
import { Transaction } from '@/lib/types'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import MetasClient from './MetasClient'
import {
  getTotalIncome,
  getTotalExpenses,
  getCurrentMonthTransactions,
} from '@/lib/utils'

export const dynamic = 'force-dynamic'

export interface Goal {
  id: string
  name: string
  type: 'savings' | 'expense_limit' | 'income_target'
  targetAmount: number
  category: string | null
  deadline: string | null
  createdAt: string
}

export interface GoalWithProgress extends Goal {
  current: number
  progress: number   // 0–100
  status: 'ok' | 'warning' | 'danger' | 'completed'
}

function calcProgress(
  goal: Goal,
  transactions: Transaction[],
  contributions: Record<string, number>,
): GoalWithProgress {
  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0]
  const monthTxs = transactions.filter((t) => t.date >= monthStart && t.date <= monthEnd)

  let current = 0

  if (goal.type === 'savings') {
    current = contributions[goal.id] ?? 0
  } else if (goal.type === 'expense_limit') {
    const filtered = goal.category
      ? monthTxs.filter((t) => t.type === 'expense' && t.category === goal.category)
      : monthTxs.filter((t) => t.type === 'expense')
    current = getTotalExpenses(filtered)
  } else {
    const filtered = goal.category
      ? monthTxs.filter((t) => t.type === 'income' && t.category === goal.category)
      : monthTxs.filter((t) => t.type === 'income')
    current = getTotalIncome(filtered)
  }

  const target = Number(goal.targetAmount)
  const raw = target > 0 ? (current / target) * 100 : 0
  const progress = Math.min(Math.round(raw), 100)

  let status: GoalWithProgress['status'] = 'ok'
  if (goal.type === 'expense_limit') {
    if (progress >= 100) status = 'danger'
    else if (progress >= 80) status = 'warning'
  } else {
    if (progress >= 100) status = 'completed'
    else if (progress >= 70) status = 'ok'
    else status = 'warning'
  }

  return { ...goal, current, progress, status }
}

export default async function MetasPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user) redirect('/login')
  const userId = (session.user as { id: string }).id

  await initDB()
  const sql = getDB()

  const [goalRows, txRows, catRows, contribRows] = await Promise.all([
    sql`
      SELECT id, name, type, target_amount AS "targetAmount",
             category, to_char(deadline, 'YYYY-MM-DD') AS deadline,
             created_at AS "createdAt"
      FROM goals WHERE user_id = ${userId} ORDER BY created_at DESC
    `,
    sql`
      SELECT id, description, amount, type, category,
             to_char(date, 'YYYY-MM-DD') AS date,
             created_at AS "createdAt"
      FROM transactions WHERE deleted = FALSE AND user_id = ${userId} ORDER BY date DESC
    `,
    sql`SELECT name, type FROM categories ORDER BY type, name`,
    sql`
      SELECT gc.goal_id AS "goalId", COALESCE(SUM(gc.amount), 0) AS total
      FROM goal_contributions gc
      JOIN goals g ON gc.goal_id = g.id
      WHERE g.user_id = ${userId}
      GROUP BY gc.goal_id
    `,
  ])

  const goals = goalRows as Goal[]
  const transactions: Transaction[] = txRows.map((r) => ({ ...r, amount: Number(r.amount) })) as Transaction[]
  const categories = catRows as { name: string; type: string }[]
  const contributions: Record<string, number> = {}
  for (const r of contribRows) {
    contributions[r.goalId] = Number(r.total)
  }

  const goalsWithProgress = goals.map((g) => calcProgress(g, transactions, contributions))

  return (
    <MetasClient
      initialGoals={goalsWithProgress}
      categories={categories}
    />
  )
}
