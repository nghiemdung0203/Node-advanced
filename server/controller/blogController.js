const {
  createBlogService,
  getBlogListService,
  updateBlogService,
  deleteBlogService,
} = require("../service/blogService");

const createBlogController = async (req, res) => {
  try {
    const newBlog = await createBlogService(req);
    res.status(201).json(newBlog);
  } catch (error) {
    return res.status(500).json(error.message);
  }
};

const getBlogListController = async (req, res) => {
  try {
    const { blogList, page, limit, totalBlog } = await getBlogListService(req);
    const responseData = {
      blogList,
      currentPage: page,
      totalPages: Math.ceil(totalBlog / limit),
    };
    res.status(200).json(responseData);
  } catch (error) {
    return res.status(500).json(error.message);
  }
};

const updateBlogController = async (req, res) => {
  try {
    const updatedBlog = await updateBlogService(req);
    res.status(200).json(updatedBlog);
  } catch (error) {
    return res.status(500).json(error.message);
  }
};

const deleteBlogController = async(req, res) => {
  try {
    const deletedBlog = await deleteBlogService(req);
    res.status(200).json(deletedBlog);
  } catch (error) {
    return res.status(500).json(error.message);
  }
};
module.exports = {
  createBlogController,
  getBlogListController,
  updateBlogController,
  deleteBlogController,
};
