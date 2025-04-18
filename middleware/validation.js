const Joi = require('joi');
const logger = require('../utils/logger');

// Task validation schema
const taskSchema = Joi.object({
  title: Joi.string().trim().required().min(3).max(100),
  description: Joi.string().trim().allow('').max(500),
  status: Joi.string().valid('pending', 'in_progress', 'completed', 'overdue'),
  priority: Joi.string().valid('low', 'medium', 'high'),
  startDate: Joi.date().iso().required(),
  dueDate: Joi.date().iso().min(Joi.ref('startDate')).required()
    .messages({
      'date.min': 'Due date must be after or equal to start date'
    }),
  dependsOn: Joi.array().items(Joi.string().regex(/^[0-9a-fA-F]{24}$/))
});

// Middleware to validate task data
exports.validateTask = (req, res, next) => {
  // Skip validation for PATCH requests (partial updates)
  if (req.method === 'PATCH') {
    return next();
  }
  
  const { error } = taskSchema.validate(req.body, { abortEarly: false });
  
  if (error) {
    const errorMessage = error.details.map(detail => detail.message).join('; ');
    logger.error(`Validation error: ${errorMessage}`);
    return res.status(400).json({ error: errorMessage });
  }
  
  next();
};