using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.SignalR;
using VoteLive.Data;
using VoteLive.Models;
using VoteLive.Hubs;

var builder = WebApplication.CreateBuilder(args);

// Database
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")
        ?? "Host=localhost;Port=5432;Database=votelive;Username=votelive;Password=votelive"));

// SignalR + Redis backplane
builder.Services.AddSignalR()
    .AddStackExchangeRedis(builder.Configuration.GetConnectionString("Redis") ?? "localhost:6379");

// CORS for Vite dev server
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.WithOrigins("http://localhost:5173")
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials();
    });
});

builder.Services.AddOpenApi();

var app = builder.Build();

// Auto-migrate
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    db.Database.Migrate();
}

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseCors();

// --- API Endpoints ---

app.MapPost("/api/polls", async (CreatePollRequest request, AppDbContext db) =>
{
    if (string.IsNullOrWhiteSpace(request.Title))
        return Results.BadRequest(new { error = "Title is required" });
    if (request.Options == null || request.Options.Count < 2)
        return Results.BadRequest(new { error = "At least 2 options are required" });
    if (request.Options.Count > 10)
        return Results.BadRequest(new { error = "Maximum 10 options allowed" });

    var poll = new Poll
    {
        Title = request.Title.Trim(),
        Description = request.Description?.Trim(),
        IsMultipleChoice = request.IsMultipleChoice,
        ShareCode = GenerateShareCode(),
        Options = request.Options.Select(text => new Option { Text = text.Trim() }).ToList()
    };

    db.Polls.Add(poll);
    await db.SaveChangesAsync();

    var response = new PollResponse(poll.Id, poll.Title, poll.Description, poll.IsMultipleChoice, poll.ShareCode, poll.CreatedAt,
        poll.Options.Select(o => new OptionResponse(o.Id, o.Text)).ToList());

    return Results.Created($"/api/polls/{poll.ShareCode}", response);
});

app.MapGet("/api/polls/{shareCode}", async (string shareCode, AppDbContext db) =>
{
    var poll = await db.Polls
        .Include(p => p.Options)
        .FirstOrDefaultAsync(p => p.ShareCode == shareCode);

    if (poll is null) return Results.NotFound(new { error = "Poll not found" });

    var response = new PollResponse(poll.Id, poll.Title, poll.Description, poll.IsMultipleChoice, poll.ShareCode, poll.CreatedAt,
        poll.Options.Select(o => new OptionResponse(o.Id, o.Text)).ToList());

    return Results.Ok(response);
});

app.MapPost("/api/polls/{shareCode}/vote", async (string shareCode, VoteRequest request, AppDbContext db, IHubContext<PollHub> hubContext, HttpContext httpContext) =>
{
    var poll = await db.Polls
        .Include(p => p.Options)
        .FirstOrDefaultAsync(p => p.ShareCode == shareCode);

    if (poll is null) return Results.NotFound(new { error = "Poll not found" });

    if (request.OptionIds == null || request.OptionIds.Count == 0)
        return Results.BadRequest(new { error = "At least one option must be selected" });

    if (!poll.IsMultipleChoice && request.OptionIds.Count > 1)
        return Results.BadRequest(new { error = "This poll only allows a single choice" });

    var validOptionIds = poll.Options.Select(o => o.Id).ToHashSet();
    if (!request.OptionIds.All(id => validOptionIds.Contains(id)))
        return Results.BadRequest(new { error = "Invalid option ID" });

    var voterIp = httpContext.Connection.RemoteIpAddress?.ToString();

    var votes = request.OptionIds.Select(optionId => new Vote
    {
        OptionId = optionId,
        VoterIp = voterIp
    }).ToList();

    db.Votes.AddRange(votes);
    await db.SaveChangesAsync();

    // Broadcast updated results
    var results = await GetResults(shareCode, db);
    if (results is not null)
        await hubContext.Clients.Group(shareCode).SendAsync("VoteUpdate", results);

    return Results.Ok(new { message = "Vote recorded" });
});

app.MapGet("/api/polls/{shareCode}/results", async (string shareCode, AppDbContext db) =>
{
    var results = await GetResults(shareCode, db);
    if (results is null) return Results.NotFound(new { error = "Poll not found" });
    return Results.Ok(results);
});

// Health check for Docker / load balancer
app.MapGet("/health", () => Results.Ok(new { status = "healthy", timestamp = DateTime.UtcNow }));

// SignalR hub
app.MapHub<PollHub>("/hubs/poll");

app.Run();

// --- Helper functions ---

static string GenerateShareCode()
{
    const string chars = "abcdefghijklmnopqrstuvwxyz0123456789";
    return new string(Enumerable.Range(0, 8).Select(_ => chars[Random.Shared.Next(chars.Length)]).ToArray());
}

static async Task<ResultsResponse?> GetResults(string shareCode, AppDbContext db)
{
    var poll = await db.Polls
        .Include(p => p.Options)
        .ThenInclude(o => o.Votes)
        .FirstOrDefaultAsync(p => p.ShareCode == shareCode);

    if (poll is null) return null;

    var optionResults = poll.Options.Select(o => new OptionResult(o.Id, o.Text, o.Votes.Count)).ToList();
    return new ResultsResponse(poll.Title, poll.Description, optionResults.Sum(o => o.Votes), optionResults);
}
