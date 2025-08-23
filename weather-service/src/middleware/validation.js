const Joi = require('joi');

/**
 * Middleware to validate request data using Joi schemas
 */
function validateRequest(schema, property = 'body') {
  return (req, res, next) => {
    const data = req[property];
    
    const { error, value } = schema.validate(data, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const errorMessage = error.details.map(detail => detail.message).join(', ');
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        message: errorMessage,
        details: error.details
      });
    }

    // Replace request data with validated data
    req[property] = value;
    next();
  };
}

module.exports = {
  validateRequest
};
