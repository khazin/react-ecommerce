# ReactEcommerce  
# React + .NET E-Commerce System  

> **🚧 Project Status: Ongoing Development**  
> This project is still in active development. Some APIs and features are not yet fully implemented. Expect improvements and new endpoints to be added progressively.  

This project demonstrates a **simple e-commerce platform** built with **Next.js (React) for the frontend** and **ASP.NET Core Web API + gRPC microservices** for the backend.  

It now supports:  
✅ Product catalog browsing  
✅ Viewing product details  
✅ Adding products to a cart (in-memory mini cart)  
✅ Placing **multi-product orders** (cart checkout)  
✅ **Two-step order flow** → Create order (`Pending`) then complete via payment (`Completed`)  
✅ **Buy Now flow** (single-product checkout with payment)  
✅ Viewing order history  
✅ **WCF Payment Gateway (VB.NET)** for SOAP-based payment handling  
✅ **Stripe API inside WCF** for actual test payment simulation  

---

## 💡 Business Use Case / Scenario  

This project simulates a **basic online shop workflow**, integrating a modern frontend with a secure backend API.  

### 🔹 Example Scenario:  
- A **customer** browses products via the catalog page and searches/filter products.  
- The customer **views details of a product**, sees stock information, and can either:  
  - **Add to Cart** (for later checkout)  
  - Or **Buy Now** to immediately place an order  
- The **customer checks their cart** and proceeds to checkout.  
- **Checkout creates a single order (with multiple products) in Pending status**  
- **Customer pays for the order** on a dedicated Payment Page, triggering this flow:  
  **Frontend → Web API → WCF VB.NET SOAP Service → Stripe API**  
- WCF VB.NET calls Stripe in test mode, returns success/failure back to Web API  
- Payment validation updates the order to `Completed`.  
- **Orders are stored** and can be viewed later in the “My Orders” page.  

---

### 🔹 Additional Possibilities:  
- Implement **authentication (JWT / OAuth)** for user-specific carts and orders.  
- Extend the WCF VB.NET service to integrate with real banking systems.  
- Add **admin features** (product management, order fulfillment).  
- Extend to a **multi-tenant / multi-category store**.  

---

## 📁 Project Components  

| Component         | Description |
|-------------------|-------------|
| **Frontend** (Next.js + Tailwind) | Provides the customer-facing web UI (catalog, cart, checkout, orders, payment). |
| **Backend** (ASP.NET Core Web API + gRPC microservices + WCF VB.NET)** | Exposes REST API endpoints that internally call gRPC ProductService, OrderService, and VB.NET WCF PaymentGateway. |

---

## 🚀 Frontend Features  

✅ **Product Catalog Page**  
- Displays products in a responsive grid  
- Search/filter support  
- Sorting options (e.g. by price or date)  

✅ **Product Detail Page**  
- Shows product info (price, stock, category)  
- Add to Cart or **Buy Now**  
- Toast notifications for user feedback  
- **Buy Now flow** → creates a pending order for a single product, then redirects to the Payment Page  

✅ **Cart Page**  
- Shows cart items, total price  
- Remove items  
- Checkout creates **one combined order with multiple products (Pending)**  
- After checkout → redirects to **Payment Page** for payment details  

✅ **Payment Page**  
- Accepts `orderId` + `amount` (from cart or Buy Now)  
- User enters **Card Number, Name, Expiry, CVV**  
- Calls backend `POST /api/payment/process`  
- If success → marks order as `Completed`  
- If fail → shows error & allows retry  

✅ **Orders Page**  
- Paginated list of orders  
- Sorting options  
- Order detail view (shows product names instead of just IDs)  

✅ **Consistent UI**  
- Global Header with navigation + cart badge  
- Tailwind CSS styling  

---

## 🛠️ Frontend Tech Stack  

- **Next.js 14+ (App Router)** – modern React framework  
- **TypeScript** – type safety  
- **Tailwind CSS** – utility-first styling  
- **Zustand** – simple global store for cart state  
- **React Hot Toast** – toast notifications for actions  
- **Fetch API** – calling backend REST endpoints  

---

## ⚙️ Backend  

The backend is built with **ASP.NET Core Web API** acting as a **facade** to multiple gRPC microservices and a **VB.NET WCF SOAP service** for payment.  

It follows a **multi-layer payment chain**:  

- **Web API Layer (REST)**  
  - Exposes clean, frontend-friendly REST endpoints for React.  
  - Delegates business logic to backend gRPC services & WCF payment gateway.    
  - Web API delegates to **WCF VB.NET SOAP PaymentGateway**  
- **gRPC Microservices**  
  - **ProductService** → manages products (catalog, stock, product details)  
  - **OrderService** → manages orders (placing, updating status, listing history)  
- **WCF VB.NET PaymentGateway (SOAP)**  
  - Acts as a **payment orchestrator**  
  - Exposes a SOAP `ProcessPayment` operation with a WSDL  
  - Internally calls **Stripe API** for test payments  

- **Stripe Payment API Integration**  
  - Real test payments processed via Stripe’s sandbox  
  - Supports test cards (`4242 4242 4242 4242` for success, etc.)
- **Database (SQL Server)**  
  - Stores product data and orders.  

---

### 🔹 Key REST Endpoints  

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/products/catalog` | `GET` | Returns paginated product list (supports filtering & sorting) |
| `/api/products/{id}` | `GET` | Returns a single product’s details (name, price, stock, category) |
| `/api/orders/list` | `GET` | Returns paginated order history (filter by status/date) |
| `/api/orders/{orderId}` | `GET` | Returns a single order **with product names** |
| `/api/orders/create-combined` | `POST` | Creates a single **multi-product order** with `Pending` status |
| `/api/payment/process` | `POST` | Processes payment; Web API calls **WCF SOAP VB.NET**, which calls **Stripe API**, then returns success/fail |

---

### 🔹 gRPC Services  

✅ **ProductService**  
- `ListProducts` → paginated product catalog with filtering/sorting  
- `GetProduct` → fetch single product details  
- `CheckStock` → validates if requested stock is available  
- `ReduceStock` → decreases stock after successful payment  

✅ **OrderService**  
- `ListOrders` → paginated list of orders (filter by status, date, price)  
- `GetOrder` → fetch single order details (with product IDs & quantities)  
- `PlaceOrder` → creates a **multi-product order** (initially `Pending`)  
- `UpdateOrderStatus` → changes order status (`Pending` → `Completed` or `Failed`)  

---

### 🔹 Payment Gateway  

This project uses a **hybrid payment integration**:  

✅ **WCF VB.NET SOAP Payment Gateway**  
- Legacy SOAP-style service with WSDL metadata  
- Wraps Stripe API logic inside VB.NET  
- Returns structured SOAP responses (success/failure, error codes)  

✅ **Stripe API (inside WCF)**  
- Used **inside the VB.NET WCF service**  
- Simulates real payments via Stripe test keys  
- Returns Stripe’s test result (approved/declined)  

---

### 🔹 Business Logic Flow  

#### 1️⃣ Cart Checkout  

1. **Frontend (React)** posts all cart items → `POST /api/orders/create-combined`  
2. **Web API** forwards the request to **OrderService.PlaceOrder**  
3. **OrderService** creates a single `Pending` order in DB  
4. API returns `{ orderId, totalAmount }`  
5. **Frontend redirects** to `/payment?orderId=xxx&amount=yyy`  

#### 2️⃣ Buy Now  

1. **Frontend** posts **only one product** → `POST /api/orders/create-combined`  
2. Same as checkout → returns `Pending` order + total price  
3. Redirects user to **Payment Page**  

#### 3️⃣ Payment Processing  

1. **Frontend** calls `POST /api/payment/process` with:  
   - `orderId`  
   - card details (number, name, expiry, CVV)  
   - amount  
2. **ASP.NET Web API** → calls `PaymentGateway.ProcessPayment()` on the **WCF VB.NET SOAP Service**  
  
3. **WCF VB.NET SOAP Service** → calls Stripe API (test mode) 
   - Calls **ProductService.ReduceStock** for each product in the order  
4. Stripe returns **success/failure** → WCF returns SOAP response to Web API  
5. **Web API** updates OrderService (Completed/Failed) & adjusts stock if successful  
6. Response goes back to the frontend  
So even though Stripe is the actual processor, the **WCF VB.NET service acts as the middleman**.
✅ **End result:** Order is now `Completed` & stock reduced  

---

### 🔹 Backend Tech Stack  

- **ASP.NET Core 8 Web API** → REST layer  
- **ASP.NET Core gRPC** → internal service-to-service communication  
- **VB.NET WCF SOAP Service** → legacy-style payment simulation (exposes WSDL)  
- **Stripe Payment API** → modern payment integration  
- **Entity Framework Core** → ORM for SQL Server  
- **SQL Server** → database for products and orders  

---

### 🔹 Backend Highlights  

✅ **Supports multi-product orders** (cart checkout → single order ID)  
✅ **Two-step order flow** → `Pending` → `Completed` after payment  
✅ **Stock validation & reduction** after successful payment  
✅ WCF VB.NET acts as a **payment broker**  
✅ Stripe is **encapsulated inside WCF**, frontend never calls Stripe directly
✅ Web API only talks to **SOAP endpoint**, keeping payment details hidden  
✅ **Pagination & sorting** for both products & orders  
✅ **Separation of concerns** (Web API as a thin REST gateway)  
✅ **Extensible** – can easily add authentication, real payment, or more services later  

---

## 🏗️ How It Works  

1. **Frontend** makes REST calls to the **ASP.NET Web API**  
2. **Web API** calls gRPC **ProductService** & **OrderService** to fetch/manage data  
3. For payments:  
   - Calls **WCF VB.NET SOAP PaymentGateway** for simulated success/failure  
   - Or calls **Stripe API** for test payment intents  
4. **Product Catalog** is fetched from `/api/products/catalog`  
5. User **checks out cart** → API creates **one order with multiple products (Pending)**  
6. User **pays** → payment service validates → updates order to **Completed** & reduces stock  
7. **Orders page** fetches `/api/orders/list` with pagination/sorting  
8. Cart state is **client-side only** (no login required)  

---

## 🗄️ Database Setup  

This project uses **SQL Server + Entity Framework Core** for database access.  

### 🔹 Running EF Core Migrations  

1. Open a terminal in the backend project (where `DbContext` is located).  
2. Create the database (if not exists):  

    ```bash
    dotnet ef database update
    ```  

3. To add a new migration (if you modify models):  

    ```bash
    dotnet ef migrations add <MigrationName>
    dotnet ef database update
    ```  

4. Optional: Seed initial products/orders in `OnModelCreating` or via a seeder service.  

By default, EF Core will create tables:  
- `Products` → stores product catalog data  
- `Orders` → stores customer orders  
- `OrderItems` → stores multiple product lines for each order  

---

## 📁 Project Structure  

```text
ReactEcommerce/
├── app/
│   ├── products/         # Product catalog & detail pages
│   ├── cart/             # Cart page
│   ├── orders/           # Orders listing + detail page
│   ├── payment/          # Payment page (processes order payment)
│   ├── layout.tsx        # Root layout with header/nav
│   └── globals.css
│
├── components/
│   ├── ProductCard.tsx   # Reusable product display
│   ├── CartIndicator.tsx # Shows mini cart badge
│
├── lib/
│   ├── api/              # API fetchers for products/orders/payment
│   └── store/            # Zustand store for cart
│
├── backend/
│   ├── WebApi/           # ASP.NET Core Web API (REST gateway)
│   ├── ProductService/   # gRPC service for products
│   ├── OrderService/     # gRPC service for orders
│   └── PaymentGateway/   # WCF VB.NET SOAP payment simulation
│   
│
└── database/             # SQL Server DB

Note: Since this project is still evolving, some APIs and workflows may change as new features (auth, payments, admin panel) are added.
