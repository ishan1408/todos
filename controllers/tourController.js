const Tour = require("../models/Tour");
const APIFeatures = require("../utils/apiFeatures");
const Factory = require("../controllers/handlerFactory")
const catchAsync = require('../utils/catchAsync')

exports.getAllTours = async (req, res, next) => {
  try {
    const features = new APIFeatures(Tour.find(), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();

    const tours = await features.query
      .populate({
        path: "guides",
        select: "name email role"
      })
      .populate({
        path: "reviews",
        select: "review rating createdAt"
      });

    res.status(200).json({
      status: "success",
      results: tours.length,
      data: tours,
    });
  } catch (err) {
    next(err);
  }
};

exports.getTourById = async (req, res, next) => {
  try {
    const tour = await Tour.findById(req.params.id).populate({
      path: 'guides',
      select: 'name email role'
    }).populate({
        path: 'reviews',
        select: 'review rating createdAt'
      });

    if (!tour) {
      return res.status(404).json({
        status: 'fail',
        message: 'Tour not found'
      });
    }

    res.status(200).json({
      status: 'success',
      data: tour
    });
  } catch (err) {
    next(err);
  }
};


exports.getTourStats = async (req, res, next) => {
  try {
    const stats = await Tour.aggregate([
      {
        $match: { ratingsAverage: { $gte: 4.5 } },
      },
      {
        $group: {
          _id: "$difficulty",
          numTours: { $sum: 1 },
          numRatings: { $sum: "$ratingsQuantity" },
          avgRating: { $avg: "$ratingsAverage" },
          avgPrice: { $avg: "$price" },
          minPrice: { $min: "$price" },
          maxPrice: { $max: "$price" },
        },
      },
      {
        $sort: { avgPrice: 1 },
      },
    ]);

    res.status(200).json({
      status: "success",
      data: stats,
    });
  } catch (err) {
    next(err);
  }
};

exports.getMonthlyPlan = async (req, res, next) => {
  try {
    const year = +req.params.year;

    const plan = await Tour.aggregate([
      {
        $unwind: "$startDates",
      },
      {
        $match: {
          startDates: {
            $gte: new Date(`${year}-01-01`),
            $lte: new Date(`${year}-12-31`),
          },
        },
      },
      {
        $group: {
          _id: { $month: "$startDates" },
          numTourStarts: { $sum: 1 },
          tours: { $push: "$name" },
        },
      },
      {
        $addFields: { month: "$_id" },
      },
      {
        $project: { _id: 0 },
      },
      {
        $sort: { numTourStarts: -1 },
      },
      {
        $limit: 12,
      },
    ]);

    res.status(200).json({
      status: "success",
      data: plan,
    });
  } catch (err) {
    next(err);
  }
};

exports.createTour = Factory.createOne(Tour)
exports.updateTour = Factory.updateOne(Tour)
exports.deleteTour = Factory.deleteOne(Tour)


const AppError = require('../utils/appError');

exports.getTourWithin = (req, res, next) => {
  const { distance, latlong, unit } = req.params;

  if (!latlong) {
    return next(new AppError("Please provide latlong in format lat,lng", 400));
  }

  const [lat, lng] = latlong.split(',');

  if (!lat || !lng) {
    return next(new AppError("Please provide valid coordinates in lat,lng format", 400));
  }

  const cleanUnit = unit.trim();

  res.status(200).json({
    status: "success",
    data: {
      distance,
      location: {
        latitude: lat,
        longitude: lng
      },
      unit: cleanUnit
    }
  });
};
