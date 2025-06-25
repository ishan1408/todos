const mongoose = require("mongoose");
const dotenv = require("dotenv");
const fs = require("fs");
const path = require("path");
const bcrypt = require("bcryptjs");

const User = require("../models/User");
const Tour = require("../models/Tour");
const Review = require("../models/Review");

dotenv.config();
console.log('Mongo URI:', process.env.MONGO_URI);


mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => {
    console.error("Connection error:", err);
    process.exit(1);
  });

const users = JSON.parse(
  fs.readFileSync(path.join(__dirname, "users.json"), "utf-8")
);
const tours = JSON.parse(
  fs.readFileSync(path.join(__dirname, "tours.json"), "utf-8")
);
const reviews = JSON.parse(
  fs.readFileSync(path.join(__dirname, "review.json"), "utf-8")
);

const deleteData = async () => {
  try {
    await User.deleteMany();
    await Tour.deleteMany();
    await Review.deleteMany();
    console.log("All data deleted");
    process.exit();
  } catch (err) {
    console.error("Deletion error:", err);
    process.exit(1);
  }
};


const importData = async () => {
  try {
    const hashedUsers = await Promise.all(
      users.map(async (user) => ({
        ...user,
        password: await bcrypt.hash(user.password, 12),
      }))
    );

    await User.insertMany(hashedUsers);
    await Tour.insertMany(tours);
    await Review.insertMany(reviews);
    console.log("Data successfully imported");
    process.exit();
  } catch (err) {
    console.error("Import error:", err);
    process.exit(1);
  }
};


if (process.argv[2] === "--import") {
  importData();
} else if (process.argv[2] === "--delete") {
  deleteData();
} else {
  console.log("Use --import to add data or --delete to remove all data");
  process.exit();
}
