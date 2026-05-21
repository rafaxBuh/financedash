'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Transaction } from '@/lib/types'
import { loadTransactions } from '@/lib/storage'
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
import ExpensePieChart from '@/components/Charts/ExpensePieChart'
import MonthlyBarChart from '@/components/Charts/MonthlyBarChart'

export default function DashboardPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setTransactions(loadTransactions())
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="p-8 flex items-center justify-center h-64">
        <div className="text-text-muted text-sm">Carregando...</div>
      </div>
    )
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
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Dashboard</h1>
        <p className="text-text-muted text-sm mt-1">
          Visão geral das suas finanças
        </p>
      </div>

      {/* Summary Cards */}
      <DashboardCards
        balance={balance}
        totalIncome={totalIncome}
        totalExpenses={totalExpenses}
      />

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Bar Chart */}
        <div className="bg-surface border border-border rounded-xl p-5">
          <h2 className="text-text-primary font-semibold text-sm mb-4">
            Receitas vs Despesas (últimos 6 meses)
          </h2>
          <MonthlyBarChart data={monthlyData} />
        </div>

        {/* Pie Chart */}
        <div className="bg-surface border border-border rounded-xl p-5">
          <h2 className="text-text-primary font-semibold text-sm mb-4">
            Despesas por Categoria (mês atual)
          </h2>
          <ExpensePieChart data={categoryData} />
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-surface border border-border rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-text-primary font-semibold text-sm">
            Transações Recentes
          </h2>
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
