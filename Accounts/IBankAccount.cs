namespace BankFacade.Accounts;

public interface IBankAccount
{
    int Id { get; }
    AccountType Type { get; }
    decimal Balance { get; }

    void Deposit(decimal amount);
    void Withdraw(decimal amount);
    void Transfer(IBankAccount destination, decimal amount);
    string GetAccountNumber();
}
