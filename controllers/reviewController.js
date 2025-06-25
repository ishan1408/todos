const Review = require('../models/Review');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError'); 
const Factory = require("../controllers/handlerFactory")

exports.getAllReviews = async (req, res, next) => {
  try {
    const filter = req.params.tourId ? { tour: req.params.tourId } : {};

    const reviews = await Review.find(filter).populate({
      path: 'user',
      select: 'name email'
    });

    res.status(200).json({
      status: 'success',
      results: reviews.length,
      data: reviews
    });
  } catch (err) {
    next(err);
  }
};


exports.getReviewById = catchAsync(async (req, res, next) => {
  const review = await Review.findById(req.params.id);

  if (!review) {
    return next(new AppError('No review found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      review
    }
  });
});

exports.createReview = catchAsync(async (req, res, next) => {
  if (!req.body.tour) req.body.tour = req.params.tourId;
  if (!req.body.user) req.body.user = req.user.id;

  const newReview = await Review.create(req.body);

  res.status(201).json({
    status: 'success',
    data: newReview,
  });
});

exports.updateReview = Factory.updateOne(Review)
exports.deleteReview = Factory.deleteOne(Review);
