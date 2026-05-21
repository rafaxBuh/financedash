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
      <div className="text-center py-12 text-text-muted">
        <p className="text-4xl mb-3">📭</p>
        <p className="text-sm">Nenhuma transação encontrada</p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {displayed.map((t) => (
        <div
          key={t.id}
          className="flex items-center gap-4 p-4 bg-surface-2 rounded-lg hover:bg-border/30 transition-colors group"
        >
          {/* Icon */}
          <div className="w-10 h-10 rounded-lg bg-surface flex items-center justify-center text-lg flex-shrink-0">
            {categoryIcons[t.category] ?? '💸'}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <p className="text-text-primary text-sm font-medium truncate">
              {t.description}
            </p>
            <p className="text-text-muted text-xs mt-0.5">
              {t.category} · {formatShortDate(t.date)}
            </p>
          </div>

          {/* Amount */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <span
              className={`text-sm font-semibold ${
                t.type === 'income' ? 'text-success' : 'text-danger'
              }`}
            >
              {t.type === 'income' ? '+' : '-'}
              {formatCurrency(t.amount)}
            </span>

            {onDelete && (
              <button
                onClick={() => onDelete(t.id)}
                className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 hover:bg-danger/10 rounded-lg text-text-muted hover:text-danger"
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
