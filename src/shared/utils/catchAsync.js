/**
 * Wraps an async Express route handler to automatically
 * catch rejected promises and forward them to the error middleware.
 *
 * Usage:
 *   router.get('/items', catchAsync(async (req, res) => { ... }));
 *
 * @param {Function} fn - Async route handler
 * @returns {Function} Express middleware
 */
const catchAsync = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = catchAsync;
