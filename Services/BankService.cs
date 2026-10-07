using System.Collections.Concurrent;
using BankFacade.Accounts;

namespace BankFacade.Services;

/// <summary>
/// The Facade: hides account creation, lookup, and the withdraw+deposit
/// choreography behind two simple operations.
/// </summary>
public class BankService
{
    private readonly ConcurrentDictionary<int, IBankAccount> _accounts = new();
    private int _nextId;

    public IBankAccount CreateNewBankAccount(AccountType type, decimal openingBalance = 0)
    {
        if (openingBalance < 0) throw new InvalidOperationException("Opening balance cannot be negative.");

        var id = Interlocked.Increment(ref _nextId);
        IBankAccount account = type switch
        {
            AccountType.Savings => new SavingsAccount(id, openingBalance),
            AccountType.Chequing => new ChequingAccount(id, openingBalance),
            AccountType.Investment => new InvestmentAccount(id, openingBalance),
            _ => throw new InvalidOperationException($"Unsupported account type '{type}'.")
        };
        _accounts[id] = account;
        return account;
    }

    public IBankAccount? Find(int id) => _accounts.GetValueOrDefault(id);

    public string? GetAccountNumber(int id) => Find(id)?.GetAccountNumber();

    public void Transfer(int fromId, int toId, decimal amount)
    {
        if (fromId == toId) throw new InvalidOperationException("Cannot transfer to the same account.");
        var from = Find(fromId) ?? throw new KeyNotFoundException($"Account {fromId} not found.");
        var to = Find(toId) ?? throw new KeyNotFoundException($"Account {toId} not found.");

        from.Transfer(to, amount);
    }
}
