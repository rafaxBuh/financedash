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

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  await initDB()
  const sql = getDB()

  const rows = await sql`
    SELECT id, description, amount, type, category,
           to_char(date, 'YYYY-MM-DD') AS date,
           created_at AS "createdAt"
    FROM transactions
    ORDER BY date DESC, created_at DESC
  `

  const transactions: Transaction[] = rows.map((r) => ({
    ...r,
    amount: Number(r.amount),
  })) as Transaction[]

  // Seed sample data if empty
  if (transactions.length === 0) {
    // Trigger seed via the existing API logic (redirect to api)
  }

  const currentMonth = getCurrentMonthTransactions(transactions)
  const totalIncome = getTotalIncome(currentMonth)
  const totalExpenses = getTotalExpenses(currentMonth)
  const balance = getBalance(transactions)
  const monthlyData = getMonthlyData(transactions)
  const categoryData = getCategoryExpenseData(currentMonth)
  const recent = sortTransactionsByDate(transactions).slice(0, 5)

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Dashboard</h1>
        <p className="text-text-muted text-sm mt-1">Visão geral das suas finanças</p>
      </div>

      <DashboardCards
        balance={balance}
        totalIncome={totalIncome}
        totalExpenses={totalExpenses}
      />

      <DashboardCharts monthlyData={monthlyData} categoryData={categoryData} />

      <div className="bg-surface border border-border rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-text-primary font-semibold text-sm">Transações Recentes</h2>
          <Link
            href="/transacoes"
            className="text-accent hover:text-accent-hover text-xs flex items-center gap-1 transition-colors"
          >
            Ver todas
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
        <TransactionList transactions={recent} />
      </div>
    </div>
  )
}
