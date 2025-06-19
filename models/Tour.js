const mongoose = require("mongoose");

const tourSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "A tour must have a name"],
  },
  duration: Number,
  maxGroupSize: Number,
  difficulty: {
    type: String,
    enum: ["easy", "medium", "difficult"],
  },
  ratingsAverage: {
    type: Number,
    default: 4.5,
  },
  ratingsQuantity: {
    type: Number,
    default: 0,
  },
  price: {
    type: Number,
    required: [true, "A tour must have a price"],
  },
  summary: String,
  description: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
  secretTour: {
    type: Boolean,
    default: false,
  },
  startDates: [Date],

});

// 🔐 Query Middleware - find hook
tourSchema.pre(/^find/, function (next) {
  console.log("Query Middleware is running")
  this.find({ secretTour: { $ne: true } });
  this.startTime = Date.now();
  next();
});

tourSchema.post(/^find/, function (docs, next) {
  console.log(`Query took ${Date.now() - this.startTime}ms`);
  next();
});

//Aggregation Middleware
tourSchema.pre('aggregate', function (next) {
  console.log("Aggregation Middleware is running...");
  next();
});

module.exports = mongoose.model("Tour", tourSchema);
