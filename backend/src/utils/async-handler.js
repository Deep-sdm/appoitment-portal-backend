/**
 * Async Handler Middleware Wrapper
 * Wraps asynchronous controller functions and automatically forwards unhandled errors to Express error middleware
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;
