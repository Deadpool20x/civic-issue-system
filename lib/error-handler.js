/**
 * Comprehensive Error Handling and Prevention System
 * Handles all common errors that can occur in development and production
 */

/**
 * Database connection error handler
 */
export function handleDatabaseError(error) {
  if (error.name === 'MongooseServerSelectionError' || 
      error.name === 'MongoNetworkError' ||
      error.code === 'ECONNREFUSED') {
    return {
      status: 503,
      message: 'Database service unavailable. Please try again later.',
      userMessage: 'Our database is temporarily unavailable. Please check back in a few minutes.',
      shouldRetry: true
    };
  }
  
  if (error.code === 11000) {
    // Duplicate key error
    const field = Object.keys(error.keyPattern)[0];
    return {
      status: 400,
      message: `Duplicate value for ${field}`,
      userMessage: `This ${field} is already in use.`,
      shouldRetry: false
    };
  }
  
  if (error.name === 'ValidationError') {
    const messages = Object.values(error.errors).map(e => e.message);
    return {
      status: 400,
      message: messages.join(', '),
      userMessage: 'Please check your input and try again.',
      shouldRetry: false
    };
  }
  
  return null;
}

/**
 * Authentication error handler
 */
export function handleAuthError(error, context = 'auth') {
  if (error.name === 'JsonWebTokenError') {
    return {
      status: 401,
      message: 'Invalid authentication token',
      userMessage: 'Your session is invalid. Please login again.',
      shouldRetry: false
    };
  }
  
  if (error.name === 'TokenExpiredError') {
    return {
      status: 401,
      message: 'Authentication token expired',
      userMessage: 'Your session has expired. Please login again.',
      shouldRetry: false
    };
  }
  
  return null;
}

/**
 * API error handler wrapper
 */
export function handleAPIError(error, context = 'API') {
  console.error(`[${context}] Error:`, {
    name: error.name,
    message: error.message,
    stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
  });
  
  // Try specific handlers first
  let handledError = handleDatabaseError(error);
  if (handledError) return handledError;
  
  handledError = handleAuthError(error);
  if (handledError) return handledError;
  
  // Generic error handling
  if (error.message && error.message.includes('fetch')) {
    return {
      status: 503,
      message: 'External service unavailable',
      userMessage: 'Unable to connect to external service. Please try again.',
      shouldRetry: true
    };
  }
  
  // Default internal server error
  return {
    status: 500,
    message: 'Internal server error',
    userMessage: 'Something went wrong. Please try again later.',
    shouldRetry: true,
    details: process.env.NODE_ENV === 'development' ? error.message : undefined
  };
}

/**
 * Create standardized error response
 */
export function createErrorResponse(error, context = 'API') {
  const handledError = typeof error === 'string' 
    ? { status: 500, message: error, userMessage: error }
    : handleAPIError(error, context);
    
  return new Response(JSON.stringify({
    error: handledError.userMessage || handledError.message,
    details: handledError.details,
    shouldRetry: handledError.shouldRetry
  }), {
    status: handledError.status,
    headers: { 'Content-Type': 'application/json' }
  });
}

/**
 * Validate environment variables at runtime
 */
export function validateEnvironment(requiredVars = []) {
  const missing = requiredVars.filter(varName => !process.env[varName]);
  
  if (missing.length > 0) {
    const error = new Error(`Missing required environment variables: ${missing.join(', ')}`);
    error.name = 'EnvironmentError';
    throw error;
  }
  
  return true;
}

/**
 * Safe async handler wrapper
 */
export function safeAsync(handler) {
  return async (...args) => {
    try {
      return await handler(...args);
    } catch (error) {
      return createErrorResponse(error, 'AsyncHandler');
    }
  };
}

/**
 * Validate request body with better error messages
 */
export function validateRequestBody(body, schema) {
  try {
    const result = schema.safeParse(body);
    
    if (!result.success) {
      const firstError = result.error.errors[0];
      return {
        valid: false,
        error: {
          field: firstError.path.join('.'),
          message: firstError.message,
          userMessage: `Invalid ${firstError.path.join('.')}: ${firstError.message}`
        }
      };
    }
    
    return { valid: true, data: result.data };
  } catch (error) {
    return {
      valid: false,
      error: {
        field: 'unknown',
        message: error.message,
        userMessage: 'Invalid request format'
      }
    };
  }
}

/**
 * Ensure database is connected before operations
 */
export async function ensureDBConnection() {
  try {
    const { connectDB } = await import('./mongodb.js');
    await connectDB();
    return { connected: true };
  } catch (error) {
    console.error('[DB] Connection failed:', error.message);
    return {
      connected: false,
      error: handleDatabaseError(error)
    };
  }
}

/**
 * Rate limiting helper
 */
const rateLimitMap = new Map();

export function checkRateLimit(identifier, maxRequests = 100, windowMs = 60000) {
  const now = Date.now();
  const userRequests = rateLimitMap.get(identifier) || { count: 0, resetTime: now + windowMs };
  
  // Reset if window expired
  if (now > userRequests.resetTime) {
    userRequests.count = 0;
    userRequests.resetTime = now + windowMs;
  }
  
  userRequests.count++;
  rateLimitMap.set(identifier, userRequests);
  
  if (userRequests.count > maxRequests) {
    return {
      allowed: false,
      resetTime: userRequests.resetTime,
      remaining: 0
    };
  }
  
  return {
    allowed: true,
    remaining: maxRequests - userRequests.count,
    resetTime: userRequests.resetTime
  };
}

/**
 * Clean up rate limit map periodically
 */
if (typeof global !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [key, value] of rateLimitMap.entries()) {
      if (now > value.resetTime) {
        rateLimitMap.delete(key);
      }
    }
  }, 60000);
}
