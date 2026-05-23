import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { getDB, initDB } from '@/lib/db'
import { isRateLimited } from '@/lib/rate-limit'
import { z } from 'zod'

const registerSchema = z.object({
  email: z.string().email('Email inválido').max(200),
  password: z.string().min(8, 'A senha deve ter pelo menos 8 caracteres').max(100),
})

export async function POST(req: NextRequest) {
  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'

  if (isRateLimited(`register:${ip}`, 5, 15 * 60 * 1000)) {
    return NextResponse.json(
      { error: 'Muitas tentativas. Aguarde 15 minutos.' },
      { status: 429 }
    )
  }

  try {
    const body = await req.json().catch(() => null)
    if (!body) return NextResponse.json({ error: 'Corpo inválido' }, { status: 400 })

    const parsed = registerSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      )
    }

    const { email, password } = parsed.data

    await initDB()
    const sql = getDB()

    const existing = await sql`SELECT id FROM users WHERE email = ${email} LIMIT 1`
    if (existing.length > 0) {
      return NextResponse.json({ error: 'Este email já está cadastrado.' }, { status: 409 })
    }

    const hash = await bcrypt.hash(password, 12)
    const id = crypto.randomUUID()

    await sql`INSERT INTO users (id, email, password_hash) VALUES (${id}, ${email}, ${hash})`

    return NextResponse.json({ success: true }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
