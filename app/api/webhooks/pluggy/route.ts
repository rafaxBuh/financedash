import { NextRequest, NextResponse } from 'next/server'
import { getDB, initDB } from '@/lib/db'
import { syncItem, getPluggyClient } from '@/lib/pluggy'

async function handleItemCreated(itemId: string) {
  await initDB()
  const sql = getDB()
  const pluggy = getPluggyClient()

  // Fetch institution name from Pluggy
  let institutionName: string | null = null
  try {
    const item = await pluggy.fetchItem(itemId)
    institutionName = item.connector?.name ?? null
  } catch {}

  // Upsert connected account
  const id = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
  await sql`
    INSERT INTO connected_accounts (id, item_id, institution_name)
    VALUES (${id}, ${itemId}, ${institutionName})
    ON CONFLICT (item_id) DO UPDATE SET institution_name = EXCLUDED.institution_name
  `

  // Sync transactions in background (fire & forget)
  syncItem(itemId).catch((err) => console.error('Webhook sync error:', err))
}

async function handleItemUpdated(itemId: string) {
  // Sync new transactions in background (fire & forget)
  syncItem(itemId).catch((err) => console.error('Webhook sync error:', err))
}

async function handleItemError(itemId: string, error: unknown) {
  console.error(`Pluggy item ${itemId} error:`, error)
}

export async function POST(req: NextRequest) {
  const event = await req.json()

  console.log('Pluggy webhook:', event.event, '| eventId:', event.eventId)

  // Process event and return 2XX within 5 seconds
  switch (event.event) {
    case 'item/created':
      await handleItemCreated(event.itemId)
      break
    case 'item/updated':
      await handleItemUpdated(event.itemId)
      break
    case 'item/error':
      await handleItemError(event.itemId, event.error)
      break
    default:
      console.log('Unhandled Pluggy event:', event.event)
  }

  return NextResponse.json({ received: true })
}
