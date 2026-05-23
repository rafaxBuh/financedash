import { NextRequest, NextResponse } from 'next/server'
import { getDB, initDB } from '@/lib/db'
import { requireSession } from '@/lib/api-auth'
import { transactionSchema, safeId } from '@/lib/validate'

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
      WHERE deleted = FALSE
      ORDER BY date DESC, created_at DESC
    `

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
