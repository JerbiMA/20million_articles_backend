const express = require('express');
const { authenticate, authorize, validate } = require('../../middlewares');
const { upload } = require('../../config');
const ApiError = require('../../shared/utils/ApiError');

// Controllers
const categoryController = require('../category/category.controller');
const teamController = require('../team/team.controller');
const productController = require('../product/product.controller');
const orderController = require('../order/order.controller');
const userController = require('../user/user.controller');

// Validations
const teamValidation = require('../team/team.validation');
const productValidation = require('../product/product.validation');
const orderValidation = require('../order/order.validation');
const userValidation = require('../user/user.validation');

const router = express.Router();

const normalizeProductMultipart = (req, _res, next) => {
  try {
    ['sizes', 'tags'].forEach((field) => {
      if (typeof req.body[field] === 'string') {
        req.body[field] = JSON.parse(req.body[field]);
      }
    });
    ['isFeatured', 'isActive'].forEach((field) => {
      if (typeof req.body[field] === 'string') {
        req.body[field] = req.body[field] === 'true';
      }
    });
    if (req.body.salePrice === '') {
      delete req.body.salePrice;
    }
    next();
  } catch (error) {
    next(ApiError.badRequest(`Invalid multipart field: ${error.message}`));
  }
};

// ─── All admin routes require authentication + admin role ───
router.use(authenticate);
router.use(authorize('admin'));

// ─── Categories ─────────────────────────────────
router.get('/categories', categoryController.adminGetCategories);

// ─── Teams ──────────────────────────────────────
router.get('/teams', teamController.adminGetTeams);
router.post('/teams', upload.single('logo'), validate(teamValidation.createTeam), teamController.createTeam);
router.put('/teams/:id', upload.single('logo'), validate(teamValidation.updateTeam), teamController.updateTeam);
router.delete('/teams/:id', validate(teamValidation.deleteTeam), teamController.deleteTeam);

// ─── Products ───────────────────────────────────
router.get('/products', productController.adminGetProducts);
router.post(
  '/products',
  upload.array('images', 10),
  normalizeProductMultipart,
  validate(productValidation.createProduct),
  productController.createProduct,
);
router.put('/products/:id', validate(productValidation.updateProduct), productController.updateProduct);
router.post('/products/:id/images', upload.array('images', 10), validate(productValidation.addImages), productController.addImages);
router.delete('/products/:id/images/:imageId', validate(productValidation.removeImage), productController.removeImage);
router.patch('/products/:id/stock', validate(productValidation.updateStock), productController.updateStock);
router.delete('/products/:id', validate(productValidation.deleteProduct), productController.deleteProduct);

// ─── Orders ─────────────────────────────────────
router.get('/orders/stats', orderController.getOrderStats);
router.get('/orders', validate(orderValidation.adminGetOrders), orderController.adminGetOrders);
router.get('/orders/:id', validate(orderValidation.getOrder), orderController.adminGetOrder);
router.patch('/orders/:id/status', validate(orderValidation.updateOrderStatus), orderController.updateOrderStatus);

// ─── Users ──────────────────────────────────────
router.get('/users', validate(userValidation.getUsers), userController.getUsers);
router.get('/users/:id', validate(userValidation.getUser), userController.getUser);
router.patch('/users/:id', validate(userValidation.updateUser), userController.updateUser);
router.delete('/users/:id', validate(userValidation.deleteUser), userController.deleteUser);

module.exports = router;
