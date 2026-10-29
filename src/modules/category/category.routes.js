const express = require('express');
const categoryController = require('./category.controller');
const categoryValidation = require('./category.validation');
const { validate } = require('../../middlewares');

const router = express.Router();

/**
 * Public Category Routes
 *
 * GET /api/v1/categories              → Get all active categories
 * GET /api/v1/categories/:identifier  → Get category by ID or slug
 */

router.get('/', categoryController.getCategories);
router.get('/:identifier', validate(categoryValidation.getCategory), categoryController.getCategory);

module.exports = router;
