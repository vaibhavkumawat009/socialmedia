const Joi = require('joi');

const userSchema = Joi.object({
    firstName: Joi.string().min(3).max(30).required(),
    lastName: Joi.string().min(3).max(30).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(3).max(15).required(),
    phone:Joi.string().length(10).required(),
    confirmPassword: Joi.any().valid(Joi.ref('password')).required()
        .messages({
            'any.only': 'Password and confirm password do not match'
        }),
    friendsList:Joi.array().unique().optional(),
    friendRequestsSent:Joi.array().unique().optional(),
    friendRequestsReceived:Joi.array().unique().optional(),
});

module.exports = { userSchema };
