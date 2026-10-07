namespace BankFacade.Accounts;

public class ChequingAccount(int id, decimal openingBalance)
    : BankAccountBase(id, AccountType.Chequing, "CHQ", openingBalance)
{
    protected override decimal OverdraftLimit => 500m;
}
