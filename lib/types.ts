export type TransactionType = 'income' | 'expense'

export type ExpenseCategory =
  | 'Alimentação'
  | 'Transporte'
  | 'Saúde'
  | 'Lazer'
  | 'Moradia'
  | 'Educação'
  | 'Compras'
  | 'Outros'

export type IncomeCategory =
  | 'Salário'
  | 'Freelance'
  | 'Investimentos'
  | 'Outros'

export type Category = string

export interface Transaction {
  id: string
  description: string
  amount: number
  type: TransactionType
  category: Category
  date: string // ISO date string YYYY-MM-DD
  createdAt: string // ISO datetime
}

export interface MonthlyData {
  month: string // e.g. "Jan", "Fev"
  income: number
  expense: number
}

export interface CategoryData {
  name: string
  value: number
  color: string
}

export const EXPENSE_CATEGORIES: ExpenseCategory[] = [
  'Alimentação',
  'Transporte',
  'Saúde',
  'Lazer',
  'Moradia',
  'Educação',
  'Compras',
  'Outros',
]

export const INCOME_CATEGORIES: IncomeCategory[] = [
  'Salário',
  'Freelance',
  'Investimentos',
  'Outros',
]

export type Frequency = 'daily' | 'weekly' | 'monthly' | 'yearly'

export interface RecurringTransaction {
  id: string
  description: string
  amount: number
  type: TransactionType
  category: string
  frequency: Frequency
  startDate: string
  nextDate: string
  active: boolean
  createdAt: string
}

export const FREQUENCY_LABELS: Record<Frequency, string> = {
  daily: 'Diária',
  weekly: 'Semanal',
  monthly: 'Mensal',
  yearly: 'Anual',
}

export const CATEGORY_COLORS: Record<string, string> = {
  Alimentação: '#f97316',
  Transporte: '#3b82f6',
  Saúde: '#22c55e',
  Lazer: '#a855f7',
  Moradia: '#f59e0b',
  Educação: '#06b6d4',
  Compras: '#ec4899',
  Outros: '#64748b',
  Salário: '#22c55e',
  Freelance: '#3b82f6',
  Investimentos: '#a855f7',
}
