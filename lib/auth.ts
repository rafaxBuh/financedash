import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { getDB } from './db'
import { isRateLimited } from './rate-limit'
import type { NextAuthOptions } from 'next-auth'

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Senha', type: 'password' },
      },
      async authorize(credentials, req) {
        if (!credentials?.email || !credentials?.password) return null

        // Rate limit: 10 attempts per IP per 15 minutes
        const ip =
          (req as { headers?: Record<string, string> }).headers?.['x-forwarded-for']?.split(',')[0]?.trim() ??
          'unknown'
        if (isRateLimited(`login:${ip}`, 10, 15 * 60 * 1000)) {
          throw new Error('Muitas tentativas. Aguarde 15 minutos.')
        }

        const sql = getDB()
        const rows = await sql`
          SELECT id, email, password_hash FROM users WHERE email = ${credentials.email} LIMIT 1
        `
        if (rows.length === 0) return null

        const user = rows[0] as { id: string; email: string; password_hash: string }
        const valid = await bcrypt.compare(credentials.password, user.password_hash)
        if (!valid) return null

        return { id: user.id, email: user.email }
      },
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 8 * 60 * 60, // 8 hours
  },
  jwt: {
    maxAge: 8 * 60 * 60,
  },
  pages: { signIn: '/login' },
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.id = user.id
      return token
    },
    async session({ session, token }) {
      if (session.user && token.id) {
        (session.user as { id?: string }).id = token.id as string
      }
      return session
    },
  },
}
