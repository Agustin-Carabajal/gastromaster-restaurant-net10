namespace GastroMaster.Api.Models;

public class DailySaleItemSummary
{
    public string ProductName { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public int QuantitySold { get; set; }
    public decimal UnitPrice { get; set; }
    public decimal TotalSales => QuantitySold * UnitPrice;
    public decimal Cost { get; set; }
}

public class DailyClosing
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public DateTime Date { get; set; } = DateTime.UtcNow;
    public string ClosedBy { get; set; } = "Gerencia General";
    public List<DailySaleItemSummary> ItemsSummary { get; set; } = new();
    
    // Exact totals from legacy image modern implementation
    public decimal TotalGrossSales { get; set; } // S/. 672.50
    public decimal TotalTax { get; set; }        // S/. 121.05 (18% IGV)
    public decimal TotalNetSales { get; set; }    // S/. 551.45
    
    // Cash Drawer Reconciliation
    public decimal CashExpected { get; set; }
    public decimal CashCounted { get; set; }
    public decimal CashDifference => CashCounted - CashExpected;
    
    // Payment breakdown
    public decimal CardSales { get; set; }
    public decimal DigitalWalletSales { get; set; }
    public decimal PointsDiscountTotal { get; set; }
    
    public int TablesServed { get; set; }
    public int TotalCustomers { get; set; }
    public decimal AverageTicket => TablesServed > 0 ? TotalGrossSales / TablesServed : 0;
    public string? Notes { get; set; }
}
