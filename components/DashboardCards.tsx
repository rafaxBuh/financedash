'use client'

import { Wallet, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

interface Props {
  balance: number
  totalIncome: number
  totalExpenses: number
}

export default function DashboardCards({ balance, totalIncome, totalExpenses }: Props) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {/* Balance */}
      <div className="bg-surface border border-border rounded-xl p-5 flex items-start justify-between">
        <div>
          <p className="text-text-muted text-sm mb-1">Saldo Total</p>
          <p
            className={`text-2xl font-bold ${
              balance >= 0 ? 'text-success' : 'text-danger'
            }`}
          >
            {formatCurrency(balance)}
          </p>
          <p className="text-text-muted text-xs mt-1">Receitas - Despesas</p>
        </div>
        <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center">
          <Wallet className="w-5 h-5 text-accent" />
        </div>
      </div>

      {/* Income */}
      <div className="bg-surface border border-border rounded-xl p-5 flex items-start justify-between">
        <div>
          <p className="text-text-muted text-sm mb-1">Receitas do Mês</p>
          <p className="text-2xl font-bold text-success">{formatCurrency(totalIncome)}</p>
          <p className="text-text-muted text-xs mt-1 flex items-center gap-1">
            <ArrowUpRight className="w-3 h-3 text-success" />
            Mês atual
          </p>
        </div>
        <div className="w-10 h-10 bg-success/10 rounded-lg flex items-center justify-center">
          <TrendingUp className="w-5 h-5 text-success" />
        </div>
      </div>

      {/* Expenses */}
      <div className="bg-surface border border-border rounded-xl p-5 flex items-start justify-between">
        <div>
          <p className="text-text-muted text-sm mb-1">Despesas do Mês</p>
          <p className="text-2xl font-bold text-danger">{formatCurrency(totalExpenses)}</p>
          <p className="text-text-muted text-xs mt-1 flex items-center gap-1">
            <ArrowDownRight className="w-3 h-3 text-danger" />
            Mês atual
          </p>
        </div>
        <div className="w-10 h-10 bg-danger/10 rounded-lg flex items-center justify-center">
          <TrendingDown className="w-5 h-5 text-danger" />
        </div>
      </div>
    </div>
  )
}
