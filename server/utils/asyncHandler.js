/**
 * Wraps an async Express route handler and forwards any errors to the next()
 * error-handling middleware instead of crashing the server.
 *
 * Usage:  export const myHandler = asyncHandler(async (req, res) => { ... });
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

export default asyncHandler;
