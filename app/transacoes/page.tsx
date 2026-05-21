'use client'

import { useEffect, useState, useMemo } from 'react'
import { Search, SlidersHorizontal } from 'lucide-react'
import { Transaction, TransactionType, Category } from '@/lib/types'
import { loadTransactions, addTransaction, deleteTransaction } from '@/lib/storage'
import {
  sortTransactionsByDate,
  getAvailableMonths,
  formatMonthLabel,
  formatCurrency,
  getTotalIncome,
  getTotalExpenses,
} from '@/lib/utils'
import TransactionForm from '@/components/TransactionForm'
import TransactionList from '@/components/TransactionList'

type SortOrder = 'desc' | 'asc'

export default function TransacoesPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [dbCategories, setDbCategories] = useState<{ name: string; type: string }[]>([])
  const [mounted, setMounted] = useState(false)

  // Filters
  const [search, setSearch] = useState('')
  const [filterType, setFilterType] = useState<TransactionType | 'all'>('all')
  const [filterCategory, setFilterCategory] = useState<Category | 'all'>('all')
  const [filterMonth, setFilterMonth] = useState<string>('all')
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc')

  useEffect(() => {
    Promise.all([
      loadTransactions(),
      fetch('/api/categories').then((r) => r.json()),
    ]).then(([txs, cats]) => {
      setTransactions(txs)
      setDbCategories(cats)
    }).finally(() => setMounted(true))
  }, [])

  async function handleAdd(data: Omit<Transaction, 'id' | 'createdAt'>) {
    const newTransaction = await addTransaction(data)
    setTransactions((prev) => [newTransaction, ...prev])
  }

  async function handleDelete(id: string) {
    await deleteTransaction(id)
    setTransactions((prev) => prev.filter((t) => t.id !== id))
  }

  const availableMonths = useMemo(() => getAvailableMonths(transactions), [transactions])

  const allCategories = useMemo(() => {
    if (filterType === 'income') return dbCategories.filter((c) => c.type === 'income').map((c) => c.name)
    if (filterType === 'expense') return dbCategories.filter((c) => c.type === 'expense').map((c) => c.name)
    return dbCategories.map((c) => c.name)
  }, [filterType, dbCategories])

  const filtered = useMemo(() => {
    let result = [...transactions]

    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(
        (t) =>
          t.description.toLowerCase().includes(q) ||
          t.category.toLowerCase().includes(q)
      )
    }

    if (filterType !== 'all') {
      result = result.filter((t) => t.type === filterType)
    }

    if (filterCategory !== 'all') {
      result = result.filter((t) => t.category === filterCategory)
    }

    if (filterMonth !== 'all') {
      result = result.filter((t) => t.date.startsWith(filterMonth))
    }

    result = sortTransactionsByDate(result)
    if (sortOrder === 'asc') result.reverse()

    return result
  }, [transactions, search, filterType, filterCategory, filterMonth, sortOrder])

  const filteredIncome = getTotalIncome(filtered)
  const filteredExpenses = getTotalExpenses(filtered)

  if (!mounted) {
    return (
      <div className="p-8 flex items-center justify-center h-64">
        <div className="text-text-muted text-sm">Carregando...</div>
      </div>
    )
  }

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Transações</h1>
          <p className="text-text-muted text-sm mt-1">
            {transactions.length} transação{transactions.length !== 1 ? 'ões' : ''} no total
          </p>
        </div>
        <TransactionForm onAdd={handleAdd} />
      </div>

      {/* Filters */}
      <div className="bg-surface border border-border rounded-xl p-4 space-y-4">
        <div className="flex items-center gap-2 text-text-secondary text-sm">
          <SlidersHorizontal className="w-4 h-4" />
          <span className="font-medium">Filtros</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted" />
            <input
              type="text"
              placeholder="Buscar..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-surface-2 border border-border rounded-lg pl-8 pr-3 py-2 text-text-primary text-sm placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
            />
          </div>

          {/* Type */}
          <select
            value={filterType}
            onChange={(e) => {
              setFilterType(e.target.value as TransactionType | 'all')
              setFilterCategory('all')
            }}
            className="bg-surface-2 border border-border rounded-lg px-3 py-2 text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
          >
            <option value="all">Todos os tipos</option>
            <option value="income">Receitas</option>
            <option value="expense">Despesas</option>
          </select>

          {/* Category */}
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value as Category | 'all')}
            className="bg-surface-2 border border-border rounded-lg px-3 py-2 text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
          >
            <option value="all">Todas as categorias</option>
            {allCategories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          {/* Month */}
          <select
            value={filterMonth}
            onChange={(e) => setFilterMonth(e.target.value)}
            className="bg-surface-2 border border-border rounded-lg px-3 py-2 text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
          >
            <option value="all">Todos os meses</option>
            {availableMonths.map((m) => (
              <option key={m} value={m}>
                {formatMonthLabel(m)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Results summary */}
      {filtered.length > 0 && (
        <div className="flex items-center justify-between flex-wrap gap-3">
          <p className="text-text-muted text-sm">
            {filtered.length} resultado{filtered.length !== 1 ? 's' : ''}
          </p>
          <div className="flex items-center gap-4 text-sm">
            <span className="text-success font-medium">
              + {formatCurrency(filteredIncome)}
            </span>
            <span className="text-danger font-medium">
              - {formatCurrency(filteredExpenses)}
            </span>
            <button
              onClick={() => setSortOrder((s) => (s === 'desc' ? 'asc' : 'desc'))}
              className="text-text-muted hover:text-text-primary text-xs border border-border rounded-lg px-3 py-1.5 hover:bg-surface-2 transition-colors flex items-center gap-1"
            >
              Data: {sortOrder === 'desc' ? 'Mais recente' : 'Mais antiga'}
            </button>
          </div>
        </div>
      )}

      {/* Transaction list */}
      <div className="bg-surface border border-border rounded-xl p-5">
        <TransactionList transactions={filtered} onDelete={handleDelete} />
      </div>
    </div>
  )
}
