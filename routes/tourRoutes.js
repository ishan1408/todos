const express = require("express");
const tourController = require("../controllers/tourController");
const authController = require("../controllers/authController");
const reviewRouter = require("./../routes/reviewRoutes");

const router = express.Router();

router.use(authController.protect);
router.use("/:tourId/reviews", reviewRouter);

router.route("/tour-stats").get(tourController.getTourStats);

router
  .route("/")
  .get(tourController.getAllTours)
  .post(
  authController.restrictTo("admin", "user"),
  tourController.uploadTourImages,
  tourController.resizeTourImages,
  tourController.createTourCustom
);


router
  .route("/:id")
  .get(tourController.getTourById)
  .patch(authController.restrictTo("admin", "user"), tourController.updateTour)
  .delete(authController.restrictTo("admin"), tourController.deleteTour);

router
  .route("/:id/reviews")
  .get(tourController.getTourById)
  .patch(
    authController.restrictTo("admin", "lead-guide"),
    tourController.updateTour
  )
  .delete(authController.restrictTo("admin"), tourController.deleteTour);

router
  .route("/monthly-plan/:year")
  .get(
    authController.protect,
    authController.restrictTo("admin", "lead-guide"),
    tourController.getMonthlyPlan
  );

router
  .route("/tours-within/:distance/center/:latlong/unit/:unit")
  .get(tourController.getTourWithin);

module.exports = router;
