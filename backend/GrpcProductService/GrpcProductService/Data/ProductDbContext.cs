using GrpcProductService.Models;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using GrpcProductService.Models;
using Microsoft.EntityFrameworkCore;

namespace GrpcProductService.Data
{
    public class ProductDbContext : DbContext
    {
        public ProductDbContext(DbContextOptions<ProductDbContext> options) : base(options) { }

        public DbSet<Product> Products => Set<Product>();
    }

}
