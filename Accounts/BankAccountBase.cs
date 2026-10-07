namespace BankFacade.Accounts;

public abstract class BankAccountBase(int id, AccountType type, string prefix, decimal openingBalance) : IBankAccount
{
    private readonly string _accountNumber = $"{prefix}-{id:D6}";
    private readonly object _lock = new();

    public int Id { get; } = id;
    public AccountType Type { get; } = type;
    public decimal Balance { get; private set; } = openingBalance;

    /// <summary>How far below zero the balance may go (0 = not allowed).</summary>
    protected virtual decimal OverdraftLimit => 0m;

    /// <summary>Extra fee charged on every withdrawal.</summary>
    protected virtual decimal WithdrawalFee => 0m;

    public void Deposit(decimal amount)
    {
        if (amount <= 0) throw new InvalidOperationException("Deposit amount must be positive.");
        lock (_lock) Balance += amount;
    }

    public void Withdraw(decimal amount)
    {
        if (amount <= 0) throw new InvalidOperationException("Withdrawal amount must be positive.");
        lock (_lock)
        {
            var total = amount + WithdrawalFee;
            if (Balance + OverdraftLimit < total)
                throw new InvalidOperationException(
                    $"Insufficient funds in {Type} account {_accountNumber}: need {total}, available {Balance + OverdraftLimit}.");
            Balance -= total;
        }
    }

    public void Transfer(IBankAccount destination, decimal amount)
    {
        Withdraw(amount);
        destination.Deposit(amount);
    }

    public string GetAccountNumber() => _accountNumber;
}
