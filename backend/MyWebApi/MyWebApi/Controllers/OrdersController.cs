using Grpc.Core;
using Microsoft.AspNetCore.Mvc;
using OrderGrpc;
using ProductGrpc;

namespace MyWebApi.Controllers;
[ApiController]
[Route("api/orders")]
public class OrdersController : ControllerBase
{
    private readonly ProductService.ProductServiceClient _productClient;
    private readonly OrderService.OrderServiceClient _orderClient;

    public OrdersController(
        ProductService.ProductServiceClient productClient,
        OrderService.OrderServiceClient orderClient)
    {
        _productClient = productClient;
        _orderClient = orderClient;
    }

    [HttpPost("place-advanced")]
    public async Task<IActionResult> PlaceOrderAdvanced([FromBody] PlaceOrderRequestDto request)
    {
        // Step 1: Check Stock
        var stockResponse = await _productClient.CheckStockAsync(new CheckStockRequest
        {
            ProductId = request.ProductId,
            Quantity = request.Quantity
        });

        if (!stockResponse.IsAvailable)
            return BadRequest("Product out of stock or insufficient quantity.");

        // Step 2: Get Product Details
        var product = await _productClient.GetProductAsync(new GetProductRequest { Id = request.ProductId });

        double totalPrice = product.Price * request.Quantity;

        // Step 3: Simulate Payment Authorization
        bool paymentSuccess = SimulatePayment(totalPrice);
        if (!paymentSuccess)
            return StatusCode(402, "Payment failed.");

        // Step 4: Place Order (Status = Pending)
        var orderResponse = await _orderClient.PlaceOrderAsync(new PlaceOrderRequest
        {
            ProductId = request.ProductId,
            Quantity = request.Quantity,
            TotalPrice = totalPrice
        });

        int orderId = orderResponse.OrderId;

        // Step 5: Update Order Status to 'Processing'
        await _orderClient.UpdateOrderStatusAsync(new UpdateOrderStatusRequest
        {
            OrderId = orderId,
            Status = "Processing"
        });

        // Step 6: Reduce Stock
        var reduceStockResponse = await _productClient.ReduceStockAsync(new ReduceStockRequest
        {
            ProductId = request.ProductId,
            Quantity = request.Quantity
        });

        if (!reduceStockResponse.Success)
        {
            // If reducing stock failed, mark order as Failed
            await _orderClient.UpdateOrderStatusAsync(new UpdateOrderStatusRequest
            {
                OrderId = orderId,
                Status = "Failed - Stock Reduction"
            });

            return StatusCode(500, "Failed to reduce product stock.");
        }

        // Step 7: Update Order Status to 'Completed'
        await _orderClient.UpdateOrderStatusAsync(new UpdateOrderStatusRequest
        {
            OrderId = orderId,
            Status = "Completed"
        });

        // Step 8: Return Final Order Confirmation
        return Ok(new
        {
            OrderId = orderId,
            Product = product.Name,
            Quantity = request.Quantity,
            TotalPrice = totalPrice,
            Status = "Completed"
        });
    }
    
    [HttpGet("list")]
    public async Task<IActionResult> ListOrders(
       [FromQuery] string? status,
       [FromQuery] long fromTimestamp = 0,
       [FromQuery] long toTimestamp = 0,
       [FromQuery] string? sortBy = "date_desc",
       [FromQuery] int page = 1,
       [FromQuery] int pageSize = 10)
    {
        var grpcResponse = await _orderClient.ListOrdersAsync(new ListOrdersRequest
        {
            Status = status ?? "",
            FromTimestamp = fromTimestamp,
            ToTimestamp = toTimestamp,
            SortBy = sortBy ?? "date_desc",
            Page = page,
            PageSize = pageSize
        });

        var result = new
        {
            Orders = grpcResponse.Orders.Select(o => new
            {
                o.Id,
                o.ProductId,
                o.Quantity,
                o.TotalPrice,
                o.Status,
                o.OrderDate
            }),
            grpcResponse.TotalOrders,
            CurrentPage = page,
            PageSize = pageSize
        };

        return Ok(result);
    }
    // Dummy Payment Simulation (Always Succeeds)

    [HttpGet("{orderId:int}")]
    public async Task<IActionResult> GetOrderById(int orderId)
    {
        try
        {
            // ✅ Step 1: Get Order details
            var grpcOrder = await _orderClient.GetOrderAsync(new GetOrderRequest { Id = orderId });

            // ✅ Step 2: Fetch Product details from ProductService
            var grpcProduct = await _productClient.GetProductAsync(new GetProductRequest { Id = grpcOrder.ProductId });

            // ✅ Step 3: Combine response
            var result = new
            {
                Id = grpcOrder.Id,
                ProductId = grpcOrder.ProductId,
                ProductName = grpcProduct.Name,  
                Quantity = grpcOrder.Quantity,
                TotalPrice = grpcOrder.TotalPrice,
                Status = grpcOrder.Status,
                OrderDate = grpcOrder.OrderDate
            };

            return Ok(result);
        }
        catch (RpcException ex) when (ex.StatusCode == Grpc.Core.StatusCode.NotFound)
        {
            return NotFound(new { message = $"Order #{orderId} not found" });
        }
    }
    [HttpPost("create-combined")]
    public async Task<IActionResult> CreateCombinedOrder([FromBody] List<CartItemDto> items)
    {
        if (items == null || !items.Any())
            return BadRequest("No items to create order.");

        var createdOrders = new List<object>();

        foreach (var item in items)
        {
            var response = await _orderClient.PlaceOrderAsync(new PlaceOrderRequest
            {
                ProductId = item.ProductId,
                Quantity = item.Quantity,
                TotalPrice = item.Price * item.Quantity
            });

            createdOrders.Add(new
            {
                response.OrderId,
                ProductId = item.ProductId,
                TotalAmount = item.Price * item.Quantity,
                Status = response.Status
            });
        }

        return Ok(createdOrders);
    }


    private bool SimulatePayment(double amount)
    {
        // You can add randomization here if you want.
        return true;
    }
}
public class CartItemDto
{
    public int ProductId { get; set; }
    public int Quantity { get; set; }
    public double Price { get; set; }
}
public class PlaceOrderRequestDto
{
    public int ProductId { get; set; }
    public int Quantity { get; set; }
}
