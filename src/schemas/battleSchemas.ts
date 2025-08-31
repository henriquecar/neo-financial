import Joi from 'joi';

export const battleRequestSchema = Joi.object({
  character1Id: Joi.string()
    .required()
    .messages({
      'string.empty': 'Character1Id cannot be empty',
      'any.required': 'Character1Id is required'
    }),
  character2Id: Joi.string()
    .required()
    .messages({
      'string.empty': 'Character2Id cannot be empty',
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