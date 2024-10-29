const Joi = require("joi");
const mongoose = require("mongoose");

const blogValidation = Joi.object({
  title: Joi.string().required().trim().min(5).max(200).messages({
    "string.base": "Title must be a string.",
    "string.empty": "Title is required.",
    "string.min": "Title must be at least 5 characters long.",
    "string.max": "Title must be at most 200 characters long.",
  }),
  content: Joi.string().required().trim().min(15).max(5000).messages({
    "string.base": "Content must be a string.",
    "string.empty": "Content is required.",
    "string.min": "Content must be at least 15 characters long.",
    "string.max": "Content must be at most 5000 characters long.",
  }),
  author: Joi.string().required().trim().messages({
    "string.base": "Author must be trim object string.",
    "string.empty": "Author is required.",
  }),
  views: Joi.number().min(0).messages({
    "number.base": "Views must be a number.",
    "number.min": "Views must be at least 0.",
  }),
  likes: Joi.number().min(0).messages({
    "number.base": "Likes must be a number.",
    "number.min": "Likes must be at least 0.",
  }),
});

const paginationValidation = Joi.object({
  page: Joi.number().integer().min(1).optional().default(1).messages({
    "number.base": "Page must be a number.",
    "number.integer": "Page must be an integer.",
    "number.min": "Page must be at least 1.",
  }),

  limit: Joi.number().integer().min(1).optional().default(10).messages({
    "number.base": "Limit must be a number.",
    "number.integer": "Limit must be an integer.",
    "number.min": "Limit must be at least 1.",
  }),
});

const updateValidation = Joi.object({
  title: Joi.string().trim().optional().min(5).max(200).messages({
    "string.base": "Title must be a string.",
    "string.min": "Title must be at least 5 characters long.",
    "string.max": "Title must be at most 200 characters long.",
  }),
  content: Joi.string().trim().optional().min(15).max(5000).messages({
    "string.base": "Content must be a string.",
    "string.min": "Content must be at least 15 characters long.",
    "string.max": "Content must be at most 5000 characters long.",
  }),
}).or('title', 'content')

const blogIdValidation = Joi.object({
  blogId: Joi.string()
    .required()
    .custom((value, helpers) => {
      if (!mongoose.Types.ObjectId.isValid(value)) {
        return helpers.messages("Invalid blog ID format.");
      }
      return value;
    }).messages({
        "string.base": "Blog ID must be a string.",
        "string.empty": "Blog ID is required.",
    })
});

module.exports = { blogValidation, paginationValidation, updateValidation, blogIdValidation };
