import { NextRequest, NextResponse } from 'next/server'
import { getDB, initDB } from '@/lib/db'
import { requireSession } from '@/lib/api-auth'
import { goalContributionSchema, safeId } from '@/lib/validate'

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const { error } = await requireSession()
  if (error) return error

  const { id } = params
  if (!id) return NextResponse.json({ error: 'ID inválido' }, { status: 400 })

  try {
    await initDB()
    const sql = getDB()

    const body = await req.json().catch(() => null)
    if (!body) return NextResponse.json({ error: 'Corpo inválido' }, { status: 400 })

    const parsed = goalContributionSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })
    }

    const { amount, note, date } = parsed.data
    const cid = safeId()
    const contributionDate = date ?? new Date().toISOString().split('T')[0]

    await sql`
      INSERT INTO goal_contributions (id, goal_id, amount, note, date)
      VALUES (${cid}, ${id}, ${amount}, ${note ?? null}, ${contributionDate})
    `

    return NextResponse.json({ ok: true }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
