/**
 * Centralized error handling utilities for the Civic Issue System
 */

/**
 * Standard error response format
 * @param {string} message - Error message
 * @param {number} status - HTTP status code
 * @param {object} details - Additional error details
 * @returns {Response} Formatted error response
 */
export function createErrorResponse(message, status = 500, details = null) {
  const errorData = { error: message };
  if (details && process.env.NODE_ENV === 'development') {
    errorData.details = details;
  }

  return new Response(JSON.stringify(errorData), {
    status,
    headers: { 'Content-Type': 'application/json' }
  });
}

/**
 * Validates required fields in request data
 * @param {object} data - Data to validate
 * @param {string[]} requiredFields - Array of required field names
 * @returns {object|null} Validation error or null if valid
 */
export function validateRequiredFields(data, requiredFields) {
  const missing = requiredFields.filter(field => !data[field]);
  if (missing.length > 0) {
    return createErrorResponse(
      `Missing required fields: ${missing.join(', ')}`,
      400
    );
  }
  return null;
}

/**
 * Sanitizes string input to prevent XSS
 * @param {string} input - Input string to sanitize
 * @returns {string} Sanitized string
 */
export function sanitizeString(input) {
  if (typeof input !== 'string') return '';
  return input
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .trim()
    .substring(0, 1000); // Limit length
}

/**
 * Validates email format
 * @param {string} email - Email to validate
 * @returns {boolean} True if valid email format
 */
export function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validates priority levels
 * @param {string} priority - Priority to validate
 * @returns {boolean} True if valid priority
 */
export function isValidPriority(priority) {
  const validPriorities = ['low', 'medium', 'high', 'urgent'];
  return validPriorities.includes(priority);
}

/**
 * Validates issue categories
 * @param {string} category - Category to validate
 * @returns {boolean} True if valid category
 */
export function isValidCategory(category) {
  const validCategories = ['water', 'electricity', 'roads', 'garbage', 'parks', 'other'];
  return validCategories.includes(category);
}

/**
 * Validates issue status
 * @param {string} status - Status to validate
 * @returns {boolean} True if valid status
 */
export function isValidStatus(status) {
  const validStatuses = ['pending', 'assigned', 'in-progress', 'resolved', 'rejected', 'reopened', 'escalated'];
  return validStatuses.includes(status);
}

/**
 * Enhanced error handler for API routes
 * @param {Function} handler - API handler function
 * @returns {Function} Enhanced handler with error handling
 */
export function withErrorHandler(handler) {
  return async (req, ...args) => {
    try {
      return await handler(req, ...args);
    } catch (error) {
      console.error('API Error:', {
        name: error.name,
        message: error.message,
        stack: error.stack,
        url: req.url,
        method: req.method
      });

      return createErrorResponse(
        'Internal server error',
        500,
        process.env.NODE_ENV === 'development' ? error.message : undefined
      );
    }
  };
}

/**
 * Enhanced auth middleware with better error handling
 * @param {Function} handler - Handler function to protect
 * @returns {Function} Protected handler
 */
export function withAuth(handler) {
  return withErrorHandler(async (req, ...args) => {
    const { getTokenData } = await import('./auth.js');
    const userData = await getTokenData();

    if (!userData) {
      return createErrorResponse('Unauthorized', 401);
    }

    req.user = userData;
    return handler(req, ...args);
  });
}

/**
 * Role-based auth middleware
 * @param {string[]} allowedRoles - Array of allowed roles
 * @returns {Function} Middleware function
 */
export function withRoleAuth(allowedRoles) {
  return (handler) => {
    return withAuth(async (req, ...args) => {
      if (!allowedRoles.includes(req.user.role)) {
        return createErrorResponse('Insufficient permissions', 403);
      }
      return handler(req, ...args);
    });
  };
}

/**
 * Input validation middleware
 * @param {object} validationSchema - Schema defining required fields and validators
 * @returns {Function} Validation middleware
 */
export function withValidation(validationSchema) {
  return (handler) => {
    return withErrorHandler(async (req, ...args) => {
      let body;
      try {
        body = await req.json();
      } catch (error) {
        return createErrorResponse('Invalid JSON body', 400);
      }

      // Validate required fields
      const requiredError = validateRequiredFields(body, validationSchema.required || []);
      if (requiredError) return requiredError;

      // Apply custom validators
      if (validationSchema.validators) {
        for (const [field, validator] of Object.entries(validationSchema.validators)) {
          if (body[field] !== undefined && !validator(body[field])) {
            return createErrorResponse(`Invalid ${field}`, 400);
          }
        }
      }

      req.validatedBody = body;
      return handler(req, ...args);
    });
  };
}
