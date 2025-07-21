Imports System.Net.Http
Imports System.Net.Http.Headers
Imports System.Threading.Tasks

Public Class PaymentGatewayService
    Implements IPaymentGateway

    Private ReadOnly stripeSecretKey As String = ConfigurationManager.AppSettings("StripeSecretKey")

    Public Function ProcessPayment(request As PaymentRequest) As PaymentResponse Implements IPaymentGateway.ProcessPayment
        ' Basic validation
        If String.IsNullOrEmpty(request.CardNumber) OrElse request.Amount <= 0 Then
            Return New PaymentResponse With {
                .Success = False,
                .Message = "Invalid payment details."
            }
        End If

        ' Call Stripe synchronously for simplicity
        Dim result = ProcessStripePayment(request).Result
        Return result
    End Function

    Private Async Function ProcessStripePayment(request As PaymentRequest) As Task(Of PaymentResponse)
        Dim client As New HttpClient()
        client.DefaultRequestHeaders.Authorization =
        New AuthenticationHeaderValue("Bearer", stripeSecretKey)

        Dim amountInCents As Integer = CInt(request.Amount * 100)
        '4242424242424242 successful payment
        ' List of test card numbers that should trigger a fail
        Dim failCards As New List(Of String) From {
        "4000000000000002",   ' Card declined
        "4000000000009995",   ' Insufficient funds
        "4000000000000069"    ' Expired card
    }

        Dim sourceToken As String

        ' Check if the card number is in fail list (exact match)
        If failCards.Contains(request.CardNumber) Then
            sourceToken = "tok_chargeDeclined"
        Else
            sourceToken = "tok_visa"
        End If

        Dim content = New FormUrlEncodedContent(New Dictionary(Of String, String) From {
        {"amount", amountInCents.ToString()},
        {"currency", "usd"},
        {"source", sourceToken},
        {"description", "Order " & request.OrderId}
    })

        Dim response = Await client.PostAsync("https://api.stripe.com/v1/charges", content)
        Dim responseJson = Await response.Content.ReadAsStringAsync()

        If response.IsSuccessStatusCode Then
            Return New PaymentResponse With {
            .Success = True,
            .TransactionId = Guid.NewGuid().ToString(),
            .Message = "Stripe Payment Successful!"
        }
        Else
            Return New PaymentResponse With {
            .Success = False,
            .TransactionId = Nothing,
            .Message = "Stripe Payment Failed: " & responseJson
        }
        End If
    End Function

End Class
