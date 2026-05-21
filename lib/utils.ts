import { format, parseISO, startOfMonth, endOfMonth, isWithinInterval, subMonths } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Transaction, MonthlyData, CategoryData, CATEGORY_COLORS } from './types'

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

export function formatDate(dateStr: string): string {
  try {
    return format(parseISO(dateStr), "dd 'de' MMM 'de' yyyy", { locale: ptBR })
  } catch {
    return dateStr
  }
}

export function formatShortDate(dateStr: string): string {
  try {
    return format(parseISO(dateStr), 'dd/MM/yyyy')
  } catch {
    return dateStr
  }
}

export function getMonthYear(dateStr: string): string {
  try {
    return format(parseISO(dateStr), 'yyyy-MM')
  } catch {
    return ''
  }
}

export function getCurrentMonthTransactions(transactions: Transaction[]): Transaction[] {
  const now = new Date()
  const start = startOfMonth(now)
  const end = endOfMonth(now)
  return transactions.filter((t) => {
    try {
      return isWithinInterval(parseISO(t.date), { start, end })
    } catch {
      return false
    }
  })
}

export function getTotalIncome(transactions: Transaction[]): number {
  return transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0)
}

export function getTotalExpenses(transactions: Transaction[]): number {
  return transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0)
}

export function getBalance(transactions: Transaction[]): number {
  return getTotalIncome(transactions) - getTotalExpenses(transactions)
}

export function getMonthlyData(transactions: Transaction[]): MonthlyData[] {
  const today = new Date()
  const months: MonthlyData[] = []

  for (let i = 5; i >= 0; i--) {
    const date = subMonths(today, i)
    const start = startOfMonth(date)
    const end = endOfMonth(date)
    const label = format(date, 'MMM', { locale: ptBR })
    const capitalLabel = label.charAt(0).toUpperCase() + label.slice(1)

    const monthTxs = transactions.filter((t) => {
      try {
        return isWithinInterval(parseISO(t.date), { start, end })
      } catch {
        return false
      }
    })

    months.push({
      month: capitalLabel,
      income: getTotalIncome(monthTxs),
      expense: getTotalExpenses(monthTxs),
    })
  }

  return months
}

export function getCategoryExpenseData(transactions: Transaction[]): CategoryData[] {
  const expenses = transactions.filter((t) => t.type === 'expense')
  const map: Record<string, number> = {}

  for (const t of expenses) {
    map[t.category] = (map[t.category] ?? 0) + t.amount
  }

  return Object.entries(map)
    .sort((a, b) => b[1] - a[1])
    .map(([name, value]) => ({
      name,
      value,
      color: CATEGORY_COLORS[name] ?? '#64748b',
    }))
}

export function sortTransactionsByDate(transactions: Transaction[]): Transaction[] {
  return [...transactions].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  )
}

export function getAvailableMonths(transactions: Transaction[]): string[] {
  const months = new Set<string>()
  transactions.forEach((t) => {
    const m = getMonthYear(t.date)
    if (m) months.add(m)
  })
  return Array.from(months).sort((a, b) => b.localeCompare(a))
}

export function formatMonthLabel(yearMonth: string): string {
  try {
    const date = parseISO(yearMonth + '-01')
    return format(date, "MMMM 'de' yyyy", { locale: ptBR })
  } catch {
    return yearMonth
  }
}
