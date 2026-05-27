/** @type {import('next').NextConfig} */

const securityHeaders = [
  { key: 'X-DNS-Prefetch-Control', value: 'off' },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()' },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.pluggy.ai blob:",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://*.pluggy.ai",
      "font-src 'self' data: https://fonts.gstatic.com https://*.pluggy.ai",
      "img-src 'self' data: https:",
      "connect-src 'self' https://*.pluggy.ai wss://*.pluggy.ai",
      "frame-src 'self' https://*.pluggy.ai",
      "worker-src 'self' blob: https://*.pluggy.ai",
      "child-src 'self' blob: https://*.pluggy.ai",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join('; '),
  },
]

const nextConfig = {
  experimental: {
    // Desativa o router cache client-side para páginas dinâmicas.
    // Sem isso, Next.js serve a versão em memória por 30s mesmo com force-dynamic,
    // fazendo dados recém-salvos não aparecerem ao navegar entre abas.
    staleTimes: {
      dynamic: 0,
    },
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
      {
        source: '/sw.js',
        headers: [
          { key: 'Cache-Control', value: 'no-cache, no-store, must-revalidate' },
          { key: 'Content-Type', value: 'application/javascript; charset=utf-8' },
          { key: 'Service-Worker-Allowed', value: '/' },
        ],
      },
    ]
  },
}

module.exports = nextConfig
