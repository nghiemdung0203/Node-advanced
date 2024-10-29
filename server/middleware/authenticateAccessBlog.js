const Blog = require("../model/Blog");
const User = require("../model/User");
const jwt = require("jsonwebtoken");

const authenticateAccessBlog = async (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const refreshToken = req.headers["x-refresh-token"];

  // Check if authorization header exists
  if (!authHeader) {
    return res
      .status(401)
      .send({ error: "No token provided, authorization denied." });
  }

  const accessToken = authHeader.replace("Bearer ", "");

  if (!refreshToken) {
    return res.status(401).send({ error: "No refresh token provided." });
  }

  try {
    const data = jwt.verify(accessToken, process.env.JWT_ACCESS_SECRET);
    const user = await User.findById(data._id);
    if (!user) {
      return res
        .status(401)
        .send({ error: "Not authorized to access this resource." });
    }
    const blogId = req.query.blogId;
    const blog = await Blog.findById({ _id: blogId }).populate("author").exec();
    if (!blog) {
      return res.status(404).send({ error: "Blog not found." });
    }

    if (blog.author._id.toString() !== user._id.toString()) {
      return res
        .status(403)
        .send({ error: "You are not authorized to update this blog." });
    }
    req.user = {
      _id: user._id,
      token: accessToken,
    };
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError" && refreshToken) {
      try {
        const refreshData = jwt.verify(
          refreshToken,
          process.env.JWT_REFRESH_SECRET
        );
        const tokens = await refreshTokenService(refreshToken);
        const data = jwt.verify(tokens.accessToken, process.env.JWT_SECRET);
        const user = await User.findById(data._id);

        if (!user) {
          return res
            .status(401)
            .send({ error: "Not authorized to access this resource." });
        }
        res.set({
          "Access-Token": tokens.accessToken,
          "Refresh-Token": tokens.refreshToken,
        });
        const blogId = req.query.blogId;
        const blog = await Blog.findById({ _id: blogId })
          .populate("author")
          .exec();
        if (!blog) {
          return res.status(404).send({ error: "Blog not found." });
        }

        if (blog.author._id.toString() !== user._id.toString()) {
          return res
            .status(403)
            .send({ error: "You are not authorized to update this blog." });
        }

        req.user = { _id: user._id,
          token: tokens.accessToken
         };
        next();
      } catch (refreshError) {
        return res.status(401).send({
          error:
            "Both access token and refresh token have expired. Please log in again.",
        });
      }
    }
    return res.status(401).send({ error: error.message });
  }
};

module.exports = authenticateAccessBlog;
