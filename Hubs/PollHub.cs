using Microsoft.AspNetCore.SignalR;

namespace VoteLive.Hubs;

public class PollHub : Hub
{
    public async Task JoinPoll(string shareCode)
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, shareCode);
    }

    public async Task LeavePoll(string shareCode)
    {
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, shareCode);
    }
}
