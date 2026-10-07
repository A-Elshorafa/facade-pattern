# Facade Pattern – Bank Example (.NET 10)

## What is the Facade pattern?

A **Facade** gives clients one simple entry point to a set of more complex classes. The client doesn't need to know which classes exist, how they are created, or in what order they must be called.

Here the complex subsystem is the set of account classes (`SavingsAccount`, `ChequingAccount`, `InvestmentAccount`). The facade is `BankService`.

## Structure

```
HTTP endpoint (Program.cs)
        │
        ▼
 BankService  ◄── Facade (Services/BankService.cs)
        │
        ▼
 IBankAccount ◄── Subsystem (Accounts/)
   ├── SavingsAccount     (SAV-xxxxxx)
   ├── ChequingAccount    (CHQ-xxxxxx, overdraft up to 500)
   └── InvestmentAccount  (INV-xxxxxx, 2.50 fee per withdrawal)
```

Every account implements four operations: `Deposit`, `Withdraw`, `Transfer`, `GetAccountNumber`.

## Flow 1 – Create an account

`POST /api/accounts` with `{ "type": "Savings", "openingBalance": 1000 }`

1. The endpoint passes the type to `BankService.CreateNewBankAccount`.
2. The facade generates an id, picks the right concrete class for the type, and stores the account.
3. The endpoint returns the id, account number, type and balance.

The client never calls `new SavingsAccount(...)` or touches the account storage.

## Flow 2 – Get the account number

`GET /api/accounts/{id}/number`

1. The endpoint calls `BankService.GetAccountNumber(id)`.
2. The facade looks the account up and returns `GetAccountNumber()`, or 404 if it doesn't exist.

## Flow 3 – Transfer (withdraw from one account, deposit into another)

`POST /api/transfers` with `{ "fromAccountId": 1, "toAccountId": 2, "amount": 250 }`

1. The endpoint calls `BankService.Transfer(1, 2, 250)`.
2. The facade checks the two ids differ, then looks up both accounts (404 if either is missing).
3. It calls `from.Transfer(to, amount)`, which runs:
   1. `from.Withdraw(amount)` – applies the account's own rules (Chequing overdraft, Investment fee). Throws if funds are insufficient, so nothing is deposited.
   2. `to.Deposit(amount)`.
4. The endpoint returns the updated balances of both accounts.

```
Client ──POST /api/transfers──► BankService.Transfer
                                    ├─ Find(from), Find(to)
                                    └─ from.Transfer(to, amount)
                                          ├─ from.Withdraw(amount)  ← account-specific rules
                                          └─ to.Deposit(amount)
```

## Why it helps

- The endpoints depend on one class, `BankService`, not on three account types.
- Adding a new account type only changes the facade's `switch` and a new class; the endpoints don't change.
- Lookup, validation and the withdraw-then-deposit ordering live in one place.

## Run it

```bash
dotnet run
```

Open http://localhost:5080/swagger and try, in order: create two accounts, get a number, transfer between them.

Accounts are stored in memory and reset on restart.
