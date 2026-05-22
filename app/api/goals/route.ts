import { NextRequest, NextResponse } from 'next/server'
import { getDB, initDB } from '@/lib/db'
import { requireSession } from '@/lib/api-auth'
import { goalSchema, safeId } from '@/lib/validate'

export async function GET() {
  const { error } = await requireSession()
  if (error) return error

  try {
    await initDB()
    const sql = getDB()
    const rows = await sql`
      SELECT id, name, type, target_amount AS "targetAmount",
             category, to_char(deadline, 'YYYY-MM-DD') AS deadline,
             created_at AS "createdAt"
      FROM goals
      ORDER BY created_at DESC
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

    const parsed = goalSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })
    }

    const { name, type, target_amount, category, deadline } = parsed.data
    const id = safeId()

    const rows = await sql`
      INSERT INTO goals (id, name, type, target_amount, category, deadline)
      VALUES (
        ${id}, ${name}, ${type}, ${target_amount},
        ${category ?? null}, ${deadline ?? null}
      )
      RETURNING id, name, type,
                target_amount AS "targetAmount",
                category,
                to_char(deadline, 'YYYY-MM-DD') AS deadline,
                created_at AS "createdAt"
    `
    return NextResponse.json(rows[0], { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
