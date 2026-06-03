# StayDine API Documentation

Complete API reference for the StayDine Restaurant POS system.

## Base URL
```
http://localhost:5000/api
```

## Authentication
All protected endpoints require a Bearer token in the Authorization header:
```
Authorization: Bearer <jwt_token>
```

---

## 🔐 Authentication Endpoints

### Register New User
**POST** `/auth/register`

Creates a new user account.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+919999999999",
  "password": "password123",
  "role": "restaurant_owner",
  "restaurantId": "507f1f77bcf86cd799439011"
}
```

**Response (201):**
```json
{
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+919999999999",
    "role": "restaurant_owner"
  }
}
```

---

### Login
**POST** `/auth/login`

Authenticates user and returns JWT token.

**Request Body:**
```json
{
  "phone": "+919999999999",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "phone": "+919999999999",
    "role": "restaurant_owner",
    "restaurantId": "507f1f77bcf86cd799439012"
  }
}
```

---

### Verify Token
**GET** `/auth/verify`

Verifies if JWT token is valid.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "valid": true,
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "role": "restaurant_owner",
    "restaurantId": "507f1f77bcf86cd799439012"
  }
}
```

---

## 🏢 Restaurant Endpoints

### Create Restaurant
**POST** `/restaurants`

**Request Body:**
```json
{
  "name": "Pizza Palace",
  "ownerId": "507f1f77bcf86cd799439011",
  "description": "Italian restaurant serving authentic pizzas",
  "cuisine": ["Italian", "Continental"],
  "address": {
    "street": "123 Main St",
    "city": "New York",
    "state": "NY",
    "zipcode": "10001",
    "country": "USA"
  },
  "location": {
    "latitude": 40.7128,
    "longitude": -74.0060,
    "radius": 100
  },
  "contactInfo": {
    "email": "info@pizzapalace.com",
    "phone": "+11234567890"
  },
  "tables": 15,
  "capacity": 50
}
```

**Response (201):**
```json
{
  "_id": "507f1f77bcf86cd799439012",
  "name": "Pizza Palace",
  "ownerId": "507f1f77bcf86cd799439011",
  ...
}
```

---

### Get All Restaurants
**GET** `/restaurants`

**Response (200):**
```json
[
  {
    "_id": "507f1f77bcf86cd799439012",
    "name": "Pizza Palace",
    "city": "New York",
    "location": { "latitude": 40.7128, "longitude": -74.0060 }
  }
]
```

---

### Get Restaurant by ID
**GET** `/restaurants/:id`

**Response (200):**
```json
{
  "_id": "507f1f77bcf86cd799439012",
  "name": "Pizza Palace",
  "ownerId": "507f1f77bcf86cd799439011",
  "address": { ... },
  "location": { ... },
  "tables": 15,
  "capacity": 50
}
```

---

## 🍽️ Menu Endpoints

### Create Menu Item
**POST** `/menu`

**Request Body:**
```json
{
  "restaurantId": "507f1f77bcf86cd799439012",
  "name": "Margherita Pizza",
  "description": "Fresh mozzarella and tomato sauce",
  "category": "food",
  "price": 499,
  "discountedPrice": 399,
  "image": "url_to_image",
  "isVegetarian": true,
  "prepTime": 15,
  "station": "main_kitchen",
  "rating": 4.5,
  "totalReviews": 120
}
```

---

### Get Menu Items
**GET** `/menu/restaurant/:restaurantId`

**Response (200):**
```json
[
  {
    "_id": "507f1f77bcf86cd799439013",
    "name": "Margherita Pizza",
    "category": "food",
    "price": 499,
    "discountedPrice": 399,
    "isVegetarian": true
  }
]
```

---

### Get Items by Category
**GET** `/menu/category/:category?restaurantId=:id`

**Query Parameters:**
- `restaurantId` (required) - Restaurant ID

**Response (200):**
```json
[
  {
    "_id": "507f1f77bcf86cd799439013",
    "name": "Margherita Pizza",
    "category": "food",
    "price": 499
  }
]
```

---

## 📦 Order Endpoints

### Create Order
**POST** `/orders`

**Request Body:**
```json
{
  "restaurantId": "507f1f77bcf86cd799439012",
  "customerId": "507f1f77bcf86cd799439011",
  "customerName": "John Doe",
  "customerPhone": "+919999999999",
  "tableNumber": 5,
  "orderType": "dine_in",
  "items": [
    {
      "menuItemId": "507f1f77bcf86cd799439013",
      "name": "Margherita Pizza",
      "quantity": 2,
      "price": 399,
      "specialInstructions": "Extra cheese"
    }
  ],
  "subtotal": 798,
  "tax": 39.90,
  "totalAmount": 837.90
}
```

**Response (201):**
```json
{
  "message": "Order created successfully",
  "order": {
    "_id": "507f1f77bcf86cd799439014",
    "orderId": "ORD-1717427639000-abc123",
    "status": "pending",
    "totalAmount": 837.90,
    "paymentStatus": "pending"
  }
}
```

---

### Get Orders
**GET** `/orders/restaurant/:restaurantId`

**Response (200):**
```json
[
  {
    "_id": "507f1f77bcf86cd799439014",
    "orderId": "ORD-1717427639000-abc123",
    "tableNumber": 5,
    "status": "pending",
    "totalAmount": 837.90,
    "createdAt": "2026-06-03T14:47:19.000Z"
  }
]
```

---

### Update Order Status
**PATCH** `/orders/:id/status`

**Request Body:**
```json
{
  "status": "preparing"
}
```

**Status Values:**
- `pending`
- `preparing`
- `ready`
- `served`
- `completed`
- `cancelled`

---

## 💳 Billing Endpoints

### Create Invoice
**POST** `/billing`

**Request Body:**
```json
{
  "restaurantId": "507f1f77bcf86cd799439012",
  "orderId": "507f1f77bcf86cd799439014",
  "customerId": "507f1f77bcf86cd799439011",
  "customerName": "John Doe",
  "customerPhone": "+919999999999",
  "cashierId": "507f1f77bcf86cd799439015",
  "discount": 50,
  "discountType": "flat",
  "paymentMethod": "cash",
  "tableNumber": 5
}
```

**Response (201):**
```json
{
  "message": "Invoice created successfully",
  "billing": {
    "_id": "507f1f77bcf86cd799439016",
    "invoiceNumber": "INV-1717427639000-xyz789",
    "totalAmount": 787.90,
    "status": "completed"
  }
}
```

---

## 🍳 Kitchen (KOT) Endpoints

### Create KOT
**POST** `/kitchen`

**Request Body:**
```json
{
  "restaurantId": "507f1f77bcf86cd799439012",
  "orderId": "507f1f77bcf86cd799439014",
  "station": "main_kitchen"
}
```

**Response (201):**
```json
{
  "message": "KOT created successfully",
  "kot": {
    "_id": "507f1f77bcf86cd799439017",
    "kotNumber": "KOT-1717427639000-abc123",
    "status": "pending",
    "items": [...]
  }
}
```

---

### Get Pending Orders
**GET** `/kitchen/station/:station?restaurantId=:id`

**Query Parameters:**
- `restaurantId` (required)

**Response (200):**
```json
[
  {
    "_id": "507f1f77bcf86cd799439017",
    "kotNumber": "KOT-1717427639000-abc123",
    "tableNumber": 5,
    "status": "pending",
    "items": [...]
  }
]
```

---

### Update KOT Status
**PATCH** `/kitchen/:id/status`

**Request Body:**
```json
{
  "status": "ready"
}
```

---

## 👥 Attendance Endpoints (With Biometric & GPS)

### Check-In
**POST** `/attendance/check-in`

**Request Body:**
```json
{
  "userId": "507f1f77bcf86cd799439011",
  "restaurantId": "507f1f77bcf86cd799439012",
  "latitude": 28.7041,
  "longitude": 77.1025,
  "accuracy": 10,
  "faceData": [0.123, 0.456, ...],
  "imageUrl": "data:image/png;base64,..."
}
```

**Response (201):**
```json
{
  "message": "Check-in successful",
  "attendance": {
    "_id": "507f1f77bcf86cd799439018",
    "checkInTime": "2026-06-03T14:47:19.000Z",
    "isInsideLocation": true,
    "faceVerified": true,
    "faceVerificationScore": 0.95
  },
  "warnings": []
}
```

---

### Check-Out
**POST** `/attendance/check-out`

**Request Body:**
```json
{
  "userId": "507f1f77bcf86cd799439011",
  "restaurantId": "507f1f77bcf86cd799439012",
  "latitude": 28.7041,
  "longitude": 77.1025,
  "accuracy": 10,
  "imageUrl": "data:image/png;base64,..."
}
```

**Response (200):**
```json
{
  "message": "Check-out successful",
  "attendance": {
    "_id": "507f1f77bcf86cd799439018",
    "checkOutTime": "2026-06-03T18:47:19.000Z",
    "totalHours": 4.0,
    "status": "present"
  }
}
```

---

### Get Attendance History
**GET** `/attendance/history/:userId?restaurantId=:id&startDate=:date&endDate=:date`

**Query Parameters:**
- `restaurantId` (optional)
- `startDate` (optional) - ISO format
- `endDate` (optional) - ISO format

**Response (200):**
```json
[
  {
    "_id": "507f1f77bcf86cd799439018",
    "date": "2026-06-03",
    "checkInTime": "2026-06-03T14:47:19.000Z",
    "checkOutTime": "2026-06-03T18:47:19.000Z",
    "totalHours": 4.0,
    "isInsideLocation": true,
    "faceVerified": true,
    "status": "present"
  }
]
```

---

### Get Staff Status
**GET** `/attendance/staff/status/:restaurantId`

Returns all staff with today's attendance status.

**Response (200):**
```json
[
  {
    "userId": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "role": "staff",
    "status": "present",
    "checkInTime": "2026-06-03T14:47:19.000Z",
    "isInsideLocation": true
  }
]
```

---

## 📊 Analytics Endpoints

### Get Sales Analytics
**GET** `/analytics/sales/:restaurantId?startDate=:date&endDate=:date`

**Response (200):**
```json
{
  "data": [
    {
      "_id": "507f1f77bcf86cd799439019",
      "date": "2026-06-03",
      "totalOrders": 25,
      "totalRevenue": 12500,
      "totalCustomers": 45,
      "topSellingItems": [...]
    }
  ],
  "summary": {
    "totalOrders": 25,
    "totalRevenue": 12500,
    "totalItemsSold": 65,
    "totalCustomers": 45
  }
}
```

---

### Get Dashboard Metrics
**GET** `/analytics/dashboard/:restaurantId`

Returns today's metrics.

**Response (200):**
```json
{
  "ordersToday": 25,
  "revenueToday": 12500,
  "activeOrders": 3,
  "timestamp": "2026-06-03T14:47:19.000Z"
}
```

---

## 💰 Payment Endpoints

### Create Payment Order
**POST** `/payment/create-order`

**Request Body:**
```json
{
  "orderId": "507f1f77bcf86cd799439014",
  "amount": 837.90,
  "currency": "INR"
}
```

**Response (200):**
```json
{
  "id": "order_12345678",
  "amount": 83790,
  "currency": "INR"
}
```

---

### Verify Payment
**POST** `/payment/verify`

**Request Body:**
```json
{
  "orderId": "order_12345678",
  "paymentId": "pay_12345678",
  "signature": "9ef4dffbfd84f1318f6739a3ce19f9d85851857ae648f114332d8401e0949a3d"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Payment verified successfully"
}
```

---

## Error Responses

### 400 Bad Request
```json
{
  "error": "Missing required fields"
}
```

### 401 Unauthorized
```json
{
  "error": "Invalid or expired token"
}
```

### 404 Not Found
```json
{
  "error": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal server error",
  "status": 500
}
```

---

## Rate Limiting

- **Limit:** 100 requests per minute per IP
- **Header:** `X-RateLimit-Remaining`

---

## Pagination

For endpoints returning lists:

**Query Parameters:**
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20, max: 100)

**Response includes:**
```json
{
  "data": [...],
  "pagination": {
    "total": 100,
    "page": 1,
    "limit": 20,
    "pages": 5
  }
}
```

---

## WebSocket Events (Socket.io)

Real-time updates via Socket.io:

### Client to Server
- `new-order` - New order placed
- `order-status-change` - Order status updated
- `attendance-check-in` - Staff checked in
- `attendance-check-out` - Staff checked out

### Server to Client
- `order-update` - Order changes
- `kitchen-update` - Kitchen order changes
- `attendance-update` - Attendance changes

---

Last Updated: 2026-06-03  
Version: 1.0.0
