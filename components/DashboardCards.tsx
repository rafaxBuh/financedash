'use client'

import { Wallet, TrendingUp, TrendingDown, Percent } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

interface Props {
  balance: number
  totalIncome: number
  totalExpenses: number
  savingsRate: number
}

export default function DashboardCards({ balance, totalIncome, totalExpenses, savingsRate }: Props) {
  const isPositiveBalance = balance >= 0
  const isPositiveSavings = savingsRate >= 0

  return (
    <div className="space-y-4">
      {/* Hero: Saldo Total */}
      <div className="glass-panel rounded-2xl p-6 lg:p-8 flex items-center justify-between gap-6 relative overflow-hidden group hover:border-accent/30 transition-all duration-300">
        <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-transparent to-transparent pointer-events-none" />
        <div className="relative z-10 flex-1 min-w-0">
          <p className="text-text-muted text-xs font-semibold uppercase tracking-widest mb-3">Saldo Total</p>
          <p className={`text-4xl lg:text-5xl font-bold tracking-tight ${isPositiveBalance ? 'text-white' : 'text-danger'}`}>
            {formatCurrency(balance)}
          </p>
          <p className="text-text-muted text-sm mt-3">Soma de todas as receitas menos despesas</p>
        </div>
        <div className="relative z-10 flex-shrink-0 w-16 h-16 bg-accent/10 border border-accent/20 rounded-2xl flex items-center justify-center shadow-[0_0_24px_rgba(255,90,0,0.2)] group-hover:scale-105 transition-transform duration-300">
          <Wallet className="w-8 h-8 text-accent" />
        </div>
      </div>

      {/* 3 Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Receitas */}
        <div className="glass-panel rounded-2xl p-5 flex items-start justify-between group hover:-translate-y-0.5 hover:border-success/30 transition-all duration-300">
          <div>
            <p className="text-text-muted text-xs font-semibold uppercase tracking-widest mb-2">Receitas</p>
            <p className="text-2xl font-bold text-white tracking-tight">{formatCurrency(totalIncome)}</p>
            <p className="text-text-muted text-xs mt-1.5">Este mês</p>
          </div>
          <div className="w-10 h-10 bg-success/10 border border-success/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
            <TrendingUp className="w-5 h-5 text-success" />
          </div>
        </div>

        {/* Despesas */}
        <div className="glass-panel rounded-2xl p-5 flex items-start justify-between group hover:-translate-y-0.5 hover:border-danger/30 transition-all duration-300">
          <div>
            <p className="text-text-muted text-xs font-semibold uppercase tracking-widest mb-2">Despesas</p>
            <p className="text-2xl font-bold text-white tracking-tight">{formatCurrency(totalExpenses)}</p>
            <p className="text-text-muted text-xs mt-1.5">Este mês</p>
          </div>
          <div className="w-10 h-10 bg-danger/10 border border-danger/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
            <TrendingDown className="w-5 h-5 text-danger" />
          </div>
        </div>

        {/* Taxa de Economia */}
        <div className="glass-panel rounded-2xl p-5 flex items-start justify-between group hover:-translate-y-0.5 transition-all duration-300"
          style={{ '--hover-color': isPositiveSavings ? 'rgba(0,255,136,0.3)' : 'rgba(255,51,51,0.3)' } as React.CSSProperties}>
          <div>
            <p className="text-text-muted text-xs font-semibold uppercase tracking-widest mb-2">Taxa de Economia</p>
            <p className={`text-2xl font-bold tracking-tight ${isPositiveSavings ? 'text-success' : 'text-danger'}`}>
              {isPositiveSavings ? '+' : ''}{savingsRate}%
            </p>
            <p className="text-text-muted text-xs mt-1.5">
              {savingsRate >= 20 ? 'Ótimo ritmo' : savingsRate >= 0 ? 'Dentro do limite' : 'Gastando mais que ganha'}
            </p>
          </div>
          <div className={`w-10 h-10 border rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 ${
            isPositiveSavings ? 'bg-success/10 border-success/20' : 'bg-danger/10 border-danger/20'
          }`}>
            <Percent className={`w-5 h-5 ${isPositiveSavings ? 'text-success' : 'text-danger'}`} />
          </div>
        </div>
      </div>
    </div>
  )
}
