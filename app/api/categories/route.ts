import { NextRequest, NextResponse } from 'next/server'
import { getDB, initDB } from '@/lib/db'

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

export async function GET() {
  try {
    await initDB()
    const sql = getDB()
    const rows = await sql`SELECT id, name, type FROM categories ORDER BY type, name`
    return NextResponse.json(rows)
  } catch (error) {
    console.error('GET /api/categories error:', error)
    return NextResponse.json({ error: 'Erro ao buscar categorias' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    await initDB()
    const sql = getDB()
    const { name, type } = await req.json()

    if (!name || !type || !['income', 'expense'].includes(type)) {
      return NextResponse.json({ error: 'Dados inválidos' }, { status: 400 })
    }

    const id = generateId()
    const rows = await sql`
      INSERT INTO categories (id, name, type) VALUES (${id}, ${name.trim()}, ${type})
      ON CONFLICT (name, type) DO NOTHING
      RETURNING id, name, type
    `

    if (rows.length === 0) {
      return NextResponse.json({ error: 'Categoria já existe' }, { status: 409 })
    }

    return NextResponse.json(rows[0], { status: 201 })
  } catch (error) {
    console.error('POST /api/categories error:', error)
    return NextResponse.json({ error: 'Erro ao criar categoria' }, { status: 500 })
  }
}
