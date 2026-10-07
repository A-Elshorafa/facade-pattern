namespace BankFacade.Accounts;

public class InvestmentAccount(int id, decimal openingBalance)
    : BankAccountBase(id, AccountType.Investment, "INV", openingBalance)
{
    protected override decimal WithdrawalFee => 2.50m;
}
