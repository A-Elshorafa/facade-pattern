import { useState } from 'react'
import { createAccount, getAccountNumber, transfer } from './api.js'

const TYPES = ['Savings', 'Chequing', 'Investment']
const BADGE = {
  Savings: 'bg-emerald-100 text-emerald-700',
  Chequing: 'bg-sky-100 text-sky-700',
  Investment: 'bg-violet-100 text-violet-700',
}
const money = (n) => Number(n).toLocaleString(undefined, { style: 'currency', currency: 'USD' })

const inputCls =
  'w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-base focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200'
const btnCls =
  'w-full rounded-lg bg-indigo-600 px-4 py-2.5 font-medium text-white transition hover:bg-indigo-700 disabled:opacity-50 sm:w-auto'

function Card({ title, step, children }) {
  return (
    <section className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200 sm:p-6">
      <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-slate-800">
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-600 text-sm text-white">{step}</span>
        {title}
      </h2>
      {children}
    </section>
  )
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-slate-600">{label}</span>
      {children}
    </label>
  )
}

export default function App() {
  const [accounts, setAccounts] = useState([])
  const [toast, setToast] = useState(null)

  const [type, setType] = useState('Savings')
  const [opening, setOpening] = useState('1000')
  const [lookupId, setLookupId] = useState('')
  const [lookupResult, setLookupResult] = useState(null)
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [amount, setAmount] = useState('')
  const [busy, setBusy] = useState(false)

  const notify = (kind, msg) => {
    setToast({ kind, msg })
    setTimeout(() => setToast(null), 5000)
  }

  const run = async (fn) => {
    setBusy(true)
    try { await fn() } catch (e) { notify('error', e.message === 'Failed to fetch' ? 'Cannot reach the backend on :8092 — is it running?' : e.message) }
    finally { setBusy(false) }
  }

  const upsert = (acc) =>
    setAccounts((list) => (list.some((a) => a.id === acc.id) ? list.map((a) => (a.id === acc.id ? acc : a)) : [...list, acc]))

  const onCreate = (e) => {
    e.preventDefault()
    run(async () => {
      const acc = await createAccount(type, Number(opening) || 0)
      upsert(acc)
      notify('ok', `Created ${acc.accountNumber}`)
    })
  }

  const onLookup = (e) => {
    e.preventDefault()
    run(async () => setLookupResult(await getAccountNumber(Number(lookupId))))
  }

  const onTransfer = (e) => {
    e.preventDefault()
    run(async () => {
      const res = await transfer(Number(from), Number(to), Number(amount))
      upsert(res.from)
      upsert(res.to)
      notify('ok', `Transferred ${money(res.amount)} from ${res.from.accountNumber} to ${res.to.accountNumber}`)
      setAmount('')
    })
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 sm:py-10">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">Bank Facade Tester</h1>
        <p className="text-sm text-slate-500">Every action below goes through the <code className="rounded bg-slate-200 px-1">BankService</code> facade.</p>
      </header>

      {toast && (
        <div
          role="status"
          className={`fixed inset-x-4 top-4 z-10 mx-auto max-w-md rounded-lg px-4 py-3 text-sm shadow-lg ${
            toast.kind === 'ok' ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
          }`}
        >
          {toast.msg}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 md:gap-6">
        <Card step="1" title="Create account">
          <form onSubmit={onCreate} className="space-y-3">
            <Field label="Account type">
              <div className="grid grid-cols-3 gap-2">
                {TYPES.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setType(t)}
                    className={`rounded-lg border px-2 py-2 text-sm font-medium transition ${
                      type === t ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-slate-300 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </Field>
            <Field label="Opening balance">
              <input type="number" min="0" step="0.01" inputMode="decimal" className={inputCls} value={opening} onChange={(e) => setOpening(e.target.value)} />
            </Field>
            <button className={btnCls} disabled={busy}>Create account</button>
          </form>
        </Card>

        <Card step="2" title="Get account number">
          <form onSubmit={onLookup} className="space-y-3">
            <Field label="Account ID">
              <input type="number" min="1" required inputMode="numeric" className={inputCls} value={lookupId} onChange={(e) => setLookupId(e.target.value)} />
            </Field>
            <button className={btnCls} disabled={busy}>Look up</button>
            {lookupResult && (
              <p className="rounded-lg bg-slate-100 px-3 py-2 font-mono text-sm text-slate-800">
                #{lookupResult.id} → {lookupResult.accountNumber}
              </p>
            )}
          </form>
        </Card>

        <div className="md:col-span-2">
          <Card step="3" title="Transfer money">
            <form onSubmit={onTransfer} className="grid gap-3 sm:grid-cols-3">
              <Field label="From (ID)">
                <input type="number" min="1" required inputMode="numeric" className={inputCls} value={from} onChange={(e) => setFrom(e.target.value)} />
              </Field>
              <Field label="To (ID)">
                <input type="number" min="1" required inputMode="numeric" className={inputCls} value={to} onChange={(e) => setTo(e.target.value)} />
              </Field>
              <Field label="Amount">
                <input type="number" min="0.01" step="0.01" required inputMode="decimal" className={inputCls} value={amount} onChange={(e) => setAmount(e.target.value)} />
              </Field>
              <div className="sm:col-span-3"><button className={btnCls} disabled={busy}>Transfer</button></div>
            </form>
          </Card>
        </div>

        <div className="md:col-span-2">
          <h2 className="mb-3 text-lg font-semibold text-slate-800">Accounts this session</h2>
          {accounts.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500">No accounts yet — create one above.</p>
          ) : (
            <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {accounts.map((a) => (
                <li key={a.id} className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-500">ID {a.id}</span>
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${BADGE[a.type]}`}>{a.type}</span>
                  </div>
                  <p className="mt-1 font-mono text-sm text-slate-700">{a.accountNumber}</p>
                  <p className="mt-2 text-2xl font-semibold text-slate-900">{money(a.balance)}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
