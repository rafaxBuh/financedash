'use client'

import { useEffect, useState, useCallback } from 'react'
import Script from 'next/script'
import { Building2, Plus, Trash2, RefreshCw, CheckCircle } from 'lucide-react'

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

  const loadAccounts = useCallback(() => {
    fetch('/api/pluggy/accounts')
      .then((r) => r.json())
      .then(setAccounts)
      .finally(() => setMounted(true))
  }, [])

  useEffect(() => { loadAccounts() }, [loadAccounts])

  async function handleConnect() {
    setConnecting(true)
    try {
      const res = await fetch('/api/pluggy/connect-token', { method: 'POST' })
      if (!res.ok) throw new Error()
      const { token } = await res.json()

      const widget = new window.PluggyConnect({
        connectToken: token,
        onSuccess: async ({ item }: { item: { id: string; connector?: { name?: string } } }) => {
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
        onError: (err: unknown) => {
          console.error('Pluggy Connect error:', err)
        },
        onClose: () => setConnecting(false),
      })
      widget.init()
    } catch {
      alert('Erro ao abrir conexão bancária. Verifique as credenciais do Pluggy.')
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

  if (!mounted) {
    return (
      <div className="p-8 flex items-center justify-center h-64">
        <div className="text-text-muted text-sm">Carregando...</div>
      </div>
    )
  }

  return (
    <>
      <Script
        src="https://cdn.pluggy.ai/pluggy-connect/v2/pluggy-connect.js"
        onReady={() => setScriptReady(true)}
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
              className="flex items-center gap-2 px-4 py-2.5 bg-accent hover:bg-accent-hover text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-60"
            >
              <Plus className="w-4 h-4" />
              {connecting ? 'Abrindo...' : 'Conectar banco'}
            </button>
          </div>
        </div>

        {syncMessage && (
          <div className="flex items-center gap-2 bg-success/10 border border-success/20 rounded-xl px-4 py-3 text-success text-sm">
            <CheckCircle className="w-4 h-4 flex-shrink-0" />
            {syncMessage}
          </div>
        )}

        {accounts.length === 0 ? (
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
              className="flex items-center gap-2 px-5 py-2.5 bg-accent hover:bg-accent-hover text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-60"
            >
              <Plus className="w-4 h-4" />
              Conectar banco
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
