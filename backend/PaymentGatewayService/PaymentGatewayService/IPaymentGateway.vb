Imports System.Runtime.Serialization
Imports System.ServiceModel

<ServiceContract()>
Public Interface IPaymentGateway

    <OperationContract()>
    Function ProcessPayment(request As PaymentRequest) As PaymentResponse

End Interface

<DataContract()>
Public Class PaymentRequest
    <DataMember()>
    Public Property OrderId As String

    <DataMember()>
    Public Property CardNumber As String

    <DataMember()>
    Public Property CardHolderName As String

    <DataMember()>
    Public Property ExpiryDate As String

    <DataMember()>
    Public Property CVV As String

    <DataMember()>
    Public Property Amount As Decimal
End Class

<DataContract()>
Public Class PaymentResponse
    <DataMember()>
    Public Property TransactionId As String

    <DataMember()>
    Public Property Success As Boolean

    <DataMember()>
    Public Property Message As String
End Class
