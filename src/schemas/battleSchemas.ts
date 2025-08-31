import Joi from 'joi';

export const battleRequestSchema = Joi.object({
  character1Id: Joi.string()
    .uuid()
    .required()
    .messages({
      'string.guid': 'Character1Id must be a valid UUID',
      'any.required': 'Character1Id is required'
    }),
  character2Id: Joi.string()
    .uuid()
    .required()
    .messages({
      'string.guid': 'Character2Id must be a valid UUID',
      'any.required': 'Character2Id is required'
    })
}).custom((value, helpers) => {
  if (value.character1Id === value.character2Id) {
    return helpers.error('battle.sameCharacter');
  }
  return value;
}).messages({
  'battle.sameCharacter': 'A character cannot battle against itself'
});