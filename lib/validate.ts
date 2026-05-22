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

export const goalSchema = z.object({
  name: z.string().trim().min(1, 'Nome obrigatório').max(100, 'Nome muito longo'),
  type: z.enum(['savings', 'expense_limit', 'income_target']),
  target_amount: z
    .number('Valor inválido')
    .positive('Valor deve ser maior que zero')
    .max(999_999_999, 'Valor muito alto'),
  category: z.string().trim().max(100).nullable().optional(),
  deadline: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Data inválida')
    .nullable()
    .optional(),
})

export const goalContributionSchema = z.object({
  amount: z
    .number('Valor inválido')
    .positive('Valor deve ser maior que zero')
    .max(999_999_999, 'Valor muito alto'),
  note: z.string().trim().max(200).optional(),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Data inválida')
    .optional(),
})

export function safeId(): string {
  return crypto.randomUUID()
}
