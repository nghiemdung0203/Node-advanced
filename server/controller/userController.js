const {
  signinService,
  signupService,
  updateUserInfoService,
} = require("../service/userService");

const signupController = async (req, res) => {
  try {
    const savedUser = await signupService(req);
    res.status(201).json(savedUser);
  } catch (error) {
    return res.status(500).json(error.message);
  }
};

const signinController = async (req, res) => {
  try {
    const validUser = await signinService(req);
    res.status(201).json(validUser);
  } catch (error) {
    return res.status(403).json(error.message);
  }
};

const updateUserController = async (req, res) => {
  try {
    const updatedUser = await updateUserInfoService(req);
    res.status(201).json(updatedUser);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

module.exports = { signupController, signinController, updateUserController };
