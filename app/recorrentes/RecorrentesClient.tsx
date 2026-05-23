'use client'

import { useState } from 'react'
import { Plus, X, Trash2, RefreshCw, Eye, EyeOff } from 'lucide-react'
import { RecurringTransaction, Frequency, FREQUENCY_LABELS } from '@/lib/types'
import { formatCurrency } from '@/lib/utils'
import { createRecurring, toggleRecurring, deleteRecurring } from './actions'

interface Props {
  initialRecurring: RecurringTransaction[]
  initialCategories: { id: string; name: string; type: string }[]
}

const today = new Date().toISOString().split('T')[0]

const frequencyOptions: { value: Frequency; label: string }[] = [
  { value: 'daily',   label: 'Diária'  },
  { value: 'weekly',  label: 'Semanal' },
  { value: 'monthly', label: 'Mensal'  },
  { value: 'yearly',  label: 'Anual'   },
]

export default function RecorrentesClient({ initialRecurring, initialCategories }: Props) {
  const [items, setItems] = useState<RecurringTransaction[]>(initialRecurring)
  const [open, setOpen] = useState(false)

  // Form state
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')
  const [type, setType] = useState<'income' | 'expense'>('expense')
  const [category, setCategory] = useState('')
  const [frequency, setFrequency] = useState<Frequency>('monthly')
  const [startDate, setStartDate] = useState(today)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const categories = initialCategories.filter((c) => c.type === type).map((c) => c.name)

  function handleTypeChange(t: 'income' | 'expense') {
    setType(t)
    setCategory('')
  }

  function handleAmountChange(e: React.ChangeEvent<HTMLInputElement>) {
    let val = e.target.value.replace(/\D/g, '')
    if (!val) { setAmount(''); return }
    const num = (parseInt(val, 10) / 100).toFixed(2)
    setAmount(num.replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.'))
  }

  function resetForm() {
    setDescription(''); setAmount(''); setType('expense')
    setCategory(''); setFrequency('monthly'); setStartDate(today)
    setError('')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    const parsedAmount = parseFloat(amount.replace(/\./g, '').replace(',', '.'))
    if (!description.trim()) { setError('Informe uma descrição.'); return }
    if (isNaN(parsedAmount) || parsedAmount <= 0) { setError('Informe um valor válido.'); return }
    if (!category) { setError('Selecione uma categoria.'); return }

    try {
      setLoading(true)
      const newItem = await createRecurring({
        description: description.trim(), amount: parsedAmount,
        type, category, frequency, start_date: startDate,
      })
      setItems((prev) => [newItem, ...prev])
      resetForm()
      setOpen(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar.')
    } finally {
      setLoading(false)
    }
  }

  async function handleToggle(id: string, currentActive: boolean) {
    await toggleRecurring(id, !currentActive)
    setItems((prev) => prev.map((i) => i.id === id ? { ...i, active: !currentActive } : i))
  }

  async function handleDelete(id: string) {
    await deleteRecurring(id)
    setItems((prev) => prev.filter((i) => i.id !== id))
  }

  const income  = items.filter((i) => i.type === 'income')
  const expense = items.filter((i) => i.type === 'expense')

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Transações Recorrentes</h1>
          <p className="text-text-muted text-sm mt-1">
            Geradas automaticamente na data configurada
          </p>
        </div>
        <button
          onClick={() => setOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-accent hover:bg-accent-hover text-white text-sm font-medium rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nova Recorrente
        </button>
      </div>

      {/* Lists */}
      {items.length === 0 ? (
        <div className="bg-surface border border-border rounded-xl p-16 text-center text-text-muted">
          <RefreshCw className="w-10 h-10 mx-auto mb-4 opacity-30" />
          <p className="text-sm font-medium">Nenhuma transação recorrente configurada</p>
        </div>
      ) : (
        <div className="space-y-6">
          {income.length > 0 && (
            <Section title="Receitas" items={income} onToggle={handleToggle} onDelete={handleDelete} />
          )}
          {expense.length > 0 && (
            <Section title="Despesas" items={expense} onToggle={handleToggle} onDelete={handleDelete} />
          )}
        </div>
      )}

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-surface border border-border rounded-xl w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <h2 className="text-text-primary font-semibold">Nova Transação Recorrente</h2>
              <button
                onClick={() => { setOpen(false); resetForm() }}
                className="text-text-muted hover:text-text-primary transition-colors p-1 rounded-lg hover:bg-surface-2"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
              {/* Type */}
              <div>
                <label className="block text-text-secondary text-xs font-medium mb-2 uppercase tracking-wide">Tipo</label>
                <div className="flex rounded-lg bg-surface-2 p-1 gap-1">
                  <button type="button" onClick={() => handleTypeChange('expense')}
                    className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${type === 'expense' ? 'bg-danger text-white shadow-sm' : 'text-text-muted hover:text-text-primary'}`}>
                    Despesa
                  </button>
                  <button type="button" onClick={() => handleTypeChange('income')}
                    className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${type === 'income' ? 'bg-success text-white shadow-sm' : 'text-text-muted hover:text-text-primary'}`}>
                    Receita
                  </button>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-text-secondary text-xs font-medium mb-2 uppercase tracking-wide">Descrição</label>
                <input type="text" value={description} onChange={(e) => setDescription(e.target.value)}
                  placeholder="Ex: Aluguel, Salário..."
                  className="w-full bg-surface-2 border border-border rounded-lg px-3 py-2.5 text-text-primary text-sm placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent" />
              </div>

              {/* Amount */}
              <div>
                <label className="block text-text-secondary text-xs font-medium mb-2 uppercase tracking-wide">Valor (R$)</label>
                <input type="text" inputMode="numeric" value={amount} onChange={handleAmountChange}
                  placeholder="0,00"
                  className="w-full bg-surface-2 border border-border rounded-lg px-3 py-2.5 text-text-primary text-sm placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent" />
              </div>

              {/* Category */}
              <div>
                <label className="block text-text-secondary text-xs font-medium mb-2 uppercase tracking-wide">Categoria</label>
                <select value={category} onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-surface-2 border border-border rounded-lg px-3 py-2.5 text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent">
                  <option value="">Selecione...</option>
                  {categories.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              {/* Frequency */}
              <div>
                <label className="block text-text-secondary text-xs font-medium mb-2 uppercase tracking-wide">Frequência</label>
                <select value={frequency} onChange={(e) => setFrequency(e.target.value as Frequency)}
                  className="w-full bg-surface-2 border border-border rounded-lg px-3 py-2.5 text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent">
                  {frequencyOptions.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
                </select>
              </div>

              {/* Start Date */}
              <div>
                <label className="block text-text-secondary text-xs font-medium mb-2 uppercase tracking-wide">Data de início</label>
                <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)}
                  className="w-full bg-surface-2 border border-border rounded-lg px-3 py-2.5 text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent [color-scheme:dark]" />
              </div>

              {error && (
                <p className="text-danger text-sm bg-danger/10 border border-danger/20 rounded-lg px-3 py-2">{error}</p>
              )}

              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => { setOpen(false); resetForm() }}
                  className="flex-1 py-2.5 text-sm font-medium text-text-secondary bg-surface-2 hover:bg-border rounded-lg transition-colors">
                  Cancelar
                </button>
                <button type="submit" disabled={loading}
                  className="flex-1 py-2.5 text-sm font-medium text-white bg-accent hover:bg-accent-hover rounded-lg transition-colors disabled:opacity-60 disabled:cursor-not-allowed">
                  {loading ? 'Salvando...' : 'Criar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

function Section({
  title, items, onToggle, onDelete,
}: {
  title: string
  items: RecurringTransaction[]
  onToggle: (id: string, active: boolean) => void
  onDelete: (id: string) => void
}) {
  return (
    <div className="bg-surface border border-border rounded-xl p-5 space-y-3">
      <h2 className="text-text-secondary text-xs font-semibold uppercase tracking-widest mb-4">{title}</h2>
      {items.map((item) => (
        <div key={item.id}
          className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${item.active ? 'border-border bg-surface-2' : 'border-border/40 bg-surface opacity-60'}`}>
          {/* Info */}
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-semibold truncate">{item.description}</p>
            <p className="text-text-muted text-xs mt-0.5">
              {item.category} · {FREQUENCY_LABELS[item.frequency]} · próxima: {formatDate(item.nextDate)}
            </p>
          </div>

          {/* Amount */}
          <span className={`text-sm font-bold flex-shrink-0 ${item.type === 'income' ? 'text-success' : 'text-danger'}`}>
            {item.type === 'income' ? '+' : '-'}{formatCurrency(item.amount)}
          </span>

          {/* Actions */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => onToggle(item.id, item.active)}
              className="p-2 rounded-lg hover:bg-surface transition-colors text-text-muted hover:text-text-primary"
              title={item.active ? 'Pausar' : 'Ativar'}
            >
              {item.active ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
            <button
              onClick={() => onDelete(item.id)}
              className="p-2 rounded-lg hover:bg-danger/10 text-text-muted hover:text-danger transition-colors"
              title="Excluir"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}

function formatDate(dateStr: string): string {
  const [y, m, d] = dateStr.split('-')
  return `${d}/${m}/${y}`
}
