const Joi = require("joi");
const mongoose = require("mongoose");

const signupValidation = Joi.object({
  name: Joi.string().required().trim().messages({
    "string.base": "Name must be a string",
    "string.empty": "Name is required",
  }),
  email: Joi.string().email().required().trim().messages({
    "string.email": "Invalid email address",
    "string.empty": "Email is required",
  }),
  password: Joi.string()
    .required()
    .trim()
    .custom((value, helpers) => {
      const strongPasswordCriteria =
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
      if (!strongPasswordCriteria.test(value)) {
        return helpers.message(
          "Password must contain at least 8 characters, with at least one uppercase letter, one lowercase letter, one number, and one special character."
        );
      }
      return value;
    })
    .messages({
      "string.empty": "Password is required.",
    }),
  role: Joi.string().optional().default("user").messages({
    "string.base": "Role must be a string",
  }),
});

const siginValidation = Joi.object({
  email: Joi.string().email().required().trim().messages({
    "string.email": "Invalid email address",
    "string.empty": "Email is required",
  }),
  password: Joi.string()
   .required()
   .trim()
   .custom((value, helpers) => {
      const strongPasswordCriteria =
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
      if (!strongPasswordCriteria.test(value)) {
        return helpers.message(
          "Password must contain at least 8 characters, with at least one uppercase letter, one lowercase letter, one number, and one special character."
        );
      }
      return value;
    })
   .messages({
      "string.empty": "Password is required.",
    }),
})

const updateUserValidation = Joi.object({
  name: Joi.string().trim().optional().min(3).max(50).messages({
    "string.base": "Name must be a string.",
    "string.empty": "Name is required.",
    "string.min": "Name must be at least 3 characters long.",
    "string.max": "Name must be at most 50 characters long.",
  }),

  password: Joi.string()
    .optional()
    .custom((value, helpers) => {
      const strongPasswordCriteria =
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
      if (!strongPasswordCriteria.test(value)) {
        return helpers.message(
          "Password must contain at least 8 characters, with at least one uppercase letter, one lowercase letter, one number, and one special character."
        );
      }
      return value;
    })
    .messages({
      "string.empty": "Password is required.",
    }),
})
  .min(1)
  .messages({
    "object.min": "At least one field is required to update.",
  });

const userIdValidationSchema = Joi.object({
  userId: Joi.string()
    .required()
    .custom((value, helpers) => {
      if (!mongoose.Types.ObjectId.isValid(value)) {
        return helpers.message("Invalid user ID format.");
      }
      return value;
    })
    .message({
      "string.empty": "User ID is required.",
      "string.base": "User ID must be a string.",
    }),
});

module.exports = {
  signupValidation,
  siginValidation,
  updateUserValidation,
  userIdValidationSchema,
};
