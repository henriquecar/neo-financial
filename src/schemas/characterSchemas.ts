import Joi from 'joi';

export const createCharacterSchema = Joi.object({
  name: Joi.string()
    .min(4)
    .max(15)
    .pattern(/^[a-zA-Z_]+$/)
    .required()
    .messages({
      'string.min': 'Name must be between 4 and 15 characters inclusive',
      'string.max': 'Name must be between 4 and 15 characters inclusive',
      'string.pattern.base':
        'Name must contain only letters (a-z, A-Z) or underscore (_) characters',
      'any.required': 'Name is required',
    }),
  job: Joi.string().valid('Warrior', 'Thief', 'Mage').required().messages({
    'any.only': 'Job must be one of: Warrior, Thief, Mage',
    'any.required': 'Job is required',
  }),
});

export const paginationSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
}).options({ allowUnknown: true, stripUnknown: true });

export const characterIdSchema = Joi.string().required().messages({
  'string.empty': 'ID cannot be empty',
  'any.required': 'ID is required',
});

export const characterIdParamsSchema = Joi.object({
  id: characterIdSchema,
});
