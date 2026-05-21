'use client'

import { useEffect, useState } from 'react'
import { Plus, Trash2, Tag } from 'lucide-react'

interface Category {
  id: string
  name: string
  type: 'income' | 'expense'
}

export default function CategoriasPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [mounted, setMounted] = useState(false)
  const [name, setName] = useState('')
  const [type, setType] = useState<'expense' | 'income'>('expense')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetch('/api/categories')
      .then((r) => r.json())
      .then(setCategories)
      .finally(() => setMounted(true))
  }, [])

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!name.trim()) { setError('Informe o nome da categoria.'); return }
    setLoading(true)
    try {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), type }),
      })
      if (res.status === 409) { setError('Categoria já existe.'); return }
      if (!res.ok) throw new Error()
      const created: Category = await res.json()
      setCategories((prev) => [...prev, created])
      setName('')
    } catch {
      setError('Erro ao criar categoria.')
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(id: string) {
    await fetch(`/api/categories/${id}`, { method: 'DELETE' })
    setCategories((prev) => prev.filter((c) => c.id !== id))
  }

  const expense = categories.filter((c) => c.type === 'expense')
  const income = categories.filter((c) => c.type === 'income')

  if (!mounted) {
    return (
      <div className="p-8 flex items-center justify-center h-64">
        <div className="text-text-muted text-sm">Carregando...</div>
      </div>
    )
  }

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Categorias</h1>
        <p className="text-text-muted text-sm mt-1">Gerencie as categorias de receitas e despesas</p>
      </div>

      {/* Add form */}
      <div className="bg-surface border border-border rounded-xl p-5">
        <h2 className="text-text-primary font-semibold text-sm mb-4">Nova Categoria</h2>
        <form onSubmit={handleAdd} className="flex flex-wrap gap-3 items-end">
          <div className="flex rounded-lg bg-surface-2 p-1 gap-1">
            <button
              type="button"
              onClick={() => setType('expense')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                type === 'expense' ? 'bg-danger text-white' : 'text-text-muted hover:text-text-primary'
              }`}
            >
              Despesa
            </button>
            <button
              type="button"
              onClick={() => setType('income')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                type === 'income' ? 'bg-success text-white' : 'text-text-muted hover:text-text-primary'
              }`}
            >
              Receita
            </button>
          </div>

          <div className="flex-1 min-w-48">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nome da categoria"
              className="w-full bg-surface-2 border border-border rounded-lg px-3 py-2.5 text-text-primary text-sm placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2.5 bg-accent hover:bg-accent-hover text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-60"
          >
            <Plus className="w-4 h-4" />
            Adicionar
          </button>
        </form>
        {error && (
          <p className="text-danger text-sm mt-3 bg-danger/10 border border-danger/20 rounded-lg px-3 py-2">
            {error}
          </p>
        )}
      </div>

      {/* Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <CategoryList title="Despesas" items={expense} color="danger" onDelete={handleDelete} />
        <CategoryList title="Receitas" items={income} color="success" onDelete={handleDelete} />
      </div>
    </div>
  )
}

function CategoryList({
  title,
  items,
  color,
  onDelete,
}: {
  title: string
  items: { id: string; name: string }[]
  color: 'danger' | 'success'
  onDelete: (id: string) => void
}) {
  return (
    <div className="bg-surface border border-border rounded-xl p-5">
      <h2 className="text-text-primary font-semibold text-sm mb-4 flex items-center gap-2">
        <Tag className={`w-4 h-4 ${color === 'danger' ? 'text-danger' : 'text-success'}`} />
        {title} ({items.length})
      </h2>
      {items.length === 0 ? (
        <p className="text-text-muted text-sm text-center py-6">Nenhuma categoria</p>
      ) : (
        <div className="space-y-2">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between px-3 py-2.5 bg-surface-2 rounded-lg group"
            >
              <span className="text-text-primary text-sm">{item.name}</span>
              <button
                onClick={() => onDelete(item.id)}
                className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 hover:bg-danger/10 rounded-lg text-text-muted hover:text-danger"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
