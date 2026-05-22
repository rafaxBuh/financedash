'use client'

import { useEffect, useState, useCallback } from 'react'
import Script from 'next/script'
import { Building2, Plus, Trash2, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react'

interface ConnectedAccount {
  id: string
  itemId: string
  institutionName: string | null
  lastSyncedAt: string | null
}

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    PluggyConnect: new (options: any) => { init: () => void }
  }
}

export default function ContasPage() {
  const [accounts, setAccounts] = useState<ConnectedAccount[]>([])
  const [mounted, setMounted] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const [syncMessage, setSyncMessage] = useState('')
  const [connecting, setConnecting] = useState(false)
  const [scriptReady, setScriptReady] = useState(false)
  const [connectError, setConnectError] = useState('')

  // Check for PluggyConnect on mount (handles cached script case)
  useEffect(() => {
    if (typeof window.PluggyConnect !== 'undefined') {
      setScriptReady(true)
    }
  }, [])

  const loadAccounts = useCallback(() => {
    fetch('/api/pluggy/accounts')
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setAccounts(data)
      })
      .finally(() => setMounted(true))
  }, [])

  useEffect(() => { loadAccounts() }, [loadAccounts])

  async function handleConnect() {
    setConnecting(true)
    setConnectError('')
    try {
      const res = await fetch('/api/pluggy/connect-token', { method: 'POST' })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error ?? `Erro ${res.status}`)
      }
      const { accessToken: token } = await res.json()

      if (typeof window.PluggyConnect === 'undefined') {
        throw new Error('Widget do Pluggy não carregou. Recarregue a página.')
      }

      const widget = new window.PluggyConnect({
        connectToken: token,
        includeSandbox: true,
        onSuccess: async ({ item }: { item: { id: string; connector?: { name?: string } } }) => {
          setConnecting(false)
          await fetch('/api/pluggy/accounts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              itemId: item.id,
              institutionName: item.connector?.name ?? null,
            }),
          })
          loadAccounts()
        },
        onError: (err: { message?: string }) => {
          console.error('Pluggy Connect error:', err)
          setConnectError(err?.message ?? 'Erro ao conectar banco.')
          setConnecting(false)
        },
        onClose: () => setConnecting(false),
      })
      widget.init()
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erro ao abrir conexão bancária.'
      setConnectError(msg)
      setConnecting(false)
    }
  }

  async function handleDelete(itemId: string) {
    await fetch(`/api/pluggy/accounts/${itemId}`, { method: 'DELETE' })
    setAccounts((prev) => prev.filter((a) => a.itemId !== itemId))
  }

  async function handleSync() {
    setSyncing(true)
    setSyncMessage('')
    try {
      const res = await fetch('/api/pluggy/sync', { method: 'POST' })
      const data = await res.json()
      setSyncMessage(data.message ?? 'Sincronização concluída')
      loadAccounts()
    } catch {
      setSyncMessage('Erro ao sincronizar.')
    } finally {
      setSyncing(false)
    }
  }

  return (
    <>
      {/* Load Pluggy script immediately — don't wait for accounts fetch */}
      <Script
        src="https://cdn.pluggy.ai/pluggy-connect/latest/pluggy-connect.js"
        strategy="afterInteractive"
        onLoad={() => setScriptReady(true)}
        onReady={() => setScriptReady(true)}
        onError={() => setConnectError('Falha ao carregar o widget do Pluggy.')}
      />

      <div className="p-6 lg:p-8 space-y-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold text-text-primary">Contas Bancárias</h1>
            <p className="text-text-muted text-sm mt-1">
              Conecte suas contas para importar transações automaticamente
            </p>
          </div>

          <div className="flex gap-3">
            {accounts.length > 0 && (
              <button
                onClick={handleSync}
                disabled={syncing}
                className="flex items-center gap-2 px-4 py-2.5 bg-surface hover:bg-surface-2 border border-border text-text-primary text-sm font-medium rounded-lg transition-colors disabled:opacity-60"
              >
                <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
                {syncing ? 'Sincronizando...' : 'Sincronizar tudo'}
              </button>
            )}
            <button
              onClick={handleConnect}
              disabled={connecting || !scriptReady}
              title={!scriptReady ? 'Carregando widget...' : undefined}
              className="flex items-center gap-2 px-4 py-2.5 bg-accent hover:bg-accent-hover text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-60 disabled:cursor-wait"
            >
              <Plus className="w-4 h-4" />
              {connecting ? 'Abrindo...' : !scriptReady ? 'Carregando...' : 'Conectar banco'}
            </button>
          </div>
        </div>

        {connectError && (
          <div className="flex items-start gap-2 bg-danger/10 border border-danger/20 rounded-xl px-4 py-3 text-danger text-sm">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{connectError}</span>
          </div>
        )}

        {syncMessage && (
          <div className="flex items-center gap-2 bg-success/10 border border-success/20 rounded-xl px-4 py-3 text-success text-sm">
            <CheckCircle className="w-4 h-4 flex-shrink-0" />
            {syncMessage}
          </div>
        )}

        {!mounted ? (
          <div className="bg-surface border border-border rounded-xl p-8 animate-pulse h-40" />
        ) : accounts.length === 0 ? (
          <div className="bg-surface border border-border rounded-xl p-12 flex flex-col items-center text-center gap-4">
            <div className="w-16 h-16 bg-surface-2 rounded-2xl flex items-center justify-center">
              <Building2 className="w-8 h-8 text-text-muted" />
            </div>
            <div>
              <p className="text-text-primary font-semibold">Nenhum banco conectado</p>
              <p className="text-text-muted text-sm mt-1">
                Conecte sua conta bancária para importar transações automaticamente
              </p>
            </div>
            <button
              onClick={handleConnect}
              disabled={connecting || !scriptReady}
              className="flex items-center gap-2 px-5 py-2.5 bg-accent hover:bg-accent-hover text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-60 disabled:cursor-wait"
            >
              <Plus className="w-4 h-4" />
              {!scriptReady ? 'Carregando...' : 'Conectar banco'}
            </button>
          </div>
        ) : (
          <div className="bg-surface border border-border rounded-xl divide-y divide-border">
            {accounts.map((account) => (
              <div key={account.id} className="flex items-center justify-between px-5 py-4 group">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-surface-2 rounded-lg flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-text-secondary" />
                  </div>
                  <div>
                    <p className="text-text-primary text-sm font-medium">
                      {account.institutionName ?? 'Banco conectado'}
                    </p>
                    <p className="text-text-muted text-xs mt-0.5">
                      {account.lastSyncedAt
                        ? `Última sincronização: ${new Date(account.lastSyncedAt).toLocaleString('pt-BR')}`
                        : 'Nunca sincronizado'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(account.itemId)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-danger/10 rounded-lg text-text-muted hover:text-danger"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="bg-surface-2 border border-border rounded-xl p-4">
          <p className="text-text-muted text-xs">
            A integração bancária utiliza a <strong className="text-text-secondary">Pluggy</strong> — plataforma regulamentada pelo Banco Central via Open Finance.
            Seus dados são criptografados e nunca armazenamos suas credenciais bancárias.
            Requer configuração das variáveis <code className="text-accent">PLUGGY_CLIENT_ID</code> e <code className="text-accent">PLUGGY_CLIENT_SECRET</code>.
          </p>
        </div>
      </div>
    </>
  )
}
