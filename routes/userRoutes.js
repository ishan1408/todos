const express = require("express");
const userController = require("../controllers/userController");
const authController = require("../controllers/authController");
const reviewController = require("../controllers/reviewController");

const router = express.Router();

router.post("/signup", authController.signup);
router.post("/login", authController.login);


router.post("/forgotPassword", authController.forgotPassword);
router.patch("/resetPassword/:token", authController.resetPassword);

router.use(authController.protect);

router.use(authController.restrictTo('admin'));

router.get("/me", authController.protect, userController.getMe, userController.getUser);


router
  .route("/")
  .get(userController.getAllUsers)
  .post(userController.createUser);

router
  .route("/:id")
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

router.get("/logout", authController.logout);

module.exports = router;
