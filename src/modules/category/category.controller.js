const categoryService = require('./category.service');
const { ApiResponse, catchAsync } = require('../../shared/utils');

const categoryController = {
  /**
   * GET /api/v1/categories
   * Public: get active categories for frontend navigation.
   */
  getCategories: catchAsync(async (_req, res) => {
    const categories = await categoryService.getActiveCategories();
    ApiResponse.ok(res, 'Categories retrieved', categories);
  }),

  /**
   * GET /api/v1/categories/:identifier
   * Public: get a category by ID or slug.
   */
  getCategory: catchAsync(async (req, res) => {
    const category = await categoryService.getCategoryByIdOrSlug(req.params.identifier);
    ApiResponse.ok(res, 'Category retrieved', category);
  }),

  // ─── Admin ────────────────────────────────────

  /**
   * GET /api/v1/admin/categories
   * Admin: paginated list with filters.
   */
  adminGetCategories: catchAsync(async (req, res) => {
    const result = await categoryService.getCategories(req.query);
    ApiResponse.ok(res, 'Categories retrieved', result.categories, result.pagination);
  }),

  /**
   * POST /api/v1/admin/categories
   */
  createCategory: catchAsync(async (req, res) => {
    const data = { ...req.body };

    if (req.file) {
      data.image = { url: req.file.path, publicId: req.file.filename };
    }

    const category = await categoryService.createCategory(data);
    ApiResponse.created(res, 'Category created', category);
  }),

  /**
   * PUT /api/v1/admin/categories/:id
   */
  updateCategory: catchAsync(async (req, res) => {
    const data = { ...req.body };

    if (req.file) {
      data.image = { url: req.file.path, publicId: req.file.filename };
    }

    const category = await categoryService.updateCategory(req.params.id, data);
    ApiResponse.ok(res, 'Category updated', category);
  }),

  /**
   * DELETE /api/v1/admin/categories/:id
   */
  deleteCategory: catchAsync(async (req, res) => {
    await categoryService.deleteCategory(req.params.id);
    ApiResponse.ok(res, 'Category deleted');
  }),
};

module.exports = categoryController;
