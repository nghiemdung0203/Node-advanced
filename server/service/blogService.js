const {
  blogValidation,
  blogIdValidation,
  updateValidation,
  paginationValidation,
} = require("../middleware/validation/blogValidation");
const {
  userIdValidationSchema,
} = require("../middleware/validation/userValidation");
const Blog = require("../model/Blog");

const createBlogService = async (req) => {
  const userId = req.user._id;
  const { error } = blogValidation.validate({
    ...req.body,
    author: userId.toString(),
  });
  if (error) {
    throw new Error(error.details[0].message);
  }
  try {
    const newBlog = new Blog({ author: userId, ...req.body });
    await newBlog.save();
    await newBlog.populate("author");
    return newBlog;
  } catch (error) {
    throw new Error(error.message);
  }
};

const getBlogListService = async (req) => {
  const page = parseInt(req.query.page);
  const limit = parseInt(req.query.limit);
  
  const { error } = paginationValidation.validate({
    page,
    limit,
  });
  if (error) {
    throw new Error(error.details[0].message);
  }

  const totalBlog = await Blog.countDocuments();
  try {
    const skip = (page - 1) * limit;
    const blogList = await Blog.find()
      .populate("author")
      .limit(limit)
      .skip(skip)
      .exec();
    return {
      blogList,
      totalBlog,
      page,
      limit,
    };
  } catch (error) {
    throw new Error(error.message);
  }
};

const updateBlogService = async (req, res) => {
  const userId = req.user._id.toString();
  const { error: userIdError } = userIdValidationSchema.validate({ userId });
  if (userIdError) {
    throw new Error(userIdError.details[0].message);
  }

  const blogId = req.query.blogId;
  const { error: blogIdError } = blogIdValidation.validate({ blogId });
  if (blogIdError) {
    throw new Error(blogIdError.details[0].message);
  }

  const payload = {
    title: req.body.title,
    content: req.body.content,
  };

  const { error: bodyError } = updateValidation.validate(payload);
  if (bodyError) {
    throw new Error(bodyError.details[0].message);
  }
  try {
    const blog = await Blog.findByIdAndUpdate(
      { _id: blogId, author: userId },
      { $set: payload },
      { new: true }
    )
      .populate("author")
      .exec();
    return blog;
  } catch (error) {
    throw new Error(error.message);
  }
};

const deleteBlogService = async (req, res) => {
  const userId = req.user._id.toString();
  const { error: userIdError } = userIdValidationSchema.validate({ userId });
  if (userIdError) {
    throw new Error(userIdError.details[0].message);
  }
  const blogId = req.query.blogId;
  const { error: blogError } = blogIdValidation.validate({ blogId });
  if (blogError) {
    throw new Error(blogError.details[0].message);
  }
  try {
    const deleteBlog = await Blog.findByIdAndDelete({
      _id: blogId,
      author: userId,
    });
    if (!deleteBlog) {
      throw new Error("Unauthorized");
    }
    return "Delete Blog";
  } catch (error) {
    throw new Error(error.message);
  }
};

module.exports = {
  createBlogService,
  getBlogListService,
  updateBlogService,
  deleteBlogService,
};
