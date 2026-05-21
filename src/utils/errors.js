class AppError extends Error {
  constructor(statusCode, code, message, details = {}) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
  }
}

const badRequest = (message, details) => new AppError(400, 'BAD_REQUEST', message, details);
const unauthorized = (message = 'Unauthorized') => new AppError(401, 'UNAUTHORIZED', message);
const forbidden = (message = 'Forbidden') => new AppError(403, 'FORBIDDEN', message);
const notFound = (message = 'Resource not found') => new AppError(404, 'NOT_FOUND', message);
const conflict = (message, details) => new AppError(409, 'CONFLICT', message, details);
const validation = (details) => new AppError(422, 'VALIDATION_ERROR', 'Invalid request data', details);

module.exports = { AppError, badRequest, unauthorized, forbidden, notFound, conflict, validation };
