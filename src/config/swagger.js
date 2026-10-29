/**
 * Swagger / OpenAPI 3.0.0 Specification
 * Provides interactive documentation for all MRIWL REST API endpoints.
 */

const swaggerSpec = {
  openapi: '3.0.3',
  info: {
    title: 'MRIWL E-Commerce API',
    version: '1.0.0',
    description: `
### Football Shirts & Winter Sports Apparel E-Commerce Backend
Comprehensive REST API built with Express, MongoDB, and Mongoose.

#### Key Features:
- **Authentication**: JWT access & refresh tokens, password hashing, role-based access control (User & Admin).
- **Storefront**: Products, categories, teams, seasons, stock availability, size variants, and full-text search.
- **Cart & Orders**: Support for both guest shoppers (session-based) and registered users.
- **Discounts**: Coupon validation (percentage & fixed discount).
- **Admin Dashboard**: Catalog management (categories, teams, products, size variants & stock), order workflow, and customer management.

#### Authentication:
Click **Authorize** below and paste your JWT Bearer token: \`Bearer <your_token>\`.
    `,
    contact: {
      name: 'MRIWL Support',
      email: 'admin@mriwl.com',
    },
  },
  servers: [
    {
      url: '/api/v1',
      description: 'API v1 Base',
    },
  ],
  components: {
    securitySchemes: {
      BearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Enter your JWT token in the format: Bearer <token>',
      },
    },
    schemas: {
      ErrorResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          message: { type: 'string', example: 'Error description message' },
        },
      },
      User: {
        type: 'object',
        properties: {
          _id: { type: 'string', example: '671d1234abcd5678ef901234' },
          name: { type: 'string', example: 'John Doe' },
          email: { type: 'string', example: 'john@example.com' },
          role: { type: 'string', enum: ['user', 'admin'], example: 'user' },
          phone: { type: 'string', example: '+212600000000' },
          address: {
            type: 'object',
            properties: {
              street: { type: 'string', example: '123 Boulevard Mohammed V' },
              city: { type: 'string', example: 'Casablanca' },
              postalCode: { type: 'string', example: '20000' },
              country: { type: 'string', example: 'Morocco' },
            },
          },
          isActive: { type: 'boolean', example: true },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
      Category: {
        type: 'object',
        properties: {
          _id: { type: 'string', example: '671d1234abcd5678ef901235' },
          name: { type: 'string', example: 'New Season' },
          slug: { type: 'string', example: 'new-season' },
          description: { type: 'string', example: 'Latest season football shirts' },
          image: {
            type: 'object',
            properties: {
              url: { type: 'string', example: 'https://res.cloudinary.com/demo/image/upload/sample.jpg' },
              publicId: { type: 'string', example: 'sample' },
            },
          },
          sortOrder: { type: 'integer', example: 1 },
          isActive: { type: 'boolean', example: true },
        },
      },
      Team: {
        type: 'object',
        properties: {
          _id: { type: 'string', example: '671d1234abcd5678ef901236' },
          name: { type: 'string', example: 'Real Madrid' },
          slug: { type: 'string', example: 'real-madrid' },
          type: { type: 'string', enum: ['club', 'national'], example: 'club' },
          league: { type: 'string', example: 'La Liga' },
          country: { type: 'string', example: 'Spain' },
          logo: {
            type: 'object',
            properties: {
              url: { type: 'string', example: 'https://res.cloudinary.com/demo/image/upload/sample.jpg' },
              publicId: { type: 'string', example: 'sample' },
            },
          },
        },
      },
      ProductSize: {
        type: 'object',
        properties: {
          size: { type: 'string', enum: ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL'], example: 'M' },
          stock: { type: 'integer', example: 10 },
        },
      },
      Product: {
        type: 'object',
        properties: {
          _id: { type: 'string', example: '671d1234abcd5678ef901237' },
          name: { type: 'string', example: 'Real Madrid Home Kit 2024/25' },
          slug: { type: 'string', example: 'real-madrid-home-kit-2024-25' },
          description: { type: 'string', example: 'Official authentic Real Madrid home jersey.' },
          price: { type: 'number', example: 90 },
          salePrice: { type: 'number', example: 75, nullable: true },
          effectivePrice: { type: 'number', example: 75 },
          category: { $ref: '#/components/schemas/Category' },
          team: { $ref: '#/components/schemas/Team' },
          season: { type: 'string', example: '2024/2025' },
          sizes: {
            type: 'array',
            items: { $ref: '#/components/schemas/ProductSize' },
          },
          totalStock: { type: 'integer', example: 35 },
          inStock: { type: 'boolean', example: true },
          isFeatured: { type: 'boolean', example: true },
          isActive: { type: 'boolean', example: true },
          tags: { type: 'array', items: { type: 'string' }, example: ['la liga', 'madrid', 'white'] },
          images: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                url: { type: 'string' },
                publicId: { type: 'string' },
                isMain: { type: 'boolean' },
              },
            },
          },
        },
      },
      CartItem: {
        type: 'object',
        properties: {
          product: { $ref: '#/components/schemas/Product' },
          size: { type: 'string', example: 'L' },
          quantity: { type: 'integer', example: 2 },
          price: { type: 'number', example: 75 },
          itemTotal: { type: 'number', example: 150 },
        },
      },
      Cart: {
        type: 'object',
        properties: {
          items: {
            type: 'array',
            items: { $ref: '#/components/schemas/CartItem' },
          },
          subtotal: { type: 'number', example: 150 },
          totalItems: { type: 'integer', example: 2 },
        },
      },
      Coupon: {
        type: 'object',
        properties: {
          _id: { type: 'string', example: '671d1234abcd5678ef901238' },
          code: { type: 'string', example: 'WELCOME10' },
          type: { type: 'string', enum: ['percentage', 'fixed'], example: 'percentage' },
          value: { type: 'number', example: 10 },
          minOrderAmount: { type: 'number', example: 100 },
          maxDiscount: { type: 'number', example: 50 },
          endDate: { type: 'string', format: 'date-time' },
          isActive: { type: 'boolean', example: true },
        },
      },
      Order: {
        type: 'object',
        properties: {
          _id: { type: 'string', example: '671d1234abcd5678ef901239' },
          orderNumber: { type: 'string', example: 'ORD-20261026-A1B2' },
          customer: {
            type: 'object',
            properties: {
              name: { type: 'string', example: 'Karim Benzema' },
              email: { type: 'string', example: 'karim@example.com' },
              phone: { type: 'string', example: '+212612345678' },
            },
          },
          shippingAddress: {
            type: 'object',
            properties: {
              street: { type: 'string', example: 'Rue Anfa' },
              city: { type: 'string', example: 'Casablanca' },
              postalCode: { type: 'string', example: '20000' },
              country: { type: 'string', example: 'Morocco' },
            },
          },
          items: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                product: { type: 'string', example: '671d1234abcd5678ef901237' },
                name: { type: 'string', example: 'Real Madrid Home Kit 2024/25' },
                size: { type: 'string', example: 'L' },
                quantity: { type: 'integer', example: 1 },
                price: { type: 'number', example: 75 },
                total: { type: 'number', example: 75 },
              },
            },
          },
          pricing: {
            type: 'object',
            properties: {
              subtotal: { type: 'number', example: 75 },
              discount: { type: 'number', example: 7.5 },
              shippingFee: { type: 'number', example: 0 },
              total: { type: 'number', example: 67.5 },
            },
          },
          status: {
            type: 'string',
            enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'],
            example: 'pending',
          },
          paymentStatus: {
            type: 'string',
            enum: ['pending', 'paid', 'failed'],
            example: 'pending',
          },
          paymentMethod: {
            type: 'string',
            enum: ['cod', 'card'],
            example: 'cod',
          },
        },
      },
    },
  },
  paths: {
    // ──────────────────────────────────────────────
    // AUTHENTICATION
    // ──────────────────────────────────────────────
    '/auth/register': {
      post: {
        tags: ['Authentication'],
        summary: 'Register a new customer account',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name', 'email', 'password'],
                properties: {
                  name: { type: 'string', example: 'Reda Benjelloun' },
                  email: { type: 'string', example: 'reda@example.com' },
                  password: { type: 'string', example: 'Secret@1234' },
                  phone: { type: 'string', example: '+212611223344' },
                  address: {
                    type: 'object',
                    properties: {
                      street: { type: 'string', example: 'Maarif' },
                      city: { type: 'string', example: 'Casablanca' },
                      postalCode: { type: 'string', example: '20100' },
                      country: { type: 'string', example: 'Morocco' },
                    },
                  },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: 'Customer registered successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'Registration successful' },
                    data: {
                      type: 'object',
                      properties: {
                        user: { $ref: '#/components/schemas/User' },
                        accessToken: { type: 'string' },
                      },
                    },
                  },
                },
              },
            },
          },
          400: { $ref: '#/components/schemas/ErrorResponse' },
        },
      },
    },
    '/auth/login': {
      post: {
        tags: ['Authentication'],
        summary: 'Log in with email & password',
        description: 'Returns access token in response body and sets refresh token in httpOnly cookie.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  email: { type: 'string', example: 'admin@mriwl.com' },
                  password: { type: 'string', example: 'Admin@12345678' },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Authentication successful',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: {
                      type: 'object',
                      properties: {
                        user: { $ref: '#/components/schemas/User' },
                        accessToken: { type: 'string' },
                      },
                    },
                  },
                },
              },
            },
          },
          401: { $ref: '#/components/schemas/ErrorResponse' },
        },
      },
    },
    '/auth/me': {
      get: {
        tags: ['Authentication'],
        summary: 'Get currently authenticated user',
        security: [{ BearerAuth: [] }],
        responses: {
          200: {
            description: 'Authenticated user profile',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: { $ref: '#/components/schemas/User' },
                  },
                },
              },
            },
          },
          401: { $ref: '#/components/schemas/ErrorResponse' },
        },
      },
    },
    '/auth/refresh-token': {
      post: {
        tags: ['Authentication'],
        summary: 'Refresh access token using refresh token cookie or body',
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  refreshToken: { type: 'string', description: 'Optional if sent via cookie' },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Token refreshed',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: {
                      type: 'object',
                      properties: {
                        accessToken: { type: 'string' },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/auth/logout': {
      post: {
        tags: ['Authentication'],
        summary: 'Log out and clear refresh token cookie',
        responses: {
          200: {
            description: 'Logged out successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'Logged out successfully' },
                  },
                },
              },
            },
          },
        },
      },
    },

    // ──────────────────────────────────────────────
    // CATEGORIES (PUBLIC)
    // ──────────────────────────────────────────────
    '/categories': {
      get: {
        tags: ['Categories'],
        summary: 'Get all active product categories',
        responses: {
          200: {
            description: 'List of active categories',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/Category' },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/categories/{slug}': {
      get: {
        tags: ['Categories'],
        summary: 'Get category by slug with its active products',
        parameters: [
          {
            name: 'slug',
            in: 'path',
            required: true,
            schema: { type: 'string', example: 'new-season' },
          },
        ],
        responses: {
          200: {
            description: 'Category details and associated products',
          },
          404: { $ref: '#/components/schemas/ErrorResponse' },
        },
      },
    },

    // ──────────────────────────────────────────────
    // TEAMS (PUBLIC)
    // ──────────────────────────────────────────────
    '/teams': {
      get: {
        tags: ['Teams'],
        summary: 'Get list of football teams',
        parameters: [
          { name: 'type', in: 'query', schema: { type: 'string', enum: ['club', 'national'] }, description: 'Filter by club or national' },
          { name: 'league', in: 'query', schema: { type: 'string' }, description: 'Filter by league e.g. La Liga, Premier League' },
          { name: 'country', in: 'query', schema: { type: 'string' }, description: 'Filter by country' },
          { name: 'search', in: 'query', schema: { type: 'string' }, description: 'Search team by name' },
        ],
        responses: {
          200: {
            description: 'List of teams',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/Team' },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/teams/{slug}': {
      get: {
        tags: ['Teams'],
        summary: 'Get team details by slug',
        parameters: [
          { name: 'slug', in: 'path', required: true, schema: { type: 'string', example: 'real-madrid' } },
        ],
        responses: {
          200: { description: 'Team details' },
          404: { $ref: '#/components/schemas/ErrorResponse' },
        },
      },
    },

    // ──────────────────────────────────────────────
    // PRODUCTS (PUBLIC)
    // ──────────────────────────────────────────────
    '/products': {
      get: {
        tags: ['Products'],
        summary: 'Search & filter catalog products',
        parameters: [
          { name: 'category', in: 'query', schema: { type: 'string' }, description: 'Category ID' },
          { name: 'team', in: 'query', schema: { type: 'string' }, description: 'Team ID' },
          { name: 'season', in: 'query', schema: { type: 'string' }, description: 'Season e.g. 2024/2025' },
          { name: 'size', in: 'query', schema: { type: 'string', enum: ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL'] } },
          { name: 'inStock', in: 'query', schema: { type: 'boolean' } },
          { name: 'isFeatured', in: 'query', schema: { type: 'boolean' } },
          { name: 'minPrice', in: 'query', schema: { type: 'number' } },
          { name: 'maxPrice', in: 'query', schema: { type: 'number' } },
          { name: 'search', in: 'query', schema: { type: 'string' }, description: 'Full-text search in name, description, tags' },
          { name: 'sort', in: 'query', schema: { type: 'string', example: '-createdAt' }, description: 'Sort by price, -price, createdAt, -createdAt' },
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 20 } },
        ],
        responses: {
          200: {
            description: 'Paginated list of products',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/Product' },
                    },
                    meta: {
                      type: 'object',
                      properties: {
                        total: { type: 'integer' },
                        page: { type: 'integer' },
                        limit: { type: 'integer' },
                        totalPages: { type: 'integer' },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/products/{slug}': {
      get: {
        tags: ['Products'],
        summary: 'Get single product by slug',
        parameters: [
          { name: 'slug', in: 'path', required: true, schema: { type: 'string', example: 'real-madrid-home-kit-2024-25' } },
        ],
        responses: {
          200: {
            description: 'Product details',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: { $ref: '#/components/schemas/Product' },
                  },
                },
              },
            },
          },
          404: { $ref: '#/components/schemas/ErrorResponse' },
        },
      },
    },

    // ──────────────────────────────────────────────
    // SHOPPING CART (GUEST + USER)
    // ──────────────────────────────────────────────
    '/cart': {
      get: {
        tags: ['Cart'],
        summary: 'Get current cart',
        description: 'Supports both logged-in users (via Bearer token) and guest visitors (via x-session-id header).',
        parameters: [
          {
            name: 'x-session-id',
            in: 'header',
            schema: { type: 'string', example: 'guest-session-12345' },
            description: 'Session identifier for guest visitors',
          },
        ],
        responses: {
          200: {
            description: 'Current shopping cart with calculated subtotal',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: { $ref: '#/components/schemas/Cart' },
                  },
                },
              },
            },
          },
        },
      },
      delete: {
        tags: ['Cart'],
        summary: 'Clear shopping cart',
        parameters: [
          { name: 'x-session-id', in: 'header', schema: { type: 'string' } },
        ],
        responses: {
          200: {
            description: 'Cart emptied',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'Cart cleared' },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/cart/items': {
      post: {
        tags: ['Cart'],
        summary: 'Add an item to cart',
        parameters: [
          { name: 'x-session-id', in: 'header', schema: { type: 'string' } },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['productId', 'size', 'quantity'],
                properties: {
                  productId: { type: 'string', example: '671d1234abcd5678ef901237' },
                  size: { type: 'string', enum: ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL'], example: 'L' },
                  quantity: { type: 'integer', minimum: 1, example: 1 },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Item added to cart',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: { $ref: '#/components/schemas/Cart' },
                  },
                },
              },
            },
          },
        },
      },
      put: {
        tags: ['Cart'],
        summary: 'Update item quantity in cart',
        parameters: [
          { name: 'x-session-id', in: 'header', schema: { type: 'string' } },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['productId', 'size', 'quantity'],
                properties: {
                  productId: { type: 'string' },
                  size: { type: 'string', example: 'L' },
                  quantity: { type: 'integer', minimum: 1, example: 3 },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Quantity updated' },
        },
      },
      delete: {
        tags: ['Cart'],
        summary: 'Remove an item variant from cart',
        parameters: [
          { name: 'x-session-id', in: 'header', schema: { type: 'string' } },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['productId', 'size'],
                properties: {
                  productId: { type: 'string' },
                  size: { type: 'string', example: 'L' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Item removed from cart' },
        },
      },
    },

    // ──────────────────────────────────────────────
    // ORDERS
    // ──────────────────────────────────────────────
    '/orders': {
      post: {
        tags: ['Orders'],
        summary: 'Create a new order (Guest or Registered User)',
        description: 'Places an order either using cart items or explicitly provided items. Deducts inventory atomically.',
        parameters: [
          { name: 'x-session-id', in: 'header', schema: { type: 'string' }, description: 'Session ID if guest ordering from cart' },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['customer', 'shippingAddress'],
                properties: {
                  customer: {
                    type: 'object',
                    required: ['name', 'email', 'phone'],
                    properties: {
                      name: { type: 'string', example: 'Yassine Bounou' },
                      email: { type: 'string', example: 'bounou@example.com' },
                      phone: { type: 'string', example: '+212622334455' },
                    },
                  },
                  shippingAddress: {
                    type: 'object',
                    required: ['street', 'city', 'country'],
                    properties: {
                      street: { type: 'string', example: 'Avenue des FAR' },
                      city: { type: 'string', example: 'Casablanca' },
                      postalCode: { type: 'string', example: '20000' },
                      country: { type: 'string', example: 'Morocco' },
                    },
                  },
                  paymentMethod: { type: 'string', enum: ['cod', 'card'], default: 'cod', example: 'cod' },
                  couponCode: { type: 'string', example: 'WELCOME10' },
                  notes: { type: 'string', example: 'Please call before delivery' },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: 'Order placed successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: { $ref: '#/components/schemas/Order' },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/orders/my-orders': {
      get: {
        tags: ['Orders'],
        summary: 'Get order history for logged-in user',
        security: [{ BearerAuth: [] }],
        responses: {
          200: {
            description: 'List of user orders',
          },
        },
      },
    },
    '/orders/guest/{orderNumber}': {
      get: {
        tags: ['Orders'],
        summary: 'Track guest order by order number and email or phone',
        parameters: [
          { name: 'orderNumber', in: 'path', required: true, schema: { type: 'string', example: 'ORD-20261026-A1B2' } },
          { name: 'email', in: 'query', schema: { type: 'string' } },
          { name: 'phone', in: 'query', schema: { type: 'string' } },
        ],
        responses: {
          200: { description: 'Guest order details' },
          404: { $ref: '#/components/schemas/ErrorResponse' },
        },
      },
    },
    '/orders/{id}': {
      get: {
        tags: ['Orders'],
        summary: 'Get order by ID (customer own order or admin)',
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
        ],
        responses: {
          200: { description: 'Order details' },
          404: { $ref: '#/components/schemas/ErrorResponse' },
        },
      },
    },

    // ──────────────────────────────────────────────
    // COUPONS (PUBLIC VALIDATION)
    // ──────────────────────────────────────────────
    '/coupons/validate': {
      post: {
        tags: ['Coupons'],
        summary: 'Validate coupon and calculate discount amount',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['code', 'orderAmount'],
                properties: {
                  code: { type: 'string', example: 'WELCOME10' },
                  orderAmount: { type: 'number', example: 120 },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Coupon valid, discount details returned',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: {
                      type: 'object',
                      properties: {
                        code: { type: 'string', example: 'WELCOME10' },
                        type: { type: 'string', example: 'percentage' },
                        discountAmount: { type: 'number', example: 12 },
                        finalAmount: { type: 'number', example: 108 },
                      },
                    },
                  },
                },
              },
            },
          },
          400: { $ref: '#/components/schemas/ErrorResponse' },
        },
      },
    },

    // ──────────────────────────────────────────────
    // USER SELF-SERVICE
    // ──────────────────────────────────────────────
    '/users/profile': {
      get: {
        tags: ['User Profile'],
        summary: 'Get current user profile',
        security: [{ BearerAuth: [] }],
        responses: {
          200: { description: 'User profile details' },
        },
      },
      put: {
        tags: ['User Profile'],
        summary: 'Update current user profile info and address',
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  name: { type: 'string', example: 'John Updated' },
                  phone: { type: 'string', example: '+212699887766' },
                  address: {
                    type: 'object',
                    properties: {
                      street: { type: 'string' },
                      city: { type: 'string' },
                      postalCode: { type: 'string' },
                      country: { type: 'string' },
                    },
                  },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Profile updated successfully' },
        },
      },
    },
    '/users/change-password': {
      put: {
        tags: ['User Profile'],
        summary: 'Change current user password',
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['currentPassword', 'newPassword'],
                properties: {
                  currentPassword: { type: 'string', example: 'Secret@1234' },
                  newPassword: { type: 'string', example: 'NewSecret@1234' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Password changed successfully' },
        },
      },
    },

    // ──────────────────────────────────────────────
    // ADMIN DASHBOARD & MANAGEMENT (REQUIRE ADMIN ROLE)
    // ──────────────────────────────────────────────
    '/admin/orders/stats': {
      get: {
        tags: ['Admin - Orders'],
        summary: 'Get overall order statistics and revenue metrics',
        security: [{ BearerAuth: [] }],
        responses: {
          200: {
            description: 'Aggregated order and sales stats',
          },
        },
      },
    },
    '/admin/orders': {
      get: {
        tags: ['Admin - Orders'],
        summary: 'List all store orders with status and search filters',
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: 'status', in: 'query', schema: { type: 'string', enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'] } },
          { name: 'search', in: 'query', schema: { type: 'string' } },
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 20 } },
        ],
        responses: {
          200: { description: 'Paginated orders' },
        },
      },
    },
    '/admin/orders/{id}/status': {
      patch: {
        tags: ['Admin - Orders'],
        summary: 'Update order status or payment status',
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  status: { type: 'string', enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'] },
                  paymentStatus: { type: 'string', enum: ['pending', 'paid', 'failed'] },
                  trackingNumber: { type: 'string', example: 'TRK-987654' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Order status updated' },
        },
      },
    },

    // Admin Products
    '/admin/products': {
      get: {
        tags: ['Admin - Products'],
        summary: 'List all products (including inactive)',
        security: [{ BearerAuth: [] }],
        responses: {
          200: { description: 'All products for admin management' },
        },
      },
      post: {
        tags: ['Admin - Products'],
        summary: 'Create a new product with size variants',
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name', 'price', 'category', 'sizes'],
                properties: {
                  name: { type: 'string', example: 'Arsenal Retro 2003/04 Invincibles' },
                  description: { type: 'string', example: 'Classic red and white jersey.' },
                  price: { type: 'number', example: 85 },
                  salePrice: { type: 'number', example: 70 },
                  category: { type: 'string', description: 'Category ID' },
                  team: { type: 'string', description: 'Team ID' },
                  season: { type: 'string', example: '2003/2004' },
                  isFeatured: { type: 'boolean', default: false },
                  isActive: { type: 'boolean', default: true },
                  tags: { type: 'array', items: { type: 'string' }, example: ['arsenal', 'retro', 'invincibles'] },
                  sizes: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        size: { type: 'string', enum: ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL'] },
                        stock: { type: 'integer', minimum: 0 },
                      },
                    },
                    example: [
                      { size: 'S', stock: 5 },
                      { size: 'M', stock: 12 },
                      { size: 'L', stock: 10 },
                      { size: 'XL', stock: 4 },
                    ],
                  },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Product created successfully' },
        },
      },
    },
    '/admin/products/{id}': {
      put: {
        tags: ['Admin - Products'],
        summary: 'Update product information',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  description: { type: 'string' },
                  price: { type: 'number' },
                  salePrice: { type: 'number' },
                  isFeatured: { type: 'boolean' },
                  isActive: { type: 'boolean' },
                },
              },
            },
          },
        },
        responses: { 200: { description: 'Product updated' } },
      },
      delete: {
        tags: ['Admin - Products'],
        summary: 'Delete a product',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Product deleted' } },
      },
    },
    '/admin/products/{id}/stock': {
      patch: {
        tags: ['Admin - Products'],
        summary: 'Update stock levels for size variants',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['sizes'],
                properties: {
                  sizes: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        size: { type: 'string', enum: ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL'] },
                        stock: { type: 'integer', minimum: 0 },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        responses: { 200: { description: 'Stock updated' } },
      },
    },

    // Admin Categories
    '/admin/categories': {
      get: {
        tags: ['Admin - Categories'],
        summary: 'Get all categories including inactive',
        security: [{ BearerAuth: [] }],
        responses: { 200: { description: 'All categories' } },
      },
      post: {
        tags: ['Admin - Categories'],
        summary: 'Create category (supports multipart image upload or JSON)',
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name'],
                properties: {
                  name: { type: 'string', example: 'Winter Collection' },
                  description: { type: 'string', example: 'Jackets and club survetements' },
                  sortOrder: { type: 'integer', default: 0 },
                  isActive: { type: 'boolean', default: true },
                },
              },
            },
          },
        },
        responses: { 201: { description: 'Category created' } },
      },
    },
    '/admin/categories/{id}': {
      put: {
        tags: ['Admin - Categories'],
        summary: 'Update category',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  description: { type: 'string' },
                  isActive: { type: 'boolean' },
                },
              },
            },
          },
        },
        responses: { 200: { description: 'Category updated' } },
      },
      delete: {
        tags: ['Admin - Categories'],
        summary: 'Delete category',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Category deleted' } },
      },
    },

    // Admin Teams
    '/admin/teams': {
      get: {
        tags: ['Admin - Teams'],
        summary: 'Get all teams for admin management',
        security: [{ BearerAuth: [] }],
        responses: { 200: { description: 'All teams' } },
      },
      post: {
        tags: ['Admin - Teams'],
        summary: 'Create team',
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name', 'type'],
                properties: {
                  name: { type: 'string', example: 'Manchester City' },
                  type: { type: 'string', enum: ['club', 'national'], example: 'club' },
                  league: { type: 'string', example: 'Premier League' },
                  country: { type: 'string', example: 'England' },
                },
              },
            },
          },
        },
        responses: { 201: { description: 'Team created' } },
      },
    },
    '/admin/teams/{id}': {
      put: {
        tags: ['Admin - Teams'],
        summary: 'Update team',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Team updated' } },
      },
      delete: {
        tags: ['Admin - Teams'],
        summary: 'Delete team',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Team deleted' } },
      },
    },

    // Admin Coupons
    '/admin/coupons': {
      get: {
        tags: ['Admin - Coupons'],
        summary: 'Get all coupons',
        security: [{ BearerAuth: [] }],
        responses: { 200: { description: 'List of all coupons' } },
      },
      post: {
        tags: ['Admin - Coupons'],
        summary: 'Create discount coupon',
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['code', 'type', 'value', 'endDate'],
                properties: {
                  code: { type: 'string', example: 'BLACKFRIDAY25' },
                  type: { type: 'string', enum: ['percentage', 'fixed'], example: 'percentage' },
                  value: { type: 'number', example: 25 },
                  minOrderAmount: { type: 'number', default: 0 },
                  maxDiscount: { type: 'number' },
                  endDate: { type: 'string', format: 'date-time', example: '2026-12-31T23:59:59.000Z' },
                  usageLimit: { type: 'integer', default: 100 },
                },
              },
            },
          },
        },
        responses: { 201: { description: 'Coupon created' } },
      },
    },
    '/admin/coupons/{id}': {
      get: {
        tags: ['Admin - Coupons'],
        summary: 'Get coupon by ID',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Coupon details' } },
      },
      put: {
        tags: ['Admin - Coupons'],
        summary: 'Update coupon',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Coupon updated' } },
      },
      delete: {
        tags: ['Admin - Coupons'],
        summary: 'Delete coupon',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Coupon deleted' } },
      },
    },

    // Admin Users
    '/admin/users': {
      get: {
        tags: ['Admin - Users'],
        summary: 'List users with pagination and search',
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: 'role', in: 'query', schema: { type: 'string', enum: ['user', 'admin'] } },
          { name: 'search', in: 'query', schema: { type: 'string' } },
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 20 } },
        ],
        responses: { 200: { description: 'Paginated user list' } },
      },
    },
    '/admin/users/{id}': {
      get: {
        tags: ['Admin - Users'],
        summary: 'Get user details by ID',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'User profile' } },
      },
      patch: {
        tags: ['Admin - Users'],
        summary: 'Update user status or role',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  role: { type: 'string', enum: ['user', 'admin'] },
                  isActive: { type: 'boolean' },
                },
              },
            },
          },
        },
        responses: { 200: { description: 'User updated' } },
      },
      delete: {
        tags: ['Admin - Users'],
        summary: 'Delete user',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'User deleted' } },
      },
    },
  },
};

module.exports = swaggerSpec;
