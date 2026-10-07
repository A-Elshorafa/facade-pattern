namespace BankFacade.Accounts;

public class SavingsAccount(int id, decimal openingBalance)
    : BankAccountBase(id, AccountType.Savings, "SAV", openingBalance);
