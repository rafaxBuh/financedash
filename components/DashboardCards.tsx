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
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 animate-fade-up">
      {/* Balance */}
      <div className="glass-panel rounded-2xl p-6 flex items-start justify-between group hover:-translate-y-1 transition-all duration-300 hover:shadow-[0_12px_32px_rgba(255,90,0,0.15)] hover:border-accent/30 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent pointer-events-none" />
        <div className="relative z-10">
          <p className="text-text-secondary text-sm font-medium mb-2 uppercase tracking-wider">Saldo Total</p>
          <p
            className={`text-3xl font-bold tracking-tight ${
              balance >= 0 ? 'text-white' : 'text-danger'
            }`}
          >
            {formatCurrency(balance)}
          </p>
          <p className="text-text-muted text-xs mt-2 font-medium">Receitas - Despesas</p>
        </div>
        <div className="w-12 h-12 bg-accent/10 border border-accent/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-[0_0_16px_rgba(255,90,0,0.2)]">
          <Wallet className="w-6 h-6 text-accent" />
        </div>
      </div>

      {/* Income */}
      <div className="glass-panel rounded-2xl p-6 flex items-start justify-between group hover:-translate-y-1 transition-all duration-300 hover:shadow-[0_12px_32px_rgba(0,255,136,0.15)] hover:border-success/30 relative overflow-hidden" style={{ animationDelay: '0.1s' }}>
        <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent pointer-events-none" />
        <div className="relative z-10">
          <p className="text-text-secondary text-sm font-medium mb-2 uppercase tracking-wider">Receitas do Mês</p>
          <p className="text-3xl font-bold tracking-tight text-white">{formatCurrency(totalIncome)}</p>
          <p className="text-success text-xs mt-2 font-medium flex items-center gap-1">
            <ArrowUpRight className="w-3.5 h-3.5" />
            Mês atual
          </p>
        </div>
        <div className="w-12 h-12 bg-success/10 border border-success/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-[0_0_16px_rgba(0,255,136,0.2)]">
          <TrendingUp className="w-6 h-6 text-success" />
        </div>
      </div>

      {/* Expenses */}
      <div className="glass-panel rounded-2xl p-6 flex items-start justify-between group hover:-translate-y-1 transition-all duration-300 hover:shadow-[0_12px_32px_rgba(255,51,51,0.15)] hover:border-danger/30 relative overflow-hidden" style={{ animationDelay: '0.2s' }}>
        <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent pointer-events-none" />
        <div className="relative z-10">
          <p className="text-text-secondary text-sm font-medium mb-2 uppercase tracking-wider">Despesas do Mês</p>
          <p className="text-3xl font-bold tracking-tight text-white">{formatCurrency(totalExpenses)}</p>
          <p className="text-danger text-xs mt-2 font-medium flex items-center gap-1">
            <ArrowDownRight className="w-3.5 h-3.5" />
            Mês atual
          </p>
        </div>
        <div className="w-12 h-12 bg-danger/10 border border-danger/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-[0_0_16px_rgba(255,51,51,0.2)]">
          <TrendingDown className="w-6 h-6 text-danger" />
        </div>
      </div>
    </div>
  )
}

