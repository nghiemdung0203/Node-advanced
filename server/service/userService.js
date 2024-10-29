const {
  updateUserValidation,
  userIdValidationSchema,
  signupValidation,
  siginValidation,
} = require("../middleware/validation/userValidation");
const User = require("../model/User");
const jwt = require("jsonwebtoken");

const signupService = async (req) => {
  const { error: userError } = signupValidation.validate(req.body);
  if (userError) {
    throw new Error(userError.details[0].message);
  }

  try {
    const user = new User(req.body);
    const accessToken = await user.generateAccessToken();
    const refreshToken = await user.generateRefreshToken();
    await user.save();

    const userObject = user.toObject();
    delete userObject.password;
    userObject.token = {
      accessToken: accessToken,
      refreshToken: refreshToken,
    };
    return userObject;
  } catch (error) {
    throw new Error(error.message);
  }
};

const signinService = async (req) => {
  const { error: userError } = siginValidation.validate(req.body);
  if (userError) {
    throw new Error(userError.details[0].message);
  }
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      throw new Error("User not found");
    }
    if (user && (await user.comparePassword(req.body.password))) {
      const accessToken = await user.generateAccessToken();
      const refreshToken = await user.generateRefreshToken();
      await User.findOneAndUpdate(
        { _id: user._id },
        {
          $set: {
            refreshToken: [
              {
                token: refreshToken,
                createdAt: new Date(),
              },
            ],
          },
        }
      );
      const userObject = user.toObject();
      delete userObject.password;
      userObject.token = {
        accessToken: accessToken,
        refreshToken: refreshToken,
      };
      return userObject;
    }
    throw new Error("Email or password is incorrect");
  } catch (error) {
    throw new Error(error.message);
  }
};

const updateUserInfoService = async (req) => {
  const userId = req.user._id.toString();
  if (!userId) {
    throw new Error("User ID is required");
  }

  const { error: userIdError } = userIdValidationSchema.validate({ userId });
  if (userIdError) {
    throw new Error(userIdError.details[0].message);
  }

  const { error: bodyError } = updateUserValidation.validate(req.body);
  if (bodyError) {
    throw new Error(bodyError.details[0].message); // Log the validation error
  }
  const userPayload = {
    name: req.body.name,
    password: req.body.password,
    updateAt: Date.now(),
  };
  try {
    const updatedUser = await User.findOneAndUpdate(
      { _id: userId },
      { $set: userPayload },
      { new: true }
    );
    if (!updatedUser) {
      throw new Error("Something went wrong when updating the user.");
    }
    const updatedUserObject = updatedUser.toObject();
    delete updatedUserObject.password;

    return updatedUserObject;
  } catch (error) {
    throw new Error(error.message);
  }
};

const refreshTokenService = async (refreshToken) => {
  if (!refreshToken) {
    throw new Error("Refresh token is required");
  }

  try {
    const payload = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const user = await User.findOne({ _id: payload._id });
    if (!user) {
      throw new Error("User not found");
    }
    const isValid = await user.verifyRefreshToken(refreshToken);
    console.log(isValid);
    if (!isValid) {
      throw new Error("Invalid refresh token");
    }

    const newAccessToken = await user.generateAccessToken();

    return {
      accessToken: newAccessToken,
      refreshToken: refreshToken,
    };
  } catch (error) {
    throw new Error(error.message);
  }
};

module.exports = {
  signupService,
  signinService,
  updateUserInfoService,
  refreshTokenService,
};
