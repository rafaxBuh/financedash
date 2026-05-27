import { addDays, addWeeks, addMonths, addYears, format, parseISO } from 'date-fns'
import { getDB } from './db'
import { safeId } from './validate'
import type { Frequency } from './types'

function nextOccurrence(dateStr: string, frequency: Frequency): string {
  const date = parseISO(dateStr)
  let next: Date
  switch (frequency) {
    case 'daily':   next = addDays(date, 1);   break
    case 'weekly':  next = addWeeks(date, 1);  break
    case 'monthly': next = addMonths(date, 1); break
    case 'yearly':  next = addYears(date, 1);  break
  }
  return format(next, 'yyyy-MM-dd')
}

export async function processDueRecurring(): Promise<void> {
  try {
    const sql = getDB()
    const today = format(new Date(), 'yyyy-MM-dd')

    const due = await sql`
      SELECT id, user_id, description, amount, type, category, frequency,
             to_char(next_date, 'YYYY-MM-DD') AS next_date,
             to_char(end_date,  'YYYY-MM-DD') AS end_date
      FROM recurring_transactions
      WHERE active = TRUE AND next_date <= ${today}
    `

    for (const r of due) {
      const endDate = r.end_date as string | null

      // If end_date passed, deactivate without generating a transaction
      if (endDate && r.next_date > endDate) {
        await sql`UPDATE recurring_transactions SET active = FALSE WHERE id = ${r.id}`
        continue
      }

      const txId = safeId()
      await sql`
        INSERT INTO transactions (id, user_id, description, amount, type, category, date)
        VALUES (${txId}, ${r.user_id}, ${r.description}, ${r.amount}, ${r.type}, ${r.category}, ${r.next_date})
      `

      const next = nextOccurrence(r.next_date as string, r.frequency as Frequency)

      // If next occurrence is past end_date, deactivate instead of scheduling another
      if (endDate && next > endDate) {
        await sql`
          UPDATE recurring_transactions SET next_date = ${next}, active = FALSE WHERE id = ${r.id}
        `
      } else {
        await sql`UPDATE recurring_transactions SET next_date = ${next} WHERE id = ${r.id}`
      }
    }
  } catch {
    // Silently skip if table not yet created
  }
}
