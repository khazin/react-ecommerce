using GrpcOrderService.Data;
using GrpcOrderService.Models;
using GrpcOrderService.Services;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddGrpc();
builder.Services.AddDbContext<OrderDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));
var app = builder.Build();


// Configure the HTTP request pipeline.

app.MapGrpcService<OrderServiceImpl>();
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<OrderDbContext>();
    db.Database.Migrate(); // Auto apply migration
    if (!db.Orders.Any())
    {
        db.Orders.AddRange(
            new Order { ProductId = 1, Quantity = 2, TotalPrice = 2400, OrderDate = DateTime.UtcNow, Status = "Completed" },
            new Order { ProductId = 3, Quantity = 1, TotalPrice = 150, OrderDate = DateTime.UtcNow.AddDays(-2), Status = "Pending" }
        );
        db.SaveChanges();
    }
}

app.MapGet("/", () => "Communication with gRPC endpoints must be made through a gRPC client. To learn how to create a client, visit: https://go.microsoft.com/fwlink/?linkid=2086909");

app.Run();
