const mongoose = require("mongoose");
const User = require("./User");

const tourSchema = new mongoose.Schema(
  {
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
    startLocation: {
      type: {
        type: String,
        default: "Point",
        enum: ["Point"],
      },
      coordinates: [Number],
      address: String,
      description: String,
    },
    locations: [
      {
        type: {
          type: String,
          default: "Point",
          enum: ["Point"],
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number,
      },
    ],
    guides: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);



//virtual populate
tourSchema.virtual("reviews", {
  ref: "Review",
  foreignField: "tour",
  localField: "_id",
});

// 🔐 Query Middleware - find hook
tourSchema.pre(/^find/, function (next) {
  // console.log("Query Middleware is running");
  this.find({ secretTour: { $ne: true } });
  this.startTime = Date.now();
  next();
});

tourSchema.pre(/^find/, function (next) {
  this.populate({
    path: "guides",
    select: "-__v -passwordChangedAt",
  });
  next();
});

// 📊 Aggregation Middleware
tourSchema.pre("aggregate", function (next) {
  // console.log("Aggregation Middleware is running...");
  next();
});

tourSchema.pre("save", async function (next) {
  const guidesPromises = this.guides.map(async (id) => await User.findById(id));
  this.guides = await Promise.all(guidesPromises);
  next();
});

module.exports = mongoose.model("Tour", tourSchema);
