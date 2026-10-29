/**
 * HTTP status code constants for readable code.
 */
const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE: 422,
  TOO_MANY: 429,
  INTERNAL: 500,
};

/**
 * User roles for RBAC (Role-Based Access Control).
 */
const ROLES = {
  USER: 'user',
  ADMIN: 'admin',
};

/**
 * Pagination defaults.
 */
const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
};

/**
 * Available product sizes.
 */
const SIZES = ['S', 'M', 'L', 'XL', 'XXL'];

/**
 * Order statuses.
 */
const ORDER_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  PROCESSING: 'processing',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
};

/**
 * Coupon types.
 */
const COUPON_TYPE = {
  PERCENTAGE: 'percentage',
  FIXED: 'fixed',
};

module.exports = {
  HTTP_STATUS,
  ROLES,
  PAGINATION,
  SIZES,
  ORDER_STATUS,
  COUPON_TYPE,
};
