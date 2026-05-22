import { NextRequest, NextResponse } from 'next/server'
import { getDB, initDB } from '@/lib/db'
import { syncItem, getPluggyClient } from '@/lib/pluggy'
import { safeId } from '@/lib/validate'
import crypto from 'crypto'

function verifySignature(body: string, signature: string | null, secret: string): boolean {
  if (!signature) return false
  try {
    const expected = crypto
      .createHmac('sha256', secret)
      .update(body)
      .digest('hex')
    // Pluggy may prefix with "sha256="
    const received = signature.startsWith('sha256=') ? signature.slice(7) : signature
    return crypto.timingSafeEqual(Buffer.from(expected, 'hex'), Buffer.from(received, 'hex'))
  } catch {
    return false
  }
}

async function handleItemCreated(itemId: string) {
  await initDB()
  const sql = getDB()
  const pluggy = getPluggyClient()

  let institutionName: string | null = null
  try {
    const item = await pluggy.fetchItem(itemId)
    institutionName = item.connector?.name ?? null
  } catch {}

  const id = safeId()
  await sql`
    INSERT INTO connected_accounts (id, item_id, institution_name)
    VALUES (${id}, ${itemId}, ${institutionName})
    ON CONFLICT (item_id) DO UPDATE SET institution_name = EXCLUDED.institution_name
  `

  // Fire & forget — must return within 5s
  syncItem(itemId).catch((err) => console.error('[webhook] sync error:', err))
}

async function handleItemUpdated(itemId: string) {
  syncItem(itemId).catch((err) => console.error('[webhook] sync error:', err))
}

export async function POST(req: NextRequest) {
  const webhookSecret = process.env.PLUGGY_WEBHOOK_SECRET

  const rawBody = await req.text()

  // Verify signature when secret is configured
  if (webhookSecret) {
    const signature = req.headers.get('x-pluggy-signature') ?? req.headers.get('x-signature')
    if (!verifySignature(rawBody, signature, webhookSecret)) {
      return NextResponse.json({ error: 'Assinatura inválida' }, { status: 401 })
    }
  }

  let event: { event: string; eventId?: string; itemId?: string; error?: unknown }
  try {
    event = JSON.parse(rawBody)
  } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 })
  }

  if (!event.event || typeof event.event !== 'string') {
    return NextResponse.json({ error: 'Evento inválido' }, { status: 400 })
  }

  console.log(`[webhook] ${event.event} | eventId: ${event.eventId}`)

  switch (event.event) {
    case 'item/created':
      if (event.itemId) await handleItemCreated(event.itemId)
      break
    case 'item/updated':
      if (event.itemId) await handleItemUpdated(event.itemId)
      break
    case 'item/error':
      console.error(`[webhook] item/error | itemId: ${event.itemId}`)
      break
    default:
      console.log(`[webhook] unhandled event: ${event.event}`)
  }

  return NextResponse.json({ received: true })
}
