namespace MyWebApi.DTO
{
    public class PaymentRequestDto
    {
        public string OrderId { get; set; }
        public string CardNumber { get; set; }
        public string CardHolderName { get; set; }
        public string ExpiryDate { get; set; }
        public string CVV { get; set; }
        public decimal Amount { get; set; }
    }
}
