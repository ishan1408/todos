const express = require("express");
const app = express();

app.use(express.json());

const tourRoutes = require("./routes/tourRoutes");
const userRoutes = require("./routes/userRoutes");

app.use("/api/tours", tourRoutes);
app.use("/api/users", userRoutes);

module.exports = app;
