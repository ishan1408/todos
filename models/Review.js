const mongoose = require('mongoose');
const Tour = require('./Tour');

const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, 'Review cannot be empty'],
      trim: true
    },
    rating: {
      type: Number,
      min: 1,
      max: 10,
      required: [true, 'Review must have a rating']
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    tour: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Tour',
      required: [true, 'Review must belong to a tour']
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Review must be written by a user']
    }
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

reviewSchema.index({
  tour:1,
  user:1
},{unique:true})

reviewSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'user',
    select: 'name email'
  }).populate({
    path: 'tour',
    select: 'name price'
  });

  next();
});

// reviewSchema.index({tour:1,user:1},{unique:true})


reviewSchema.statics.calcAverageRatings = async function (tourId) {
  const stats = await this.aggregate([
    { $match: { tour: tourId } },
    {
      $group: {
        _id: '$tour',
        nRating: { $sum: 1 },
        avgRating: { $avg: '$rating' }
      }
    }
  ]);

  if (stats.length > 0) {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: stats[0].nRating,
      ratingsAverage: stats[0].avgRating
    });
  } else {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: 0,
      ratingsAverage: 4.5
    });
  }
};

reviewSchema.post('save', function () {
  this.constructor.calcAverageRatings(this.tour);
});

reviewSchema.post(/^findOneAnd/, async function (doc) {
  if (doc) await doc.constructor.calcAverageRatings(doc.tour);
});

module.exports = mongoose.model('Review', reviewSchema);


