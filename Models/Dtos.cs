namespace VoteLive.Models;

public record CreatePollRequest(string Title, string? Description, bool IsMultipleChoice, List<string> Options);
public record PollResponse(int Id, string Title, string? Description, bool IsMultipleChoice, string ShareCode, DateTime CreatedAt, List<OptionResponse> Options);
public record OptionResponse(int Id, string Text);
public record VoteRequest(List<int> OptionIds);
public record ResultsResponse(string Title, string? Description, int TotalVotes, List<OptionResult> Options);
public record OptionResult(int Id, string Text, int Votes);
