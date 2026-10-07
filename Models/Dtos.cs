using BankFacade.Accounts;

namespace BankFacade.Models;

public record CreateAccountRequest(AccountType Type, decimal OpeningBalance = 0);
public record AccountResponse(int Id, string AccountNumber, AccountType Type, decimal Balance);
public record AccountNumberResponse(int Id, string AccountNumber);
public record TransferRequest(int FromAccountId, int ToAccountId, decimal Amount);
public record TransferResponse(AccountResponse From, AccountResponse To, decimal Amount);
