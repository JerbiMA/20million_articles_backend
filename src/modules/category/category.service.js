const Category = require('./category.model');
const { ApiError } = require('../../shared/utils');
const { PAGINATION } = require('../../shared/constants');
const { deleteImage, getPublicIdFromUrl } = require('../../config');

const categoryService = {
  /**
   * Get all categories (with optional filters).
   */
  async getCategories({ page = PAGINATION.DEFAULT_PAGE, limit = PAGINATION.DEFAULT_LIMIT, isActive, search } = {}) {
    const filter = {};
    if (isActive !== undefined) {
      filter.isActive = isActive;
    }
    if (search) {
      filter.name = { $regex: search, $options: 'i' };
    }

    const safePage = Math.max(1, parseInt(page, 10));
    const safeLimit = Math.min(parseInt(limit, 10), PAGINATION.MAX_LIMIT);
    const skip = (safePage - 1) * safeLimit;

    const [categories, total] = await Promise.all([
      Category.find(filter)
        .sort({ sortOrder: 1, name: 1 })
        .skip(skip)
        .limit(safeLimit)
        .populate('productCount')
        .lean({ virtuals: true }),
      Category.countDocuments(filter),
    ]);

    return {
      categories,
      pagination: { page: safePage, limit: safeLimit, total, pages: Math.ceil(total / safeLimit) },
    };
  },

  /**
   * Get all active categories (public, no pagination — for frontend nav).
   */
  async getActiveCategories() {
    return Category.find({ isActive: true })
      .sort({ sortOrder: 1, name: 1 })
      .populate('productCount')
      .lean({ virtuals: true });
  },

  /**
   * Get a single category by ID or slug.
   */
  async getCategoryByIdOrSlug(identifier) {
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(identifier);
    const filter = isObjectId ? { _id: identifier } : { slug: identifier };

    const category = await Category.findOne(filter)
      .populate('productCount')
      .lean({ virtuals: true });

    if (!category) {
      throw ApiError.notFound('Category not found');
    }
    return category;
  },

  /**
   * Create a new category.
   */
  async createCategory(data) {
    const existing = await Category.findOne({ name: data.name });
    if (existing) {
      throw ApiError.conflict('A category with this name already exists');
    }
    return Category.create(data);
  },

  /**
   * Update a category.
   */
  async updateCategory(categoryId, updateData) {
    if (updateData.name) {
      const existing = await Category.findOne({ name: updateData.name, _id: { $ne: categoryId } });
      if (existing) {
        throw ApiError.conflict('A category with this name already exists');
      }
    }

    const category = await Category.findByIdAndUpdate(categoryId, updateData, {
      new: true,
      runValidators: true,
    });

    if (!category) {
      throw ApiError.notFound('Category not found');
    }
    return category;
  },

  /**
   * Delete a category.
   */
  async deleteCategory(categoryId) {
    const category = await Category.findById(categoryId);
    if (!category) {
      throw ApiError.notFound('Category not found');
    }

    // Clean up Cloudinary image
    if (category.image?.publicId) {
      await deleteImage(category.image.publicId);
    }

    await Category.findByIdAndDelete(categoryId);
    return category;
  },
};

module.exports = categoryService;
