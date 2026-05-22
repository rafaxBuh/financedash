import { neon, NeonQueryFunction } from '@neondatabase/serverless'
import bcrypt from 'bcryptjs'

// Cache the SQL client per process
let _sql: NeonQueryFunction<false, false> | null = null

export function getDB(): NeonQueryFunction<false, false> {
  if (!_sql) {
    const url = process.env.DATABASE_URL
    if (!url) throw new Error('DATABASE_URL environment variable is not set')
    _sql = neon(url)
  }
  return _sql
}

// Run initDB only once per server process
let _initPromise: Promise<void> | null = null

export function initDB(): Promise<void> {
  if (!_initPromise) {
    _initPromise = _runInit().catch((err) => {
      _initPromise = null // allow retry on failure
      throw err
    })
  }
  return _initPromise
}

async function _runInit() {
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

  await sql`
    CREATE TABLE IF NOT EXISTS goals (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      type TEXT NOT NULL CHECK (type IN ('savings', 'expense_limit', 'income_target')),
      target_amount NUMERIC(12, 2) NOT NULL,
      category TEXT,
      deadline DATE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `

  // Create admin user from env vars (runs once — ON CONFLICT DO NOTHING)
  const adminEmail = process.env.ADMIN_EMAIL
  const adminPassword = process.env.ADMIN_PASSWORD
  if (adminEmail && adminPassword) {
    const existing = await sql`SELECT id FROM users WHERE email = ${adminEmail} LIMIT 1`
    if (existing.length === 0) {
      const hash = await bcrypt.hash(adminPassword, 12)
      const id = crypto.randomUUID()
      await sql`INSERT INTO users (id, email, password_hash) VALUES (${id}, ${adminEmail}, ${hash}) ON CONFLICT DO NOTHING`
    }
  }
}
