using Grpc.Core;
using GrpcProductService.Data;
using Microsoft.EntityFrameworkCore;
using ProductGrpc;

namespace GrpcProductService.Services;

public class ProductServiceImpl : ProductService.ProductServiceBase
{
    private readonly ProductDbContext _dbContext;

    public ProductServiceImpl(ProductDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public override async Task<GetProductResponse> GetProduct(GetProductRequest request, ServerCallContext context)
    {
        var product = await _dbContext.Products.FindAsync(request.Id);
        if (product == null)
            throw new RpcException(new Status(StatusCode.NotFound, $"Product {request.Id} not found"));

        return new GetProductResponse
        {
            Id = product.Id,
            Name = product.Name,
            Price = (double)product.Price,
            Description = product.Description,
            Stock = product.Stock,
            Category = product.Category
        };
    }

    public override async Task<CheckStockResponse> CheckStock(CheckStockRequest request, ServerCallContext context)
    {
        var product = await _dbContext.Products.FindAsync(request.ProductId);
        if (product == null)
            throw new RpcException(new Status(StatusCode.NotFound, "Product not found"));

        bool isAvailable = product.Stock >= request.Quantity;
        return new CheckStockResponse { IsAvailable = isAvailable };
    }

    public override async Task<ReduceStockResponse> ReduceStock(ReduceStockRequest request, ServerCallContext context)
    {
        var product = await _dbContext.Products.FindAsync(request.ProductId);
        if (product == null)
            throw new RpcException(new Status(StatusCode.NotFound, "Product not found"));

        if (product.Stock < request.Quantity)
            return new ReduceStockResponse { Success = false };

        product.Stock -= request.Quantity;
        await _dbContext.SaveChangesAsync();

        return new ReduceStockResponse { Success = true };
    }

    public override async Task<ListProductsResponse> ListProducts(ListProductsRequest request, ServerCallContext context)
    {
        var query = _dbContext.Products.AsQueryable();

        // Filter by Category (if provided)
        if (!string.IsNullOrEmpty(request.Category))
        {
            query = query.Where(p => p.Category == request.Category);
        }

        // Sorting (simple case: price ascending/descending)
        switch (request.SortBy?.ToLower())
        {
            case "price_asc":
                query = query.OrderBy(p => p.Price);
                break;
            case "price_desc":
                query = query.OrderByDescending(p => p.Price);
                break;
            default:
                query = query.OrderBy(p => p.Id); // Default sort
                break;
        }

        // Pagination
        int pageSize = request.PageSize > 0 ? request.PageSize : 10; // default page size
        int page = request.Page > 0 ? request.Page : 1;
        int skip = (page - 1) * pageSize;

        int totalProducts = await query.CountAsync();

        var products = await query
            .Skip(skip)
            .Take(pageSize)
            .ToListAsync();

        // Build gRPC response
        var response = new ListProductsResponse
        {
            TotalProducts = totalProducts
        };

        response.Products.AddRange(products.Select(p => new ProductSummary
        {
            Id = p.Id,
            Name = p.Name,
            Price = (double)p.Price,
            Stock = p.Stock,
            Category = p.Category
        }));

        return response;
    }

}

