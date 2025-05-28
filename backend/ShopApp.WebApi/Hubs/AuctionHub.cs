using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using ShopApp.Application.DTOs;

namespace ShopApp.WebApi.Hubs
{
    [Authorize]
    public class AuctionHub : Hub
    {
        public async Task JoinAuction(string auctionId)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, auctionId);
            await Clients.Caller.SendAsync("JoinedAuction", auctionId);
        }

        public async Task LeaveAuction(string auctionId)
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, auctionId);
            await Clients.Caller.SendAsync("LeftAuction", auctionId);
        }

        public async Task SendBidUpdate(string auctionId, decimal bidAmount)
        {
            // This method is called by clients to notify others about their bid intention
            // The actual bid processing happens in the PlaceBidCommandHandler
            await Clients.OthersInGroup(auctionId).SendAsync("BidIntention", new {
                UserId = Context.UserIdentifier,
                AuctionId = auctionId,
                BidAmount = bidAmount,
                Timestamp = DateTime.UtcNow
            });
        }

        public override async Task OnConnectedAsync()
        {
            await Clients.Caller.SendAsync("Connected", Context.ConnectionId);
            await base.OnConnectedAsync();
        }

        public override async Task OnDisconnectedAsync(Exception exception)
        {
            await Clients.Caller.SendAsync("Disconnected", Context.ConnectionId);
            await base.OnDisconnectedAsync(exception);
        }

        // Geriye sayaç güncellemesi gönderme
        public async Task SendCountdownUpdate(string auctionId, int remainingSeconds)
        {
            await Clients.Group(auctionId).SendAsync("CountdownUpdate", new {
                AuctionId = auctionId,
                RemainingSeconds = remainingSeconds
            });
        }

        // Açık artırma durumu güncellemesi gönderme
        public async Task SendAuctionStatusUpdate(string auctionId, string status)
        {
            await Clients.Group(auctionId).SendAsync("StatusUpdate", new {
                AuctionId = auctionId,
                Status = status
            });
        }

        // Açık artırma bilgilerini güncelleme
        public async Task SendAuctionUpdate(AuctionDto auction)
        {
            await Clients.Group(auction.Id.ToString()).SendAsync("AuctionUpdate", auction);
        }
    }
}