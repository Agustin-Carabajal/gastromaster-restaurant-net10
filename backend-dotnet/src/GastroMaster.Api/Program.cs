using GastroMaster.Api.Data;
using GastroMaster.Api.Hubs;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container (.NET 10)
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new() { Title = "GastroMaster API .NET 10", Version = "v1" });
});

// Configure EF Core In-Memory or SQL
builder.Services.AddDbContext<RestaurantDbContext>(options =>
    options.UseInMemoryDatabase("GastroMasterDb"));

// Configure SignalR for real-time Kitchen Display System (KDS)
builder.Services.AddSignalR();

// Configure CORS for Vite + React 19 Frontend
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontendApp", policy =>
    {
        policy.WithOrigins("http://localhost:3000", "https://localhost:3000")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

var app = builder.Build();

// Configure the HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseCors("AllowFrontendApp");
app.UseAuthorization();

// Map REST Controllers & SignalR Hubs
app.MapControllers();
app.MapHub<KitchenHub>("/hubs/kitchen");

// Seed initial database
using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<RestaurantDbContext>();
    context.Database.EnsureCreated();
}

app.Run();
