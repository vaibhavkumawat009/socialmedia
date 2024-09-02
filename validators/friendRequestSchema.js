const Joi = require('joi');

const userSchema = Joi.object({
    receiverUserId: Joi.string().required(),
});

module.exports = { userSchema };
