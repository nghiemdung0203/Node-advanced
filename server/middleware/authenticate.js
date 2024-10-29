const User = require("../model/User");
const jwt = require("jsonwebtoken");
const { refreshTokenService } = require("../service/userService");

const authenticate = async (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const refreshToken = req.headers["x-refresh-token"];

  // Kiểm tra xem access token có tồn tại không
  if (!authHeader) {
    return res
      .status(401)
      .send({ error: "No token provided, authorization denied." });
  }

  if (!refreshToken) {
    return res
      .status(401)
      .send({ error: "No refresh token provided." });
  }

  const accessToken = authHeader.replace("Bearer ", "");

  try {
    // Kiểm tra và xác thực access token
    const data = jwt.verify(accessToken, process.env.JWT_ACCESS_SECRET);
    const user = await User.findOne({ _id: data._id });

    if (!user) {
      return res
        .status(401)
        .send({ error: "Not authorized to access this resource." });
    }

    req.user = {
      _id: user._id,
      token: accessToken,
    };
    next();
  } catch (error) {
    // Nếu access token hết hạn và refresh token tồn tại
    if (error.name === "TokenExpiredError" && refreshToken) {
      try {
        // Kiểm tra và xác thực refresh token
        const refreshData = jwt.verify(
          refreshToken,
          process.env.JWT_REFRESH_SECRET
        );

        // Gọi refreshTokenService để tạo mới token
        const tokens = await refreshTokenService(refreshToken);

        // Xác thực access token mới
        const data = jwt.verify(
          tokens.accessToken,
          process.env.JWT_ACCESS_SECRET
        );
        const user = await User.findOne({ _id: data._id });

        if (!user) {
          return res
            .status(401)
            .send({ error: "Not authorized to access this resource." });
        }

        // Set lại access token và refresh token mới trong headers
        res.set({
          "Access-Token": tokens.accessToken,
          "Refresh-Token": tokens.refreshToken,
        });

        req.user = {
          _id: user._id,
          token: tokens.accessToken,
        };
        next();
      } catch (refreshError) {
        // Nếu refresh token cũng hết hạn hoặc không hợp lệ
        if (
          refreshError.name === "TokenExpiredError" ||
          refreshError.name === "JsonWebTokenError"
        ) {
          return res
            .status(401)
            .send({
              error:
                "Both access token and refresh token have expired. Please log in again.",
            });
        }
        return res.status(401).send({ error: refreshError.message });
      }
    } else {
      // Trường hợp access token không hợp lệ và không có refresh token
      return res.status(401).send({ error: error.message });
    }
  }
};

module.exports = authenticate;
