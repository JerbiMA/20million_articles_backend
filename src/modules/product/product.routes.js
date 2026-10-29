const express = require('express');
const productController = require('./product.controller');
const productValidation = require('./product.validation');
const { validate } = require('../../middlewares');

const router = express.Router();

/**
 * Public Product Routes
 *
 * GET /api/v1/products             → List products (with filters)
 * GET /api/v1/products/featured    → Featured products
 * GET /api/v1/products/:identifier → Get product by ID or slug
 * GET /api/v1/products/:id/related → Get related products
 */

router.get('/', validate(productValidation.getProducts), productController.getProducts);
router.get('/featured', productController.getFeaturedProducts);
router.get('/:identifier', validate(productValidation.getProduct), productController.getProduct);
router.get('/:id/related', productController.getRelatedProducts);

module.exports = router;
