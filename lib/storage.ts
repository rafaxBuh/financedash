import { Transaction } from './types'

export async function loadTransactions(): Promise<Transaction[]> {
  const res = await fetch('/api/transactions')
  if (!res.ok) throw new Error('Erro ao carregar transações')
  const rows = await res.json()
  return rows.map((r: Record<string, unknown>) => ({
    ...r,
    amount: Number(r.amount),
  })) as Transaction[]
}

export async function addTransaction(
  data: Omit<Transaction, 'id' | 'createdAt'>
): Promise<Transaction> {
  const res = await fetch('/api/transactions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error('Erro ao criar transação')
  const row = await res.json()
  return { ...row, amount: Number(row.amount) } as Transaction
}

export async function deleteTransaction(id: string): Promise<void> {
  const res = await fetch(`/api/transactions/${id}`, { method: 'DELETE' })
  if (!res.ok) throw new Error('Erro ao deletar transação')
}
