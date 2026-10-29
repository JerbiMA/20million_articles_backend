# MRIWL Backend — Frontend Integration Guide & API Reference

> **Target Audience:** Frontend Engineers (React, Next.js, Vue, Mobile)  
> **Backend Base URL:** `http://localhost:5000/api/v1`  
> **Interactive Swagger UI:** `http://localhost:5000/api-docs`  
> **OpenAPI JSON Spec:** `http://localhost:5000/api-docs.json`  
> **Health Check:** `http://localhost:5000/health`  

---

## 1. Core Architecture & Protocol Conventions

### 1.1 HTTP Headers & Formats
- **Content-Type**: Always send `application/json` for standard endpoints (except image upload routes which take `multipart/form-data`).
- **Credentials**: Always configure HTTP clients with `withCredentials: true` (or `credentials: 'include'` in Fetch) so that httpOnly refresh-token cookies are sent and received automatically.
- **Authorization**: Protected endpoints require the HTTP header:
  ```http
  Authorization: Bearer <accessToken>
  ```
- **Guest Session Identifier**: For guest users (browsing cart / placing guest orders), send a persistent UUID in the header:
  ```http
  x-session-id: <uuid_v4_generated_on_client>
  ```

---

### 1.2 Standard API Response Envelope

#### ✅ Success Response
All endpoints return an envelope with `success: true`:
```json
{
  "success": true,
  "message": "Optional user-friendly message",
  "data": { ... } // or array [...]
}
```

#### 📄 Paginated Response (e.g. Products, Orders)
```json
{
  "success": true,
  "data": [ ... ],
  "meta": {
    "total": 45,
    "page": 1,
    "limit": 20,
    "totalPages": 3
  }
}
```

#### ❌ Error Response
In case of errors (4xx / 5xx), the backend consistently returns:
```json
{
  "success": false,
  "message": "Invalid email or password"
}
```
*(In `NODE_ENV=development`, an extra `"stack"` property is included for debugging).*

---

## 2. Recommended Frontend Axios Setup (Plug & Play)

Create an `api.js` or `httpClient.ts` with automatic token refresh, guest session management, and Bearer injection:

```javascript
import axios from 'axios';

// 1. Manage persistent guest session ID
const getGuestSessionId = () => {
  let sessionId = localStorage.getItem('mriwl_session_id');
  if (!sessionId) {
    sessionId = 'guest_' + crypto.randomUUID();
    localStorage.setItem('mriwl_session_id', sessionId);
  }
  return sessionId;
};

// 2. Create Axios instance
export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1',
  withCredentials: true, // Crucial for refreshToken cookie
  headers: {
    'Content-Type': 'application/json',
  },
});

// 3. Request Interceptor: Attach Access Token & Session ID
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  // Attach guest session ID (used if user is not authenticated)
  config.headers['x-session-id'] = getGuestSessionId();
  return config;
});

// 4. Response Interceptor: Seamless Auto-Refresh on 401
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response.data, // Directly return response envelope
  async (error) => {
    const originalRequest = error.config;

    // If 401 and not already retried
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (originalRequest.url.includes('/auth/login') || originalRequest.url.includes('/auth/refresh-token')) {
        return Promise.reject(error.response?.data || error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Backend reads refreshToken cookie automatically
        const res = await axios.post(
          'http://localhost:5000/api/v1/auth/refresh-token',
          {},
          { withCredentials: true }
        );
        const newAccessToken = res.data.data.accessToken;
        localStorage.setItem('accessToken', newAccessToken);

        processQueue(null, newAccessToken);
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } catch (refreshErr) {
        processQueue(refreshErr, null);
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');
        // Optional: redirect to login
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error.response?.data || error);
  }
);
```

---

## 3. Complete API Endpoint Reference

---

### 3.1 Authentication (`/auth`)

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/auth/register` | None | Register a customer account |
| `POST` | `/auth/login` | None | Log in with email & password |
| `POST` | `/auth/refresh-token` | Cookie | Get new access token |
| `POST` | `/auth/logout` | None | Log out (clears cookie) |
| `GET` | `/auth/me` | Bearer | Get current authenticated user |

#### `POST /auth/register`
**Body:**
```json
{
  "name": "Karim Benzema",
  "email": "karim@example.com",
  "password": "Password@1234",
  "phone": "+212600112233",
  "address": {
    "street": "123 Boulevard d'Anfa",
    "city": "Casablanca",
    "postalCode": "20000",
    "country": "Morocco"
  }
}
```
**Response (201):**
```json
{
  "success": true,
  "message": "Registration successful",
  "data": {
    "user": {
      "_id": "671d1234abcd5678ef901234",
      "name": "Karim Benzema",
      "email": "karim@example.com",
      "role": "user",
      "phone": "+212600112233",
      "address": { "street": "...", "city": "...", "country": "Morocco" },
      "isActive": true
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6..."
  }
}
```

#### `POST /auth/login`
**Body:**
```json
{
  "email": "admin@mriwl.com",
  "password": "Admin@12345678"
}
```
**Response (200):** Same structure as register (`user` + `accessToken`). The `refreshToken` is set as an `httpOnly` secure cookie.

---

### 3.2 Categories (`/categories`)

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/categories` | Public | List all active categories sorted |
| `GET` | `/categories/:slug` | Public | Category details + its active products |

#### Category Slugs Available:
- `new-season` (Latest 2024/25 football shirts)
- `classical` (Vintage & retro club shirts)
- `international` (National team tournament shirts)
- `classical-international` (World Cup retro shirts)
- `thrifting` (Pre-owned verified gems)
- `winter-collection` (Club survetements, jackets, tracksuits)

---

### 3.3 Teams (`/teams`)

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/teams` | Public | Filter teams by league, type, country, search |
| `GET` | `/teams/:slug` | Public | Get team info by slug |

#### `GET /teams` Query Parameters:
- `league`: Filter by league (e.g. `Premier League`, `La Liga`, `Ligue 1`, `Bundesliga`, `Serie A`, `Saudi Pro League`)
- `type`: `club` or `national`
- `country`: Filter by country e.g. `Spain`, `Morocco`
- `search`: Search name e.g. `madrid`

**Response Example:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "671d...",
      "name": "Real Madrid",
      "slug": "real-madrid",
      "type": "club",
      "league": "La Liga",
      "country": "Spain",
      "logo": { "url": "..." }
    }
  ]
}
```

---

### 3.4 Products Catalog (`/products`)

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/products` | Public | Search, filter, paginate catalog |
| `GET` | `/products/:slug` | Public | Single product details |

#### `GET /products` Query Parameters (All Optional):
| Parameter | Type | Example | Description |
|---|---|---|---|
| `category` | String | `671d...` | Category ID |
| `team` | String | `671d...` | Team ID |
| `season` | String | `2024/2025` | Season string |
| `size` | String | `M` | `XS`, `S`, `M`, `L`, `XL`, `XXL`, `3XL` |
| `inStock` | Boolean | `true` | Only products with available inventory |
| `isFeatured` | Boolean | `true` | Highlighted on homepage |
| `minPrice` | Number | `50` | Minimum effective price |
| `maxPrice` | Number | `120` | Maximum effective price |
| `search` | String | `ronaldo` | Full-text search (name, description, tags) |
| `sort` | String | `-createdAt` | `price`, `-price`, `createdAt`, `-createdAt` |
| `page` | Integer | `1` | Page number (default: 1) |
| `limit` | Integer | `20` | Items per page (default: 20) |

#### Product Data Model:
```typescript
interface Product {
  _id: string;
  name: string;
  slug: string;
  description: string;
  price: number;              // Base price (e.g. 95)
  salePrice: number | null;   // Discounted price (e.g. 85 or null)
  effectivePrice: number;     // Virtual: salePrice if present else price
  category: Category;         // Populated category object
  team: Team;                 // Populated team object
  season: string;             // "2024/2025"
  sizes: Array<{
    size: 'XS' | 'S' | 'M' | 'L' | 'XL' | 'XXL' | '3XL';
    stock: number;            // Stock level for this exact size!
  }>;
  totalStock: number;         // Virtual: sum of all variant stocks
  inStock: boolean;           // Virtual: true if any size has stock > 0
  isFeatured: boolean;
  tags: string[];
  images: Array<{
    _id: string;
    url: string;
    publicId: string;
    isMain: boolean;
  }>;
  mainImage: string;          // Virtual: primary display image URL
}
```

---

### 3.5 Shopping Cart (`/cart`)

The cart automatically identifies users via:
1. **Bearer Token** (if logged in)
2. **`x-session-id` Header** (if guest visitor)

| Method | Endpoint | Auth / Headers | Description |
|---|---|---|---|
| `GET` | `/cart` | Token OR `x-session-id` | Retrieve current cart & subtotal |
| `POST` | `/cart/items` | Token OR `x-session-id` | Add product variant to cart |
| `PUT` | `/cart/items` | Token OR `x-session-id` | Update variant quantity |
| `DELETE` | `/cart/items` | Token OR `x-session-id` | Remove variant from cart |
| `DELETE` | `/cart` | Token OR `x-session-id` | Clear entire cart |

#### `POST /cart/items` (Add to Cart)
```json
{
  "productId": "671d1234abcd5678ef901237",
  "size": "L",
  "quantity": 1
}
```
*Validation rule: Backend checks that `stock >= quantity` for the chosen size. If stock is insufficient, it returns a 400 with a descriptive error message.*

#### `DELETE /cart/items` (Remove Variant)
```json
{
  "productId": "671d1234abcd5678ef901237",
  "size": "L"
}
```

#### Cart Response Shape:
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "product": { ...full product... },
        "size": "L",
        "quantity": 2,
        "price": 85,
        "itemTotal": 170
      }
    ],
    "subtotal": 170,
    "totalItems": 2
  }
}
```

---

### 3.6 Coupons (`/coupons`)

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/coupons/validate` | Public | Validate discount code before checkout |

#### Request:
```json
{
  "code": "WELCOME10",
  "orderAmount": 170
}
```

#### Response (200):
```json
{
  "success": true,
  "data": {
    "code": "WELCOME10",
    "type": "percentage",
    "discountAmount": 17,
    "finalAmount": 153
  }
}
```

---

### 3.7 Orders & Checkout (`/orders`)

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/orders` | Public / Token | Place order (guest or registered) |
| `GET` | `/orders/my-orders` | Bearer (User) | Customer order history |
| `GET` | `/orders/:id` | Bearer (User/Admin) | Get order by MongoDB ID |
| `GET` | `/orders/guest/:orderNumber` | Public | Track guest order |

#### `POST /orders` (Checkout Payload)
The frontend can either checkout directly from the active cart or provide items explicitly:

```json
{
  "customer": {
    "name": "Achraf Hakimi",
    "email": "achraf@example.com",
    "phone": "+212611223344"
  },
  "shippingAddress": {
    "street": "Boulevard Zerktouni",
    "city": "Casablanca",
    "postalCode": "20000",
    "country": "Morocco"
  },
  "paymentMethod": "cod", // "cod" (Cash on Delivery) or "card"
  "couponCode": "WELCOME10", // Optional
  "notes": "Call upon arrival" // Optional
}
```

#### What happens during checkout:
1. Cart items are verified against real-time inventory.
2. Stock is atomically decremented.
3. Pricing is calculated: `subtotal`, `discount`, `shippingFee`, `total`.
4. Order number is auto-generated (e.g. `ORD-202610-00001`).
5. Cart is automatically cleared.

---

### 3.8 User Profile (`/users`)

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/users/profile` | Bearer | Get customer details & default address |
| `PUT` | `/users/profile` | Bearer | Update name, phone, address |
| `PUT` | `/users/change-password` | Bearer | Change password |

---

## 4. Admin Panel APIs (`/admin/*`)

All `/admin` routes require:
```http
Authorization: Bearer <admin_access_token>
```

| Area | Method | Endpoint | Description |
|---|---|---|---|
| **Stats** | `GET` | `/admin/orders/stats` | Total revenue, order count, status breakdown |
| **Orders** | `GET` | `/admin/orders` | Filter by `status`, `search`, pagination |
| **Orders** | `PATCH` | `/admin/orders/:id/status` | Update `status`, `paymentStatus`, `trackingNumber` |
| **Products** | `GET` | `/admin/products` | All products (including inactive) |
| **Products** | `POST` | `/admin/products` | Create product (multipart with images or JSON) |
| **Products** | `PUT` | `/admin/products/:id` | Edit details / pricing / active status |
| **Products** | `PATCH` | `/admin/products/:id/stock` | Quick update stock for size variants |
| **Products** | `DELETE` | `/admin/products/:id` | Delete product |
| **Categories** | `GET, POST, PUT, DELETE` | `/admin/categories` | Full category management |
| **Teams** | `GET, POST, PUT, DELETE` | `/admin/teams` | Full team catalog management |
| **Coupons** | `GET, POST, PUT, DELETE` | `/admin/coupons` | Manage discount codes |
| **Users** | `GET, PATCH, DELETE` | `/admin/users` | Manage customer accounts & roles |

#### Order Status Lifecycle:
`pending` ➔ `confirmed` ➔ `processing` ➔ `shipped` ➔ `delivered` (or `cancelled`)

---

## 5. Frontend Implementation Recipes

### 5.1 Size Picker & Stock Guard (React Example)
```jsx
function SizeSelector({ product, selectedSize, onSelectSize }) {
  return (
    <div className="flex gap-2">
      {['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL'].map((size) => {
        const variant = product.sizes.find((v) => v.size === size);
        const isOutOfStock = !variant || variant.stock <= 0;

        return (
          <button
            key={size}
            disabled={isOutOfStock}
            onClick={() => onSelectSize(size)}
            className={`px-4 py-2 border rounded-md font-medium transition ${
              selectedSize === size
                ? 'bg-black text-white border-black'
                : isOutOfStock
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed line-through'
                : 'bg-white text-black hover:border-black'
            }`}
          >
            {size} {variant ? `(${variant.stock})` : ''}
          </button>
        );
      })}
    </div>
  );
}
```

### 5.2 Price Display Helper
Always prefer `effectivePrice` or format `salePrice` when available:
```javascript
export function formatPrice(product) {
  if (product.salePrice != null && product.salePrice < product.price) {
    return {
      hasDiscount: true,
      current: `${product.salePrice} €`,
      original: `${product.price} €`,
      save: `${Math.round(((product.price - product.salePrice) / product.price) * 100)}% OFF`,
    };
  }
  return {
    hasDiscount: false,
    current: `${product.price} €`,
  };
}
```

---

## 6. Seeded Test Credentials

- **Admin Account**: `admin@mriwl.com` / `Admin@12345678`
- **Customer Account**: `user@mriwl.com` / `User@12345678`
- **Active Coupons**:
  - `WELCOME10`: 10% discount (min order 50 €/MAD)
  - `MRIWL20`: 20 €/MAD flat discount (min order 100 €/MAD)
