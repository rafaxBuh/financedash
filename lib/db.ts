import { neon } from '@neondatabase/serverless'

function createSQL() {
  const url = process.env.DATABASE_URL
  if (!url) throw new Error('DATABASE_URL environment variable is not set')
  return neon(url)
}

export function getDB() {
  return createSQL()
}

export async function initDB() {
  const sql = getDB()
  await sql`
    CREATE TABLE IF NOT EXISTS transactions (
      id TEXT PRIMARY KEY,
      description TEXT NOT NULL,
      amount NUMERIC(12, 2) NOT NULL,
      type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
      category TEXT NOT NULL,
      date DATE NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `
  await sql`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `
  await sql`
    CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE(name, type)
    )
  `
  await sql`
    CREATE TABLE IF NOT EXISTS connected_accounts (
      id TEXT PRIMARY KEY,
      item_id TEXT UNIQUE NOT NULL,
      institution_name TEXT,
      last_synced_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `

  // Seed default categories
  const defaultExpense = ['Alimentação','Transporte','Saúde','Lazer','Moradia','Educação','Compras','Outros']
  const defaultIncome  = ['Salário','Freelance','Investimentos','Outros']
  for (const name of defaultExpense) {
    const id = `exp-${name.toLowerCase().replace(/\s/g,'-')}`
    await sql`INSERT INTO categories (id, name, type) VALUES (${id}, ${name}, 'expense') ON CONFLICT DO NOTHING`
  }
  for (const name of defaultIncome) {
    const id = `inc-${name.toLowerCase().replace(/\s/g,'-')}`
    await sql`INSERT INTO categories (id, name, type) VALUES (${id}, ${name}, 'income') ON CONFLICT DO NOTHING`
  }
}
