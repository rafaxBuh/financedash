'use client'

import { useState, useEffect } from 'react'
import { Plus, X } from 'lucide-react'
import { Transaction, TransactionType } from '@/lib/types'

interface Props {
  onAdd: (data: Omit<Transaction, 'id' | 'createdAt'>) => Promise<void>
}

interface Category {
  id: string
  name: string
  type: 'income' | 'expense'
}

const today = new Date().toISOString().split('T')[0]

export default function TransactionForm({ onAdd }: Props) {
  const [open, setOpen] = useState(false)
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')
  const [type, setType] = useState<TransactionType>('expense')
  const [category, setCategory] = useState('')
  const [date, setDate] = useState(today)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [allCategories, setAllCategories] = useState<Category[]>([])

  useEffect(() => {
    fetch('/api/categories')
      .then((r) => r.json())
      .then(setAllCategories)
      .catch(() => {})
  }, [])

  const categories = allCategories.filter((c) => c.type === type).map((c) => c.name)

  function handleTypeChange(newType: TransactionType) {
    setType(newType)
    setCategory('')
  }

  function handleAmountChange(e: React.ChangeEvent<HTMLInputElement>) {
    let val = e.target.value.replace(/\D/g, '')
    if (val.length === 0) {
      setAmount('')
      return
    }
    const num = (parseInt(val, 10) / 100).toFixed(2)
    const formatted = num.replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.')
    setAmount(formatted)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    const parsedAmount = parseFloat(amount.replace(/\./g, '').replace(',', '.'))
    if (!description.trim()) { setError('Informe uma descrição.'); return }
    if (isNaN(parsedAmount) || parsedAmount <= 0) { setError('Informe um valor válido maior que zero.'); return }
    if (!date) { setError('Informe a data.'); return }
    if (!category) { setError('Selecione uma categoria.'); return }

    try {
      setLoading(true)
      await onAdd({ description: description.trim(), amount: parsedAmount, type, category, date })
      setDescription('')
      setAmount('')
      setType('expense')
      setCategory('')
      setDate(today)
      setOpen(false)
    } catch {
      setError('Erro ao salvar. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-4 py-2.5 bg-accent hover:bg-accent-hover text-white text-sm font-medium rounded-lg transition-colors"
      >
        <Plus className="w-4 h-4" />
        Nova Transação
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-surface border border-border rounded-xl w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <h2 className="text-text-primary font-semibold">Nova Transação</h2>
              <button
                onClick={() => { setOpen(false); setError('') }}
                className="text-text-muted hover:text-text-primary transition-colors p-1 rounded-lg hover:bg-surface-2"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
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

              <div>
                <label className="block text-text-secondary text-xs font-medium mb-2 uppercase tracking-wide">Descrição</label>
                <input type="text" value={description} onChange={(e) => setDescription(e.target.value)}
                  placeholder="Ex: Aluguel, Salário, Supermercado..."
                  className="w-full bg-surface-2 border border-border rounded-lg px-3 py-2.5 text-text-primary text-sm placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent" />
              </div>

              <div>
                <label className="block text-text-secondary text-xs font-medium mb-2 uppercase tracking-wide">Valor (R$)</label>
                <input type="text" inputMode="numeric" value={amount} onChange={handleAmountChange}
                  placeholder="0,00"
                  className="w-full bg-surface-2 border border-border rounded-lg px-3 py-2.5 text-text-primary text-sm placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent" />
              </div>

              <div>
                <label className="block text-text-secondary text-xs font-medium mb-2 uppercase tracking-wide">Categoria</label>
                <select value={category} onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-surface-2 border border-border rounded-lg px-3 py-2.5 text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent">
                  <option value="">Selecione...</option>
                  {categories.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-text-secondary text-xs font-medium mb-2 uppercase tracking-wide">Data</label>
                <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-surface-2 border border-border rounded-lg px-3 py-2.5 text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent [color-scheme:dark]" />
              </div>

              {error && (
                <p className="text-danger text-sm bg-danger/10 border border-danger/20 rounded-lg px-3 py-2">{error}</p>
              )}

              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => { setOpen(false); setError('') }}
                  className="flex-1 py-2.5 text-sm font-medium text-text-secondary bg-surface-2 hover:bg-border rounded-lg transition-colors">
                  Cancelar
                </button>
                <button type="submit" disabled={loading}
                  className="flex-1 py-2.5 text-sm font-medium text-white bg-accent hover:bg-accent-hover rounded-lg transition-colors disabled:opacity-60 disabled:cursor-not-allowed">
                  {loading ? 'Salvando...' : 'Adicionar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
