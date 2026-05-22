import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { getDB, initDB } from '@/lib/db'
import { Transaction } from '@/lib/types'
import {
  getCurrentMonthTransactions,
  getTotalIncome,
  getTotalExpenses,
  getBalance,
  getMonthlyData,
  getCategoryExpenseData,
  sortTransactionsByDate,
} from '@/lib/utils'
import DashboardCards from '@/components/DashboardCards'
import TransactionList from '@/components/TransactionList'
import DashboardCharts from '@/components/DashboardCharts'
import GoalsSummary from '@/components/GoalsSummary'
import { Goal, GoalWithProgress } from './metas/page'

export const dynamic = 'force-dynamic'

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
  const progress = target > 0 ? Math.min(Math.round((current / target) * 100), 100) : 0

  let status: GoalWithProgress['status'] = 'ok'
  if (goal.type === 'expense_limit') {
    if (progress >= 100) status = 'danger'
    else if (progress >= 80) status = 'warning'
  } else {
    if (progress >= 100) status = 'completed'
    else if (progress < 70) status = 'warning'
  }

  return { ...goal, current, progress, status }
}

export default async function DashboardPage() {
  await initDB()
  const sql = getDB()

  const [txRows, goalRows, contribRows] = await Promise.all([
    sql`
      SELECT id, description, amount, type, category,
             to_char(date, 'YYYY-MM-DD') AS date,
             created_at AS "createdAt"
      FROM transactions WHERE deleted = FALSE ORDER BY date DESC, created_at DESC
    `,
    sql`
      SELECT id, name, type, target_amount AS "targetAmount",
             category, to_char(deadline, 'YYYY-MM-DD') AS deadline,
             created_at AS "createdAt"
      FROM goals ORDER BY created_at DESC LIMIT 4
    `,
    sql`
      SELECT goal_id AS "goalId", COALESCE(SUM(amount), 0) AS total
      FROM goal_contributions
      GROUP BY goal_id
    `,
  ])

  const transactions: Transaction[] = txRows.map((r) => ({ ...r, amount: Number(r.amount) })) as Transaction[]
  const contributions: Record<string, number> = {}
  for (const r of contribRows) {
    contributions[r.goalId] = Number(r.total)
  }
  const goals = (goalRows as Goal[]).map((g) => calcProgress(g, transactions, contributions))

  const currentMonth = getCurrentMonthTransactions(transactions)
  const totalIncome = getTotalIncome(currentMonth)
  const totalExpenses = getTotalExpenses(currentMonth)
  const balance = getBalance(transactions)
  const monthlyData = getMonthlyData(transactions)
  const categoryData = getCategoryExpenseData(currentMonth)
  const recent = sortTransactionsByDate(transactions).slice(0, 5)

  return (
    <div className="p-6 lg:p-10 space-y-8 animate-fade-up">
      <div className="mb-8">
        <h1 className="text-4xl lg:text-5xl font-bold tracking-tighter text-white mb-2">Dashboard</h1>
        <p className="text-text-secondary text-base">Bem-vindo de volta! Aqui está a visão geral das suas finanças.</p>
      </div>

      <DashboardCards balance={balance} totalIncome={totalIncome} totalExpenses={totalExpenses} />

      <DashboardCharts monthlyData={monthlyData} categoryData={categoryData} />

      {goals.length > 0 && <GoalsSummary goals={goals} />}

      <div className="glass-panel rounded-3xl p-6 lg:p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-white font-bold text-xl tracking-tight">Transações Recentes</h2>
          <Link href="/transacoes" className="text-accent hover:text-accent-hover text-sm font-semibold flex items-center gap-2 transition-all hover:translate-x-1">
            Ver todas <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <TransactionList transactions={recent} />
      </div>
    </div>
  )
}

