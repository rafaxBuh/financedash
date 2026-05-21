const PLUGGY_API = 'https://api.pluggy.ai'

async function getApiKey(): Promise<string> {
  const clientId = process.env.PLUGGY_CLIENT_ID
  const clientSecret = process.env.PLUGGY_CLIENT_SECRET
  if (!clientId || !clientSecret) {
    throw new Error('PLUGGY_CLIENT_ID e PLUGGY_CLIENT_SECRET não configurados')
  }

  const res = await fetch(`${PLUGGY_API}/auth`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ clientId, clientSecret }),
  })

  if (!res.ok) throw new Error('Erro ao autenticar no Pluggy')
  const data = await res.json()
  return data.apiKey as string
}

export async function getConnectToken(): Promise<string> {
  const apiKey = await getApiKey()
  const res = await fetch(`${PLUGGY_API}/connect_token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-API-KEY': apiKey },
    body: JSON.stringify({}),
  })
  if (!res.ok) throw new Error('Erro ao gerar connect token')
  const data = await res.json()
  return data.accessToken as string
}

export interface PluggyAccount {
  id: string
  name: string
  type: string
  balance: number
}

export interface PluggyTransaction {
  id: string
  description: string
  amount: number
  type: 'DEBIT' | 'CREDIT'
  date: string
  category: string | null
}

export async function getAccounts(itemId: string): Promise<PluggyAccount[]> {
  const apiKey = await getApiKey()
  const res = await fetch(`${PLUGGY_API}/accounts?itemId=${itemId}`, {
    headers: { 'X-API-KEY': apiKey },
  })
  if (!res.ok) throw new Error('Erro ao buscar contas')
  const data = await res.json()
  return data.results as PluggyAccount[]
}

export async function getTransactions(
  accountId: string,
  from: string,
  to: string
): Promise<PluggyTransaction[]> {
  const apiKey = await getApiKey()
  const all: PluggyTransaction[] = []
  let page = 1
  const pageSize = 100

  while (true) {
    const url = `${PLUGGY_API}/transactions?accountId=${accountId}&from=${from}&to=${to}&pageSize=${pageSize}&page=${page}`
    const res = await fetch(url, { headers: { 'X-API-KEY': apiKey } })
    if (!res.ok) break
    const data = await res.json()
    all.push(...(data.results as PluggyTransaction[]))
    if (data.results.length < pageSize) break
    page++
  }

  return all
}
