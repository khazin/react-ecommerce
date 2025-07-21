using GrpcOrderService.Models;
using Microsoft.EntityFrameworkCore;

namespace GrpcOrderService.Data
{
    public class OrderDbContext : DbContext
    {
        public OrderDbContext(DbContextOptions<OrderDbContext> options) : base(options) { }

        public DbSet<Order> Orders => Set<Order>();
    }
}
