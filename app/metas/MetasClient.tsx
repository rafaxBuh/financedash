'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Trash2, Target, TrendingUp, TrendingDown, PiggyBank, X } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import type { GoalWithProgress } from './page'

interface Props {
  initialGoals: GoalWithProgress[]
  categories: { name: string; type: string }[]
}

const TYPE_LABELS = {
  savings: 'Economia',
  expense_limit: 'Limite de Gasto',
  income_target: 'Meta de Receita',
} as const

const TYPE_ICONS = {
  savings: PiggyBank,
  expense_limit: TrendingDown,
  income_target: TrendingUp,
}

const STATUS_COLORS = {
  ok: 'bg-accent',
  warning: 'bg-yellow-500',
  danger: 'bg-danger',
  completed: 'bg-success',
}

const STATUS_LABELS = {
  ok: 'Em andamento',
  warning: 'Atenção',
  danger: 'Limite excedido',
  completed: 'Concluída',
}

export default function MetasClient({ initialGoals, categories }: Props) {
  const router = useRouter()
  const [goals, setGoals] = useState<GoalWithProgress[]>(initialGoals)
  const [showForm, setShowForm] = useState(false)

  // Form state
  const [name, setName] = useState('')
  const [type, setType] = useState<'savings' | 'expense_limit' | 'income_target'>('savings')
  const [targetAmount, setTargetAmount] = useState('')
  const [category, setCategory] = useState('')
  const [deadline, setDeadline] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const needsCategory = type === 'expense_limit' || type === 'income_target'
  const filteredCategories = categories.filter((c) =>
    type === 'expense_limit' ? c.type === 'expense' : c.type === 'income'
  )

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    const amount = parseFloat(targetAmount.replace(',', '.'))
    if (!name.trim()) { setError('Informe o nome da meta.'); return }
    if (isNaN(amount) || amount <= 0) { setError('Informe um valor válido.'); return }

    setLoading(true)
    try {
      const res = await fetch('/api/goals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          type,
          target_amount: amount,
          category: needsCategory && category ? category : null,
          deadline: deadline || null,
        }),
      })
      if (!res.ok) {
        const data = await res.json()
        setError(data.error ?? 'Erro ao criar meta.')
        return
      }
      setName(''); setTargetAmount(''); setCategory(''); setDeadline(''); setType('savings')
      setShowForm(false)
      router.refresh()
    } catch {
      setError('Erro ao criar meta.')
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(id: string) {
    await fetch(`/api/goals/${id}`, { method: 'DELETE' })
    setGoals((prev) => prev.filter((g) => g.id !== id))
  }

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Metas</h1>
          <p className="text-text-muted text-sm mt-1">Defina e acompanhe suas metas financeiras</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-accent hover:bg-accent-hover text-white text-sm font-medium rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nova Meta
        </button>
      </div>

      {/* Empty state */}
      {goals.length === 0 && (
        <div className="bg-surface border border-border rounded-xl p-12 flex flex-col items-center text-center gap-4">
          <div className="w-16 h-16 bg-surface-2 rounded-2xl flex items-center justify-center">
            <Target className="w-8 h-8 text-text-muted" />
          </div>
          <div>
            <p className="text-text-primary font-semibold">Nenhuma meta definida</p>
            <p className="text-text-muted text-sm mt-1">Crie metas para acompanhar seu progresso financeiro</p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-accent hover:bg-accent-hover text-white text-sm font-medium rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            Criar primeira meta
          </button>
        </div>
      )}

      {/* Goals grid */}
      {goals.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {goals.map((goal) => {
            const Icon = TYPE_ICONS[goal.type]
            const barColor = STATUS_COLORS[goal.status]
            return (
              <div key={goal.id} className="bg-surface border border-border rounded-xl p-5 group">
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-surface-2 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Icon className="w-5 h-5 text-accent" />
                    </div>
                    <div>
                      <p className="text-text-primary font-semibold text-sm">{goal.name}</p>
                      <p className="text-text-muted text-xs mt-0.5">
                        {TYPE_LABELS[goal.type]}
                        {goal.category ? ` · ${goal.category}` : ''}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      goal.status === 'completed' ? 'bg-success/20 text-success' :
                      goal.status === 'danger' ? 'bg-danger/20 text-danger' :
                      goal.status === 'warning' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-accent/20 text-accent'
                    }`}>
                      {STATUS_LABELS[goal.status]}
                    </span>
                    <button
                      onClick={() => handleDelete(goal.id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 hover:bg-danger/10 rounded-lg text-text-muted hover:text-danger"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-text-muted">
                      {goal.type === 'expense_limit' ? 'Gasto' : 'Atual'}:{' '}
                      <span className="text-text-primary font-medium">{formatCurrency(goal.current)}</span>
                    </span>
                    <span className="text-text-muted">
                      Meta: <span className="text-text-primary font-medium">{formatCurrency(Number(goal.targetAmount))}</span>
                    </span>
                  </div>
                  <div className="h-2 bg-surface-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${barColor}`}
                      style={{ width: `${goal.progress}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-text-muted">
                    <span>{goal.progress}%</span>
                    {goal.deadline && (
                      <span>
                        Prazo: {new Date(goal.deadline + 'T12:00:00').toLocaleDateString('pt-BR')}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Modal form */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-surface border border-border rounded-xl w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <h2 className="text-text-primary font-semibold">Nova Meta</h2>
              <button
                onClick={() => { setShowForm(false); setError('') }}
                className="text-text-muted hover:text-text-primary transition-colors p-1 rounded-lg hover:bg-surface-2"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
              {/* Type */}
              <div>
                <label className="block text-text-secondary text-xs font-medium mb-2 uppercase tracking-wide">Tipo de Meta</label>
                <div className="grid grid-cols-3 gap-1 bg-surface-2 p-1 rounded-lg">
                  {(['savings', 'expense_limit', 'income_target'] as const).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => { setType(t); setCategory('') }}
                      className={`py-2 px-1 text-xs font-medium rounded-md transition-colors text-center ${
                        type === t ? 'bg-accent text-white shadow-sm' : 'text-text-muted hover:text-text-primary'
                      }`}
                    >
                      {TYPE_LABELS[t]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Name */}
              <div>
                <label className="block text-text-secondary text-xs font-medium mb-2 uppercase tracking-wide">Nome</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Reserva de emergência, Limite supermercado..."
                  className="w-full bg-surface-2 border border-border rounded-lg px-3 py-2.5 text-text-primary text-sm placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                />
              </div>

              {/* Target amount */}
              <div>
                <label className="block text-text-secondary text-xs font-medium mb-2 uppercase tracking-wide">
                  {type === 'expense_limit' ? 'Limite (R$)' : 'Valor Alvo (R$)'}
                </label>
                <input
                  type="text"
                  inputMode="decimal"
                  value={targetAmount}
                  onChange={(e) => setTargetAmount(e.target.value)}
                  placeholder="0,00"
                  className="w-full bg-surface-2 border border-border rounded-lg px-3 py-2.5 text-text-primary text-sm placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                />
              </div>

              {/* Category (optional, for expense_limit and income_target) */}
              {needsCategory && (
                <div>
                  <label className="block text-text-secondary text-xs font-medium mb-2 uppercase tracking-wide">
                    Categoria <span className="text-text-muted normal-case font-normal">(opcional)</span>
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-surface-2 border border-border rounded-lg px-3 py-2.5 text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                  >
                    <option value="">Todas as categorias</option>
                    {filteredCategories.map((c) => (
                      <option key={c.name} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Deadline */}
              <div>
                <label className="block text-text-secondary text-xs font-medium mb-2 uppercase tracking-wide">
                  Prazo <span className="text-text-muted normal-case font-normal">(opcional)</span>
                </label>
                <input
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="w-full bg-surface-2 border border-border rounded-lg px-3 py-2.5 text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent [color-scheme:dark]"
                />
              </div>

              {error && (
                <p className="text-danger text-sm bg-danger/10 border border-danger/20 rounded-lg px-3 py-2">{error}</p>
              )}

              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => { setShowForm(false); setError('') }}
                  className="flex-1 py-2.5 text-sm font-medium text-text-secondary bg-surface-2 hover:bg-border rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-2.5 text-sm font-medium text-white bg-accent hover:bg-accent-hover rounded-lg transition-colors disabled:opacity-60"
                >
                  {loading ? 'Salvando...' : 'Criar Meta'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
