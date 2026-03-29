/**
 * Centralized API response utility.
 * Every single response in the app goes through these helpers.
 *
 * Success shape: { success: true,  message: "...", data: {...} }
 * Error shape:   { success: false, message: "...", error: "..." }
 */

/**
 * Sends a successful JSON response.
 * @param {import('express').Response} res
 * @param {string} message
 * @param {object|null} data
 * @param {number} statusCode
 */
const sendSuccess = (res, message, data = null, statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

/**
 * Sends an error JSON response.
 * @param {import('express').Response} res
 * @param {string} message
 * @param {number} statusCode
 * @param {string|null} error — safe, non-sensitive error detail
 */
const sendError = (res, message, statusCode = 500, error = null) => {
  return res.status(statusCode).json({
    success: false,
    message,
    error,
  });
};

module.exports = { sendSuccess, sendError };
