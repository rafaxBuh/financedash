import { NextRequest, NextResponse } from 'next/server'
import { getDB, initDB } from '@/lib/db'
import { requireSession } from '@/lib/api-auth'
import { transactionSchema, safeId } from '@/lib/validate'
import { Transaction } from '@/lib/types'
import { format, subMonths } from 'date-fns'

function buildSampleData(): Omit<Transaction, 'createdAt'>[] {
  const today = new Date()
  const entries: Omit<Transaction, 'id' | 'createdAt'>[] = [
    { description: 'Salário mensal', amount: 5500, type: 'income', category: 'Salário', date: format(today, 'yyyy-MM') + '-05' },
    { description: 'Aluguel', amount: 1800, type: 'expense', category: 'Moradia', date: format(today, 'yyyy-MM') + '-01' },
    { description: 'Supermercado', amount: 420, type: 'expense', category: 'Alimentação', date: format(today, 'yyyy-MM') + '-08' },
    { description: 'Transporte público', amount: 150, type: 'expense', category: 'Transporte', date: format(today, 'yyyy-MM') + '-10' },
    { description: 'Plano de saúde', amount: 320, type: 'expense', category: 'Saúde', date: format(today, 'yyyy-MM') + '-05' },
    { description: 'Netflix + Spotify', amount: 75, type: 'expense', category: 'Lazer', date: format(today, 'yyyy-MM') + '-12' },
    { description: 'Freelance design', amount: 1200, type: 'income', category: 'Freelance', date: format(today, 'yyyy-MM') + '-15' },
    { description: 'Restaurante', amount: 95, type: 'expense', category: 'Alimentação', date: format(today, 'yyyy-MM') + '-14' },
    { description: 'Curso online', amount: 189, type: 'expense', category: 'Educação', date: format(today, 'yyyy-MM') + '-11' },
    { description: 'Roupas', amount: 230, type: 'expense', category: 'Compras', date: format(today, 'yyyy-MM') + '-13' },
    { description: 'Salário mensal', amount: 5500, type: 'income', category: 'Salário', date: format(subMonths(today, 1), 'yyyy-MM') + '-05' },
    { description: 'Aluguel', amount: 1800, type: 'expense', category: 'Moradia', date: format(subMonths(today, 1), 'yyyy-MM') + '-01' },
    { description: 'Supermercado', amount: 380, type: 'expense', category: 'Alimentação', date: format(subMonths(today, 1), 'yyyy-MM') + '-07' },
    { description: 'Dividendos', amount: 450, type: 'income', category: 'Investimentos', date: format(subMonths(today, 1), 'yyyy-MM') + '-20' },
    { description: 'Academia', amount: 99, type: 'expense', category: 'Saúde', date: format(subMonths(today, 1), 'yyyy-MM') + '-03' },
    { description: 'Uber', amount: 130, type: 'expense', category: 'Transporte', date: format(subMonths(today, 1), 'yyyy-MM') + '-18' },
    { description: 'Salário mensal', amount: 5500, type: 'income', category: 'Salário', date: format(subMonths(today, 2), 'yyyy-MM') + '-05' },
    { description: 'Aluguel', amount: 1800, type: 'expense', category: 'Moradia', date: format(subMonths(today, 2), 'yyyy-MM') + '-01' },
    { description: 'Supermercado', amount: 510, type: 'expense', category: 'Alimentação', date: format(subMonths(today, 2), 'yyyy-MM') + '-09' },
    { description: 'Freelance web', amount: 2000, type: 'income', category: 'Freelance', date: format(subMonths(today, 2), 'yyyy-MM') + '-22' },
    { description: 'Salário mensal', amount: 5500, type: 'income', category: 'Salário', date: format(subMonths(today, 3), 'yyyy-MM') + '-05' },
    { description: 'Aluguel', amount: 1800, type: 'expense', category: 'Moradia', date: format(subMonths(today, 3), 'yyyy-MM') + '-01' },
    { description: 'Dividendos', amount: 380, type: 'income', category: 'Investimentos', date: format(subMonths(today, 3), 'yyyy-MM') + '-20' },
    { description: 'Salário mensal', amount: 5200, type: 'income', category: 'Salário', date: format(subMonths(today, 4), 'yyyy-MM') + '-05' },
    { description: 'Aluguel', amount: 1800, type: 'expense', category: 'Moradia', date: format(subMonths(today, 4), 'yyyy-MM') + '-01' },
    { description: 'Freelance app', amount: 1800, type: 'income', category: 'Freelance', date: format(subMonths(today, 4), 'yyyy-MM') + '-28' },
    { description: 'Salário mensal', amount: 5200, type: 'income', category: 'Salário', date: format(subMonths(today, 5), 'yyyy-MM') + '-05' },
    { description: 'Aluguel', amount: 1800, type: 'expense', category: 'Moradia', date: format(subMonths(today, 5), 'yyyy-MM') + '-01' },
    { description: 'Dividendos', amount: 520, type: 'income', category: 'Investimentos', date: format(subMonths(today, 5), 'yyyy-MM') + '-25' },
  ]
  return entries.map((e) => ({ ...e, id: safeId() }))
}

export async function GET() {
  const { error } = await requireSession()
  if (error) return error

  try {
    await initDB()
    const sql = getDB()

    const rows = await sql`
      SELECT id, description, amount, type, category,
             to_char(date, 'YYYY-MM-DD') AS date,
             created_at AS "createdAt"
      FROM transactions
      ORDER BY date DESC, created_at DESC
    `

    if (rows.length === 0) {
      const sample = buildSampleData()
      for (const t of sample) {
        await sql`
          INSERT INTO transactions (id, description, amount, type, category, date)
          VALUES (${t.id}, ${t.description}, ${t.amount}, ${t.type}, ${t.category}, ${t.date})
        `
      }
      const seeded = await sql`
        SELECT id, description, amount, type, category,
               to_char(date, 'YYYY-MM-DD') AS date,
               created_at AS "createdAt"
        FROM transactions
        ORDER BY date DESC, created_at DESC
      `
      return NextResponse.json(seeded)
    }

    return NextResponse.json(rows)
  } catch {
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const { error } = await requireSession()
  if (error) return error

  try {
    await initDB()
    const sql = getDB()

    const body = await req.json().catch(() => null)
    if (!body) return NextResponse.json({ error: 'Corpo inválido' }, { status: 400 })

    const parsed = transactionSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      )
    }

    const { description, amount, type, category, date } = parsed.data
    const id = safeId()

    const rows = await sql`
      INSERT INTO transactions (id, description, amount, type, category, date)
      VALUES (${id}, ${description}, ${amount}, ${type}, ${category}, ${date})
      RETURNING id, description, amount, type, category,
                to_char(date, 'YYYY-MM-DD') AS date,
                created_at AS "createdAt"
    `

    return NextResponse.json(rows[0], { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
