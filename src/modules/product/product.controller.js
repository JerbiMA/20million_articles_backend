const productService = require('./product.service');
const { ApiResponse, catchAsync } = require('../../shared/utils');

const productController = {
  // ─── Public ───────────────────────────────────

  /**
   * GET /api/v1/products
   */
  getProducts: catchAsync(async (req, res) => {
    const result = await productService.getProducts(req.query);
    ApiResponse.ok(res, 'Products retrieved', result.products, result.pagination);
  }),

  /**
   * GET /api/v1/products/featured
   */
  getFeaturedProducts: catchAsync(async (req, res) => {
    const limit = parseInt(req.query.limit, 10) || 8;
    const products = await productService.getFeaturedProducts(limit);
    ApiResponse.ok(res, 'Featured products retrieved', products);
  }),

  /**
   * GET /api/v1/products/:identifier
   */
  getProduct: catchAsync(async (req, res) => {
    const product = await productService.getProductByIdOrSlug(req.params.identifier);
    ApiResponse.ok(res, 'Product retrieved', product);
  }),

  /**
   * GET /api/v1/products/:id/related
   */
  getRelatedProducts: catchAsync(async (req, res) => {
    const limit = parseInt(req.query.limit, 10) || 4;
    const products = await productService.getRelatedProducts(req.params.id, limit);
    ApiResponse.ok(res, 'Related products retrieved', products);
  }),

  // ─── Admin ────────────────────────────────────

  /**
   * GET /api/v1/admin/products
   */
  adminGetProducts: catchAsync(async (req, res) => {
    const result = await productService.getProducts({ ...req.query, isActive: req.query.isActive });
    ApiResponse.ok(res, 'Products retrieved', result.products, result.pagination);
  }),

  /**
   * POST /api/v1/admin/products
   */
  createProduct: catchAsync(async (req, res) => {
    const data = { ...req.body };

    // Parse sizes if sent as JSON string
    if (typeof data.sizes === 'string') {
      data.sizes = JSON.parse(data.sizes);
    }
    if (typeof data.tags === 'string') {
      data.tags = JSON.parse(data.tags);
    }

    // Handle uploaded images
    if (req.files && req.files.length > 0) {
      data.images = req.files.map((file, index) => ({
        url: file.path,
        publicId: file.filename,
        isMain: index === 0,
      }));
    }

    const product = await productService.createProduct(data);
    ApiResponse.created(res, 'Product created', product);
  }),

  /**
   * PUT /api/v1/admin/products/:id
   */
  updateProduct: catchAsync(async (req, res) => {
    const data = { ...req.body };

    if (typeof data.sizes === 'string') {
      data.sizes = JSON.parse(data.sizes);
    }
    if (typeof data.tags === 'string') {
      data.tags = JSON.parse(data.tags);
    }

    const product = await productService.updateProduct(req.params.id, data);
    ApiResponse.ok(res, 'Product updated', product);
  }),

  /**
   * POST /api/v1/admin/products/:id/images
   */
  addImages: catchAsync(async (req, res) => {
    if (!req.files || req.files.length === 0) {
      return ApiResponse.ok(res, 'No images uploaded');
    }

    const images = req.files.map((file) => ({
      url: file.path,
      publicId: file.filename,
      isMain: false,
    }));

    const product = await productService.addImages(req.params.id, images);
    ApiResponse.ok(res, 'Images added', product);
  }),

  /**
   * DELETE /api/v1/admin/products/:id/images/:imageId
   */
  removeImage: catchAsync(async (req, res) => {
    const product = await productService.removeImage(req.params.id, req.params.imageId);
    ApiResponse.ok(res, 'Image removed', product);
  }),

  /**
   * PATCH /api/v1/admin/products/:id/stock
   */
  updateStock: catchAsync(async (req, res) => {
    const { size, stock } = req.body;
    const product = await productService.updateStock(req.params.id, size, stock);
    ApiResponse.ok(res, 'Stock updated', product);
  }),

  /**
   * DELETE /api/v1/admin/products/:id
   */
  deleteProduct: catchAsync(async (req, res) => {
    await productService.deleteProduct(req.params.id);
    ApiResponse.ok(res, 'Product deleted');
  }),
};

module.exports = productController;
