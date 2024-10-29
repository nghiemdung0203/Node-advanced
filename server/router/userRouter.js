const {
  signupController,
  signinController,
  updateUserController,
} = require("../controller/userController");
const authenticate = require("../middleware/authenticate");

const router = require("express").Router();

router.post("/signup", signupController);
router.post("/signin", signinController);
router.put("/updateUser", authenticate, updateUserController);

module.exports = router;
