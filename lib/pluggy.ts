import { PluggyClient } from 'pluggy-sdk'

export function getPluggyClient(): PluggyClient {
  return new PluggyClient({
    clientId: process.env.PLUGGY_CLIENT_ID!,
    clientSecret: process.env.PLUGGY_CLIENT_SECRET!,
  })
}

export async function getConnectToken(clientUserId?: string): Promise<string> {
  const pluggy = getPluggyClient()
  const result = await pluggy.createConnectToken(undefined, { clientUserId })
  return result.accessToken
}

export async function getAccounts(itemId: string) {
  const pluggy = getPluggyClient()
  const result = await pluggy.fetchAccounts(itemId)
  return result.results
}

export async function getTransactions(accountId: string, from: string, to: string) {
  const pluggy = getPluggyClient()
  const all = []
  let page = 1

  while (true) {
    const result = await pluggy.fetchTransactions(accountId, {
      from,
      to,
      pageSize: 100,
      page,
    })
    all.push(...result.results)
    if (result.results.length < 100) break
    page++
  }

  return all
}
