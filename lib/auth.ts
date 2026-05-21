import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { getDB, initDB } from './db'
import type { NextAuthOptions } from 'next-auth'

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Senha', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        await initDB()
        const sql = getDB()

        // Seed admin user on first login if env vars are set and no users exist
        const adminEmail = process.env.ADMIN_EMAIL
        const adminPassword = process.env.ADMIN_PASSWORD
        if (adminEmail && adminPassword) {
          const existing = await sql`SELECT id FROM users WHERE email = ${adminEmail} LIMIT 1`
          if (existing.length === 0) {
            const hash = await bcrypt.hash(adminPassword, 12)
            const id = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
            await sql`INSERT INTO users (id, email, password_hash) VALUES (${id}, ${adminEmail}, ${hash})`
          }
        }

        const rows = await sql`SELECT id, email, password_hash FROM users WHERE email = ${credentials.email} LIMIT 1`
        if (rows.length === 0) return null

        const user = rows[0] as { id: string; email: string; password_hash: string }
        const valid = await bcrypt.compare(credentials.password, user.password_hash)
        if (!valid) return null

        return { id: user.id, email: user.email }
      },
    }),
  ],
  session: { strategy: 'jwt' },
  pages: { signIn: '/login' },
  secret: process.env.NEXTAUTH_SECRET,
}
