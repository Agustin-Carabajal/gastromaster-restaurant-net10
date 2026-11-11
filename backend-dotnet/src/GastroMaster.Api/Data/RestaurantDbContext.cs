using GastroMaster.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace GastroMaster.Api.Data;

public class RestaurantDbContext : DbContext
{
    public RestaurantDbContext(DbContextOptions<RestaurantDbContext> options) : base(options)
    {
    }

    public DbSet<DailyClosing> DailyClosings => Set<DailyClosing>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Seed with data identical to legacy image
        modelBuilder.Entity<DailyClosing>().HasData(new DailyClosing
        {
            Id = "CIERRE-2026-11-10",
            Date = DateTime.UtcNow,
            ClosedBy = "Gerencia General (Agustín)",
            TotalGrossSales = 672.50m,
            TotalTax = 121.05m,
            TotalNetSales = 551.45m,
            CashExpected = 380.50m,
            CashCounted = 380.50m,
            CardSales = 212.00m,
            DigitalWalletSales = 80.00m,
            TablesServed = 38,
            TotalCustomers = 86
        });
    }
}
