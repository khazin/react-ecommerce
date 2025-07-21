using Microsoft.AspNetCore.Mvc;
using MyWebApi.DTO;
using System.ServiceModel;
using PaymentGatewayServiceReference;
using OrderGrpc;   // gRPC OrderService client
using ProductGrpc; // gRPC ProductService client

namespace MyWebApi.Controllers
{
    [ApiController]
    [Route("api/payment")]
    public class PaymentsController : ControllerBase
    {
        private readonly PaymentGatewayClient _wcfClient;
        private readonly OrderService.OrderServiceClient _orderClient;
        private readonly ProductService.ProductServiceClient _productClient;

        public PaymentsController(
            OrderService.OrderServiceClient orderClient,
            ProductService.ProductServiceClient productClient)
        {
            // WCF payment gateway
            var binding = new BasicHttpBinding();
            var endpoint = new EndpointAddress("http://localhost:51337/PaymentGatewayService.svc");
            _wcfClient = new PaymentGatewayClient(binding, endpoint);

            _orderClient = orderClient;
            _productClient = productClient;
        }

        [HttpPost("process")]
        public async Task<IActionResult> ProcessPayment([FromBody] PaymentRequestDto requestDto)
        {
            var paymentRequest = new PaymentRequest
            {
                OrderId = requestDto.OrderId,
                CardNumber = requestDto.CardNumber,
                CardHolderName = requestDto.CardHolderName,
                ExpiryDate = requestDto.ExpiryDate,
                CVV = requestDto.CVV,
                Amount = requestDto.Amount
            };

            try
            {
                var response = await _wcfClient.ProcessPaymentAsync(paymentRequest);

                if (!response.Success)
                {
                    // ❌ Payment failed → leave as Pending
                    return BadRequest(new
                    {
                        response.Message,
                        UpdatedStatus = "Pending"
                    });
                }

                // ✅ STEP 1: Update order status → Completed
                await _orderClient.UpdateOrderStatusAsync(new UpdateOrderStatusRequest
                {
                    OrderId = int.Parse(requestDto.OrderId),
                    Status = "Completed"
                });

                // ✅ STEP 2: Fetch order details → get product + quantity
                var orderDetails = await _orderClient.GetOrderAsync(new GetOrderRequest
                {
                    Id = int.Parse(requestDto.OrderId)
                });

                // ✅ STEP 3: Reduce product stock
                await _productClient.ReduceStockAsync(new ReduceStockRequest
                {
                    ProductId = orderDetails.ProductId,
                    Quantity = orderDetails.Quantity
                });

                return Ok(new
                {
                    response.Message,
                    response.TransactionId,
                    UpdatedStatus = "Completed",
                    StockUpdated = true
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error calling payment service: {ex.Message}");
            }
        }
    }
}
