/**
 * Standardized API response wrapper.
 * Every successful response uses this shape for frontend consistency.
 */
class ApiResponse {
  /**
   * @param {number} statusCode - HTTP status code
   * @param {string} message - Human-readable message
   * @param {*} [data=null] - Response payload
   * @param {object} [meta={}] - Pagination, counts, etc.
   */
  constructor(statusCode, message, data = null, meta = {}) {
    this.success = statusCode < 400;
    this.statusCode = statusCode;
    this.message = message;
    this.data = data;
    this.meta = Object.keys(meta).length > 0 ? meta : undefined;
  }

  /**
   * Send the response through Express's res object.
   * @param {import('express').Response} res
   */
  send(res) {
    return res.status(this.statusCode).json({
      success: this.success,
      message: this.message,
      data: this.data,
      ...(this.meta && { meta: this.meta }),
    });
  }

  // ── Factory methods ──────────────────────────
  static ok(res, message = 'Success', data = null, meta = {}) {
    return new ApiResponse(200, message, data, meta).send(res);
  }

  static created(res, message = 'Resource created', data = null) {
    return new ApiResponse(201, message, data).send(res);
  }

  static noContent(res) {
    return res.status(204).send();
  }
}

module.exports = ApiResponse;
