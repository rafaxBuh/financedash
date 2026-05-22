import { z } from 'zod'

export const transactionSchema = z.object({
  description: z.string().trim().min(1, 'Descrição obrigatória').max(200, 'Descrição muito longa'),
  amount: z
    .number('Valor inválido')
    .positive('Valor deve ser maior que zero')
    .max(999_999_999, 'Valor muito alto'),
  type: z.enum(['income', 'expense']),
  category: z.string().trim().min(1, 'Categoria obrigatória').max(100),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Data inválida (use YYYY-MM-DD)'),
})

export const categorySchema = z.object({
  name: z.string().trim().min(1, 'Nome obrigatório').max(100, 'Nome muito longo'),
  type: z.enum(['income', 'expense']),
})

export const pluggyAccountSchema = z.object({
  itemId: z.string().trim().min(1).max(200),
  institutionName: z.string().trim().max(200).nullable().optional(),
})

export function safeId(): string {
  return crypto.randomUUID()
}
