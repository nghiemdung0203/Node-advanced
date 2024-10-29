const {
  createBlogController,
  getBlogListController,
  updateBlogController,
  deleteBlogController,
} = require("../controller/blogController");
const authenticate = require("../middleware/authenticate");
const authenticateAccessBlog = require("../middleware/authenticateAccessBlog");

const router = require("express").Router();

router.post("/createBlog", authenticate, createBlogController);
router.get("/getBlogList", getBlogListController);
router.put("/updateBlog", authenticateAccessBlog, updateBlogController);
router.delete("/deleteBlog", authenticateAccessBlog, deleteBlogController);
module.exports = router;
