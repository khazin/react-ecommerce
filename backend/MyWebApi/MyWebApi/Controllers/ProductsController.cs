using Grpc.Core;
using Microsoft.AspNetCore.Mvc;
using ProductGrpc;

namespace MyWebApi.Controllers;
[ApiController]
[Route("api/product")]
public class ProductController : ControllerBase
{
    private readonly ProductService.ProductServiceClient _productClient;

    public ProductController(ProductService.ProductServiceClient productClient)
    {
        _productClient = productClient;
    }

    [HttpGet("check-stock/{productId}/{quantity}")]
    public async Task<IActionResult> CheckStock(int productId, int quantity)
    {
        var response = await _productClient.CheckStockAsync(new CheckStockRequest
        {
            ProductId = productId,
            Quantity = quantity
        });

        return Ok(new { Available = response.IsAvailable });
    }

    [HttpPost("reduce-stock")]
    public async Task<IActionResult> ReduceStock([FromBody] ReduceStockRequest request)
    {
        var response = await _productClient.ReduceStockAsync(request);
        return Ok(new { Success = response.Success });
    }

    [HttpGet("catalog")]
    public async Task<IActionResult> GetProductCatalog(
    [FromQuery] string? category,
    [FromQuery] string? sortBy,
    [FromQuery] int page = 1,
    [FromQuery] int pageSize = 10)
    {
        var grpcResponse = await _productClient.ListProductsAsync(new ListProductsRequest
        {
            Category = category ?? "",
            SortBy = sortBy ?? "",
            Page = page,
            PageSize = pageSize
        });

        var result = new
        {
            Products = grpcResponse.Products.Select(p => new
            {
                p.Id,
                p.Name,
                p.Price,
                p.Stock,
                p.Category
            }),
            TotalProducts = grpcResponse.TotalProducts,
            CurrentPage = page,
            PageSize = pageSize
        };

        return Ok(result);
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetProductById(int id)
    {
        try
        {
            var grpcResponse = await _productClient.GetProductAsync(new GetProductRequest { Id = id });

            // Shape matches your React Product interface
            var result = new
            {
                Id = grpcResponse.Id,
                Name = grpcResponse.Name,
                Price = grpcResponse.Price,
                Stock = grpcResponse.Stock,
                Category = grpcResponse.Category
            };

            return Ok(result);
        }
        catch (RpcException ex) when (ex.StatusCode == Grpc.Core.StatusCode.NotFound)
        {
            return NotFound(new { message = $"Product #{id} not found" });
        }
    }
}
