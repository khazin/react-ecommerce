using GrpcProductService.Data;
using GrpcProductService.Models;
using GrpcProductService.Services;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddGrpc();
// Add DbContext with SQL Server connection string from appsettings.json
builder.Services.AddDbContext<ProductDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));
    
var app = builder.Build();

// Configure the HTTP request pipeline.
app.MapGrpcService<ProductServiceImpl>();
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<ProductDbContext>();
    db.Database.Migrate(); // Auto apply migration
    if (!db.Products.Any())
    {
        db.Products.AddRange(
            new Product { Name = "Laptop Pro", Price = 1200, Description = "High-end laptop", Stock = 10, Category = "Electronics" },
            new Product { Name = "Smartphone Max", Price = 800, Description = "Latest smartphone", Stock = 25, Category = "Electronics" },
            new Product { Name = "Wireless Earbuds", Price = 150, Description = "Noise-canceling earbuds", Stock = 50, Category = "Accessories" },
            new Product { Name = "Gaming Mouse", Price = 75, Description = "High precision gaming mouse", Stock = 100, Category = "Accessories" }
        );
        db.SaveChanges();
    }
}

app.MapGet("/", () => "Communication with gRPC endpoints must be made through a gRPC client. To learn how to create a client, visit: https://go.microsoft.com/fwlink/?linkid=2086909");

app.Run();
