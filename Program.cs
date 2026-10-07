using BankFacade.Accounts;
using BankFacade.Models;
using BankFacade.Services;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddSingleton<BankService>();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.ConfigureHttpJsonOptions(o =>
    o.SerializerOptions.Converters.Add(new System.Text.Json.Serialization.JsonStringEnumConverter()));

var app = builder.Build();

app.UseSwagger();
app.UseSwaggerUI(o => o.RoutePrefix = "swagger");
app.MapGet("/", () => Results.Redirect("/swagger")).ExcludeFromDescription();

static AccountResponse ToDto(IBankAccount a) => new(a.Id, a.GetAccountNumber(), a.Type, a.Balance);

app.MapPost("/api/accounts", (CreateAccountRequest req, BankService bank) =>
{
    try
    {
        var account = bank.CreateNewBankAccount(req.Type, req.OpeningBalance);
        return Results.Created($"/api/accounts/{account.Id}/number", ToDto(account));
    }
    catch (InvalidOperationException ex) { return Results.BadRequest(ex.Message); }
})
.WithSummary("Create a new bank account (Savings, Chequing or Investment)");

app.MapGet("/api/accounts/{id:int}/number", (int id, BankService bank) =>
    bank.GetAccountNumber(id) is { } number
        ? Results.Ok(new AccountNumberResponse(id, number))
        : Results.NotFound($"Account {id} not found."))
.WithSummary("Get the account number of an account");

app.MapPost("/api/transfers", (TransferRequest req, BankService bank) =>
{
    try
    {
        bank.Transfer(req.FromAccountId, req.ToAccountId, req.Amount);
        return Results.Ok(new TransferResponse(
            ToDto(bank.Find(req.FromAccountId)!), ToDto(bank.Find(req.ToAccountId)!), req.Amount));
    }
    catch (KeyNotFoundException ex) { return Results.NotFound(ex.Message); }
    catch (InvalidOperationException ex) { return Results.BadRequest(ex.Message); }
})
.WithSummary("Transfer money from one account to another (withdraws from source, deposits to destination)");

app.Run();
