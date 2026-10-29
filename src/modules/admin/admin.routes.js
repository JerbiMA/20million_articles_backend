const express = require('express');
const { authenticate, authorize, validate } = require('../../middlewares');
const { upload } = require('../../config');

// Controllers
const categoryController = require('../category/category.controller');
const teamController = require('../team/team.controller');
const productController = require('../product/product.controller');
const orderController = require('../order/order.controller');
const couponController = require('../coupon/coupon.controller');
const userController = require('../user/user.controller');

// Validations
const categoryValidation = require('../category/category.validation');
const teamValidation = require('../team/team.validation');
const productValidation = require('../product/product.validation');
const orderValidation = require('../order/order.validation');
const couponValidation = require('../coupon/coupon.validation');
const userValidation = require('../user/user.validation');

const router = express.Router();

// ─── All admin routes require authentication + admin role ───
router.use(authenticate);
router.use(authorize('admin'));

// ─── Categories ─────────────────────────────────
router.get('/categories', categoryController.adminGetCategories);
router.post('/categories', upload.single('image'), validate(categoryValidation.createCategory), categoryController.createCategory);
router.put('/categories/:id', upload.single('image'), validate(categoryValidation.updateCategory), categoryController.updateCategory);
router.delete('/categories/:id', validate(categoryValidation.deleteCategory), categoryController.deleteCategory);

// ─── Teams ──────────────────────────────────────
router.get('/teams', teamController.adminGetTeams);
router.post('/teams', upload.single('logo'), validate(teamValidation.createTeam), teamController.createTeam);
router.put('/teams/:id', upload.single('logo'), validate(teamValidation.updateTeam), teamController.updateTeam);
router.delete('/teams/:id', validate(teamValidation.deleteTeam), teamController.deleteTeam);

// ─── Products ───────────────────────────────────
router.get('/products', productController.adminGetProducts);
router.post('/products', upload.array('images', 10), validate(productValidation.createProduct), productController.createProduct);
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

// ─── Coupons ────────────────────────────────────
router.get('/coupons', couponController.getCoupons);
router.get('/coupons/:id', validate(couponValidation.getCoupon), couponController.getCoupon);
router.post('/coupons', validate(couponValidation.createCoupon), couponController.createCoupon);
router.put('/coupons/:id', validate(couponValidation.updateCoupon), couponController.updateCoupon);
router.delete('/coupons/:id', validate(couponValidation.deleteCoupon), couponController.deleteCoupon);

// ─── Users ──────────────────────────────────────
router.get('/users', validate(userValidation.getUsers), userController.getUsers);
router.get('/users/:id', validate(userValidation.getUser), userController.getUser);
router.patch('/users/:id', validate(userValidation.updateUser), userController.updateUser);
router.delete('/users/:id', validate(userValidation.deleteUser), userController.deleteUser);

module.exports = router;
