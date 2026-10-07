async function request(path, options) {
  const res = await fetch(path, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  const text = await res.text()
  let body = text
  try { body = text ? JSON.parse(text) : null } catch { /* plain-text error */ }
  if (!res.ok) throw new Error(typeof body === 'string' ? body : `Request failed (${res.status})`)
  return body
}

export const createAccount = (type, openingBalance) =>
  request('/api/accounts', { method: 'POST', body: JSON.stringify({ type, openingBalance }) })

export const getAccountNumber = (id) => request(`/api/accounts/${id}/number`)

export const transfer = (fromAccountId, toAccountId, amount) =>
  request('/api/transfers', { method: 'POST', body: JSON.stringify({ fromAccountId, toAccountId, amount }) })
