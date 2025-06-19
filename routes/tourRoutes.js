const express = require("express");
const tourController = require("../controllers/tourController");
const authController = require("../controllers/authController");

const router = express.Router();

router.use(authController.protect);

router
  .route("/")
  .get(tourController.getAllTours)
  .post(tourController.createTour);


router
  .route("/:id")
  .patch(authController.protect, tourController.updateTour)
  .delete(authController.protect, authController.restictTo('admin'), tourController.deleteTour);

  router.route('/tour-stats').get(tourController.getTourStats);
router.route('/monthly-plan/:year').get(tourController.getMonthlyPlan);


module.exports = router;