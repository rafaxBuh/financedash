import { NextRequest, NextResponse } from 'next/server'
import { getDB, initDB } from '@/lib/db'
import { requireSession } from '@/lib/api-auth'
import { categorySchema, safeId } from '@/lib/validate'

export async function GET() {
  const { error } = await requireSession()
  if (error) return error

  try {
    await initDB()
    const sql = getDB()
    const rows = await sql`SELECT id, name, type FROM categories ORDER BY type, name`
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

    const parsed = categorySchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })
    }

    const { name, type } = parsed.data
    const id = safeId()

    const rows = await sql`
      INSERT INTO categories (id, name, type) VALUES (${id}, ${name}, ${type})
      ON CONFLICT (name, type) DO NOTHING
      RETURNING id, name, type
    `

    if (rows.length === 0) {
      return NextResponse.json({ error: 'Categoria já existe' }, { status: 409 })
    }

    return NextResponse.json(rows[0], { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
