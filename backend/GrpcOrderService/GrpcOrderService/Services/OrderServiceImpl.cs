using Grpc.Core;
using GrpcOrderService.Data;
using GrpcOrderService.Models;
using Microsoft.EntityFrameworkCore;
using OrderGrpc;

namespace GrpcOrderService.Services;
public class OrderServiceImpl : OrderService.OrderServiceBase
{
    private readonly OrderDbContext _dbContext;

    public OrderServiceImpl(OrderDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public override async Task<GetOrderResponse> GetOrder(GetOrderRequest request, ServerCallContext context)
    {
        var order = await _dbContext.Orders.FindAsync(request.Id);
        if (order == null)
            throw new RpcException(new Status(StatusCode.NotFound, $"Order {request.Id} not found"));

        return new GetOrderResponse
        {
            Id = order.Id,
            ProductId = order.ProductId,
            Quantity = order.Quantity,
            TotalPrice = (double)order.TotalPrice,
            Status = order.Status,
            OrderDate = order.OrderDate.ToString("o")
        };
    }

    public override async Task<PlaceOrderResponse> PlaceOrder(PlaceOrderRequest request, ServerCallContext context)
    {
        var newOrder = new Order
        {
            ProductId = request.ProductId,
            Quantity = request.Quantity,
            TotalPrice = (decimal)request.TotalPrice,
            OrderDate = DateTime.UtcNow,
            Status = "Pending"
        };

        _dbContext.Orders.Add(newOrder);
        await _dbContext.SaveChangesAsync();

        return new PlaceOrderResponse
        {
            OrderId = newOrder.Id,
            Status = newOrder.Status
        };
    }

    public override async Task<UpdateOrderStatusResponse> UpdateOrderStatus(UpdateOrderStatusRequest request, ServerCallContext context)
    {
        var order = await _dbContext.Orders.FindAsync(request.OrderId);
        if (order == null)
            throw new RpcException(new Status(StatusCode.NotFound, "Order not found"));

        order.Status = request.Status;
        await _dbContext.SaveChangesAsync();

        return new UpdateOrderStatusResponse { Success = true };
    }
    public override async Task<ListOrdersResponse> ListOrders(ListOrdersRequest request, ServerCallContext context)
    {
        var query = _dbContext.Orders.AsQueryable();

        // Filter by status if provided
        if (!string.IsNullOrEmpty(request.Status))
        {
            query = query.Where(o => o.Status == request.Status);
        }

        // Filter by date range if provided
        if (request.FromTimestamp > 0)
        {
            var fromDate = DateTimeOffset.FromUnixTimeMilliseconds(request.FromTimestamp).UtcDateTime;
            query = query.Where(o => o.OrderDate >= fromDate);
        }
        if (request.ToTimestamp > 0)
        {
            var toDate = DateTimeOffset.FromUnixTimeMilliseconds(request.ToTimestamp).UtcDateTime;
            query = query.Where(o => o.OrderDate <= toDate);
        }

        // Sorting
        switch (request.SortBy?.ToLower())
        {
            case "date_asc":
                query = query.OrderBy(o => o.OrderDate);
                break;
            case "date_desc":
                query = query.OrderByDescending(o => o.OrderDate);
                break;
            case "price_asc":
                query = query.OrderBy(o => o.TotalPrice);
                break;
            case "price_desc":
                query = query.OrderByDescending(o => o.TotalPrice);
                break;
            default:
                query = query.OrderByDescending(o => o.OrderDate);
                break;
        }

        // Pagination
        int pageSize = request.PageSize > 0 ? request.PageSize : 10;
        int page = request.Page > 0 ? request.Page : 1;
        int skip = (page - 1) * pageSize;

        int totalOrders = await query.CountAsync();

        var orders = await query.Skip(skip).Take(pageSize).ToListAsync();

        var response = new ListOrdersResponse
        {
            TotalOrders = totalOrders
        };

        response.Orders.AddRange(orders.Select(o => new OrderSummary
        {
            Id = o.Id,
            ProductId = o.ProductId,
            Quantity = o.Quantity,
            TotalPrice = (double)o.TotalPrice,
            Status = o.Status,
            OrderDate = o.OrderDate.ToString("o")
        }));

        return response;
    }

}
