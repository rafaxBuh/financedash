import { Transaction } from './types'
import { subMonths, format, parseISO } from 'date-fns'

const STORAGE_KEY = 'financedash_transactions'

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

function buildSampleData(): Transaction[] {
  const today = new Date()

  const entries: Omit<Transaction, 'id' | 'createdAt'>[] = [
    // Current month
    {
      description: 'Salário mensal',
      amount: 5500,
      type: 'income',
      category: 'Salário',
      date: format(today, 'yyyy-MM') + '-05',
    },
    {
      description: 'Aluguel',
      amount: 1800,
      type: 'expense',
      category: 'Moradia',
      date: format(today, 'yyyy-MM') + '-01',
    },
    {
      description: 'Supermercado',
      amount: 420,
      type: 'expense',
      category: 'Alimentação',
      date: format(today, 'yyyy-MM') + '-08',
    },
    {
      description: 'Transporte público',
      amount: 150,
      type: 'expense',
      category: 'Transporte',
      date: format(today, 'yyyy-MM') + '-10',
    },
    {
      description: 'Plano de saúde',
      amount: 320,
      type: 'expense',
      category: 'Saúde',
      date: format(today, 'yyyy-MM') + '-05',
    },
    {
      description: 'Netflix + Spotify',
      amount: 75,
      type: 'expense',
      category: 'Lazer',
      date: format(today, 'yyyy-MM') + '-12',
    },
    {
      description: 'Freelance design',
      amount: 1200,
      type: 'income',
      category: 'Freelance',
      date: format(today, 'yyyy-MM') + '-15',
    },
    {
      description: 'Restaurante',
      amount: 95,
      type: 'expense',
      category: 'Alimentação',
      date: format(today, 'yyyy-MM') + '-14',
    },
    {
      description: 'Curso online',
      amount: 189,
      type: 'expense',
      category: 'Educação',
      date: format(today, 'yyyy-MM') + '-11',
    },
    {
      description: 'Roupas',
      amount: 230,
      type: 'expense',
      category: 'Compras',
      date: format(today, 'yyyy-MM') + '-13',
    },
    // 1 month ago
    {
      description: 'Salário mensal',
      amount: 5500,
      type: 'income',
      category: 'Salário',
      date: format(subMonths(today, 1), 'yyyy-MM') + '-05',
    },
    {
      description: 'Aluguel',
      amount: 1800,
      type: 'expense',
      category: 'Moradia',
      date: format(subMonths(today, 1), 'yyyy-MM') + '-01',
    },
    {
      description: 'Supermercado',
      amount: 380,
      type: 'expense',
      category: 'Alimentação',
      date: format(subMonths(today, 1), 'yyyy-MM') + '-07',
    },
    {
      description: 'Dividendos',
      amount: 450,
      type: 'income',
      category: 'Investimentos',
      date: format(subMonths(today, 1), 'yyyy-MM') + '-20',
    },
    {
      description: 'Academia',
      amount: 99,
      type: 'expense',
      category: 'Saúde',
      date: format(subMonths(today, 1), 'yyyy-MM') + '-03',
    },
    {
      description: 'Uber',
      amount: 130,
      type: 'expense',
      category: 'Transporte',
      date: format(subMonths(today, 1), 'yyyy-MM') + '-18',
    },
    // 2 months ago
    {
      description: 'Salário mensal',
      amount: 5500,
      type: 'income',
      category: 'Salário',
      date: format(subMonths(today, 2), 'yyyy-MM') + '-05',
    },
    {
      description: 'Aluguel',
      amount: 1800,
      type: 'expense',
      category: 'Moradia',
      date: format(subMonths(today, 2), 'yyyy-MM') + '-01',
    },
    {
      description: 'Supermercado',
      amount: 510,
      type: 'expense',
      category: 'Alimentação',
      date: format(subMonths(today, 2), 'yyyy-MM') + '-09',
    },
    {
      description: 'Freelance web',
      amount: 2000,
      type: 'income',
      category: 'Freelance',
      date: format(subMonths(today, 2), 'yyyy-MM') + '-22',
    },
    {
      description: 'Conserto carro',
      amount: 750,
      type: 'expense',
      category: 'Transporte',
      date: format(subMonths(today, 2), 'yyyy-MM') + '-14',
    },
    {
      description: 'Cinema e lazer',
      amount: 160,
      type: 'expense',
      category: 'Lazer',
      date: format(subMonths(today, 2), 'yyyy-MM') + '-16',
    },
    // 3 months ago
    {
      description: 'Salário mensal',
      amount: 5500,
      type: 'income',
      category: 'Salário',
      date: format(subMonths(today, 3), 'yyyy-MM') + '-05',
    },
    {
      description: 'Aluguel',
      amount: 1800,
      type: 'expense',
      category: 'Moradia',
      date: format(subMonths(today, 3), 'yyyy-MM') + '-01',
    },
    {
      description: 'Supermercado',
      amount: 440,
      type: 'expense',
      category: 'Alimentação',
      date: format(subMonths(today, 3), 'yyyy-MM') + '-08',
    },
    {
      description: 'Plano de saúde',
      amount: 320,
      type: 'expense',
      category: 'Saúde',
      date: format(subMonths(today, 3), 'yyyy-MM') + '-05',
    },
    {
      description: 'Dividendos',
      amount: 380,
      type: 'income',
      category: 'Investimentos',
      date: format(subMonths(today, 3), 'yyyy-MM') + '-20',
    },
    // 4 months ago
    {
      description: 'Salário mensal',
      amount: 5200,
      type: 'income',
      category: 'Salário',
      date: format(subMonths(today, 4), 'yyyy-MM') + '-05',
    },
    {
      description: 'Aluguel',
      amount: 1800,
      type: 'expense',
      category: 'Moradia',
      date: format(subMonths(today, 4), 'yyyy-MM') + '-01',
    },
    {
      description: 'Supermercado',
      amount: 395,
      type: 'expense',
      category: 'Alimentação',
      date: format(subMonths(today, 4), 'yyyy-MM') + '-07',
    },
    {
      description: 'Notebook (compra)',
      amount: 3200,
      type: 'expense',
      category: 'Compras',
      date: format(subMonths(today, 4), 'yyyy-MM') + '-12',
    },
    {
      description: 'Freelance app',
      amount: 1800,
      type: 'income',
      category: 'Freelance',
      date: format(subMonths(today, 4), 'yyyy-MM') + '-28',
    },
    // 5 months ago
    {
      description: 'Salário mensal',
      amount: 5200,
      type: 'income',
      category: 'Salário',
      date: format(subMonths(today, 5), 'yyyy-MM') + '-05',
    },
    {
      description: 'Aluguel',
      amount: 1800,
      type: 'expense',
      category: 'Moradia',
      date: format(subMonths(today, 5), 'yyyy-MM') + '-01',
    },
    {
      description: 'Supermercado',
      amount: 460,
      type: 'expense',
      category: 'Alimentação',
      date: format(subMonths(today, 5), 'yyyy-MM') + '-09',
    },
    {
      description: 'Plano de saúde',
      amount: 320,
      type: 'expense',
      category: 'Saúde',
      date: format(subMonths(today, 5), 'yyyy-MM') + '-05',
    },
    {
      description: 'Viagem de férias',
      amount: 2400,
      type: 'expense',
      category: 'Lazer',
      date: format(subMonths(today, 5), 'yyyy-MM') + '-20',
    },
    {
      description: 'Dividendos',
      amount: 520,
      type: 'income',
      category: 'Investimentos',
      date: format(subMonths(today, 5), 'yyyy-MM') + '-25',
    },
  ]

  return entries.map((entry, index) => ({
    ...entry,
    id: generateId() + index,
    createdAt: new Date().toISOString(),
  }))
}

export function loadTransactions(): Transaction[] {
  if (typeof window === 'undefined') return []

  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      const sample = buildSampleData()
      saveTransactions(sample)
      return sample
    }
    return JSON.parse(raw) as Transaction[]
  } catch {
    return []
  }
}

export function saveTransactions(transactions: Transaction[]): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions))
}

export function addTransaction(
  transactions: Transaction[],
  data: Omit<Transaction, 'id' | 'createdAt'>
): Transaction[] {
  const newTransaction: Transaction = {
    ...data,
    id: generateId(),
    createdAt: new Date().toISOString(),
  }
  const updated = [newTransaction, ...transactions]
  saveTransactions(updated)
  return updated
}

export function deleteTransaction(
  transactions: Transaction[],
  id: string
): Transaction[] {
  const updated = transactions.filter((t) => t.id !== id)
  saveTransactions(updated)
  return updated
}
