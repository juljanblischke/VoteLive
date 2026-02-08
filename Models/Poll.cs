namespace VoteLive.Models;

public class Poll
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public bool IsMultipleChoice { get; set; }
    public string ShareCode { get; set; } = string.Empty;
    public List<Option> Options { get; set; } = new();
}

public class Option
{
    public int Id { get; set; }
    public int PollId { get; set; }
    public string Text { get; set; } = string.Empty;
    public Poll Poll { get; set; } = null!;
    public List<Vote> Votes { get; set; } = new();
}

public class Vote
{
    public int Id { get; set; }
    public int OptionId { get; set; }
    public string? VoterIp { get; set; }
    public DateTime VotedAt { get; set; } = DateTime.UtcNow;
    public Option Option { get; set; } = null!;
}
