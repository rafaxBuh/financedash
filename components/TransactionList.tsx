'use client'

import { Trash2 } from 'lucide-react'
import { Transaction } from '@/lib/types'
import { formatCurrency, formatShortDate } from '@/lib/utils'

interface Props {
  transactions: Transaction[]
  onDelete?: (id: string) => void
  limit?: number
  showFilters?: boolean
}

const categoryIcons: Record<string, string> = {
  Alimentação: '🍽️',
  Transporte: '🚗',
  Saúde: '❤️',
  Lazer: '🎮',
  Moradia: '🏠',
  Educação: '📚',
  Compras: '🛍️',
  Outros: '📦',
  Salário: '💼',
  Freelance: '💻',
  Investimentos: '📈',
}

export default function TransactionList({
  transactions,
  onDelete,
  limit,
}: Props) {
  const displayed = limit ? transactions.slice(0, limit) : transactions

  if (displayed.length === 0) {
    return (
      <div className="text-center py-16 text-text-muted">
        <p className="text-5xl mb-4 opacity-50">📭</p>
        <p className="text-sm font-medium">Nenhuma transação encontrada</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {displayed.map((t, i) => (
        <div
          key={t.id}
          className="flex items-center gap-4 p-4 glass-panel rounded-2xl hover:-translate-y-0.5 hover:scale-[1.01] hover:shadow-[0_8px_24px_rgba(255,90,0,0.08)] transition-all duration-300 group"
          style={{ animation: `fade-up 0.5s ${i * 0.05}s cubic-bezier(0.25, 1, 0.5, 1) both` }}
        >
          {/* Icon */}
          <div className="w-12 h-12 rounded-xl bg-surface-2 flex items-center justify-center text-xl flex-shrink-0 border border-glass-border group-hover:border-accent/20 transition-colors">
            {categoryIcons[t.category] ?? '💸'}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <p className="text-white text-base font-semibold truncate group-hover:text-accent transition-colors">
              {t.description}
            </p>
            <p className="text-text-muted text-xs mt-1 font-medium tracking-wide uppercase">
              {t.category} · {formatShortDate(t.date)}
            </p>
          </div>

          {/* Amount */}
          <div className="flex items-center gap-4 flex-shrink-0">
            <span
              className={`text-base font-bold tracking-tight ${
                t.type === 'income' ? 'text-success' : 'text-danger'
              }`}
            >
              {t.type === 'income' ? '+' : '-'}
              {formatCurrency(t.amount)}
            </span>

            {onDelete && (
              <button
                onClick={() => onDelete(t.id)}
                className="opacity-0 group-hover:opacity-100 transition-all duration-300 p-2.5 bg-danger/10 border border-transparent hover:border-danger/30 rounded-xl text-danger hover:shadow-[0_0_12px_rgba(255,51,51,0.3)]"
                aria-label="Excluir transação"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

