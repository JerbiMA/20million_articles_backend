const userController = require('./user.controller');
const userService = require('./user.service');
const userModel = require('./user.model');
const userRoutes = require('./user.routes');
const userValidation = require('./user.validation');

module.exports = {
  userController,
  userService,
  User: userModel,
  userRoutes,
  userValidation,
};
