using Microsoft.AspNetCore.SignalR;

namespace GastroMaster.Api.Hubs;

public class KitchenHub : Hub
{
    public async Task SendNewOrderToKitchen(string tableNumber, string itemsJson)
    {
        await Clients.All.SendAsync("OrderReceived", tableNumber, itemsJson, DateTime.UtcNow);
    }

    public async Task UpdateItemCookingStatus(string tableNumber, string itemId, string status)
    {
        await Clients.All.SendAsync("StatusChanged", tableNumber, itemId, status);
    }
}
