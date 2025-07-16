# ReactEcommerce  
# React + .NET E-Commerce System  

> **🚧 Project Status: Ongoing Development**  
> This project is still in active development. Some APIs and features are not yet fully implemented. Expect improvements and new endpoints to be added progressively.  

This project demonstrates a **simple e-commerce platform** built with **Next.js (React) for the frontend** and **ASP.NET Core Web API + gRPC microservices** for the backend.  

It supports:  
✅ Product catalog browsing  
✅ Viewing product details  
✅ Adding products to a cart (in-memory mini cart)  
✅ Placing orders (single product or multiple via cart)  
✅ Viewing order history  

---

## 💡 Business Use Case / Scenario  

This project simulates a **basic online shop workflow**, integrating a modern frontend with a secure backend API.  

### 🔹 Example Scenario:  
- A **customer** browses products via the catalog page and searches/filter products.  
- The customer **views details of a product**, sees stock information, and can either:  
  - **Add to Cart** (for later checkout)  
  - Or **Buy Now** to immediately place an order  
- The **customer checks their cart** and proceeds to checkout.  
- **Orders are stored** and can be viewed later in the “My Orders” page.  

---

### 🔹 Additional Possibilities:  
- Implement **authentication (JWT / OAuth)** for user-specific carts and orders.  
- Integrate with a **payment gateway** for real transactions.  
- Add **admin features** (product management, order fulfillment).  
- Extend to a **multi-tenant / multi-category store**.  

---

## 📁 Project Components  

| Component         | Description |
|-------------------|-------------|
| **Frontend** (Next.js + Tailwind) | Provides the customer-facing web UI (catalog, cart, checkout, orders). |
| **Backend** (ASP.NET Core Web API + gRPC microservices)** | Exposes REST API endpoints that internally call gRPC ProductService and OrderService. |

---

## 🚀 Frontend Features  

✅ **Product Catalog Page**  
- Displays products in a responsive grid  
- Search/filter support  
- Sorting options (e.g. by price or date)  

✅ **Product Detail Page**  
- Shows product info (price, stock, category)  
- Add to Cart or Buy Now  
- Toast notifications for user feedback  

✅ **Cart Page**  
- Shows cart items, total price  
- Remove items  
- Checkout places multiple orders  

✅ **Orders Page**  
- Paginated list of orders  
- Sorting options  
- Order detail view (with product name)  

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

The backend is built with **ASP.NET Core Web API** acting as a **facade** to multiple gRPC microservices.  

It follows a **microservice-inspired architecture**:  

- **Web API Layer (REST)**  
  - Exposes clean, frontend-friendly REST endpoints for React.  
  - Delegates business logic to backend gRPC services.  
- **gRPC Microservices**  
  - **ProductService** → manages products (catalog, stock, product details)  
  - **OrderService** → manages orders (placing, updating status, listing history)  
- **Database (SQL Server)**  
  - Stores product data and orders.  

### 🔹 Key REST Endpoints  

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/products/catalog` | `GET` | Returns paginated product list (supports filtering & sorting) |
| `/api/products/{id}` | `GET` | Returns a single product’s details (name, price, stock, category) |
| `/api/orders/list` | `GET` | Returns paginated order history (filter by status/date) |
| `/api/orders/{orderId}` | `GET` | Returns a single order **with product name** |
| `/api/orders/purchase` | `POST` | Places an order (validates stock, simulates payment, updates stock & order status) |

---

### 🔹 gRPC Services  

✅ **ProductService**  
- `ListProducts` → paginated product catalog with filtering/sorting  
- `GetProduct` → fetch single product details  
- `CheckStock` → validates if requested stock is available  
- `ReduceStock` → decreases stock after successful purchase  

✅ **OrderService**  
- `ListOrders` → paginated list of orders (filter by status, date, price)  
- `GetOrder` → fetch single order details  
- `PlaceOrder` → creates a new order (initially `Pending`)  
- `UpdateOrderStatus` → changes order status (`Pending` → `Processing` → `Completed` or `Failed`)  

---

### 🔹 Business Logic Flow  

When placing an order:  

1. **Web API** receives a request from React (`POST /api/orders/purchase`).  
2. Calls **ProductService.CheckStock** to ensure sufficient inventory.  
3. Fetches product price from **ProductService.GetProduct**.  
4. Simulates payment (can be replaced with real payment gateway).  
5. Calls **OrderService.PlaceOrder** → creates order with status `Pending`.  
6. Calls **OrderService.UpdateOrderStatus** → moves it to `Processing`.  
7. Calls **ProductService.ReduceStock** → decreases available stock.  
8. If all successful, **OrderService.UpdateOrderStatus → Completed**.  
9. Returns order confirmation (orderId, product name, total price).  

---

### 🔹 Backend Tech Stack  

- **ASP.NET Core 8 Web API** → REST layer  
- **ASP.NET Core gRPC** → internal service-to-service communication  
- **Entity Framework Core** → ORM for SQL Server  
- **SQL Server** → database for products and orders  

---

### 🔹 Backend Highlights  

✅ **Stock validation** before order creation  
✅ **Pagination & sorting** for both products & orders  
✅ **Separation of concerns** (Web API as a thin REST gateway)  
✅ **Extensible** – can easily add payment, auth, or more services later  

---

## 🏗️ How It Works  

1. **Frontend** makes REST calls to the **ASP.NET Web API**  
2. **Web API** calls gRPC **ProductService** & **OrderService** to fetch/manage data  
3. **Product Catalog** is fetched from `/api/products/catalog`  
4. User can **place an order** → API checks stock, simulates payment, creates order, updates stock  
5. **Orders page** fetches `/api/orders/list` with pagination/sorting  
6. Cart state is **client-side only** (no login required)  

---

## 🗄️ Database Setup  

This project uses **SQL Server + Entity Framework Core** for database access.  

### 🔹 Running EF Core Migrations  

1. Open a terminal in the backend project (where `DbContext` is located).  
2. Create the database (if not exists):  
3. To add a new migration (if you modify models):

    dotnet ef migrations add <MigrationName>
    dotnet ef database update
4. Optional: Seed initial products/orders in OnModelCreating or via a seeder service.
    By default, EF Core will create tables:
        Products – stores product catalog data
        Orders – stores customer orders

## 🔹Project Structure
ReactEcommerce/
├── app/
│ ├── products/ # Product catalog & detail pages
│ ├── cart/ # Cart page
│ ├── orders/ # Orders listing + detail page
│ ├── layout.tsx # Root layout with header/nav
│ └── globals.css
├── components/
│ ├── ProductCard.tsx # Reusable product display
│ ├── CartIndicator.tsx # Shows mini cart badge
├── lib/
│ ├── api/ # API fetchers for products/orders
│ └── store/ # Zustand store for cart
├── public/
├── tailwind.config.ts
│
├─ backend/
│  ├─ WebApi/        # ASP.NET Core Web API (REST gateway)
│  ├─ ProductService # gRPC service for products
│  ├─ OrderService   # gRPC service for orders
│  └─ Shared/        # Shared protobuf files, EF models
└─ database/         # SQL Server DB

Note: Since this project is still evolving, some APIs and workflows may change as new features (auth, payments, admin panel) are added.

