const express = require("express");
const dotenv = require("dotenv");
const helmet = require("helmet");
const connectDB = require("./config/db");
const tourRoutes = require("./routes/tourRoutes");
const userRoutes = require("./routes/userRoutes");
const errorController = require("./controllers/errorController");
const authRoutes = require("./routes/authRoutes");
const cookieParser = require("cookie-parser");
const rateLimit = require('express-rate-limit')
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');

dotenv.config();
connectDB();

const app = express();
app.use(helmet())

const limiter = rateLimit({
  max:100,
  windowMs: 60 * 60 * 1000,
  message:"Too many requests"
})

app.use('/api',limiter)

app.use(
  hpp({
    whitelist: ['duration', 'difficulty'],
  })
);

app.use(express.json({limit:'10kb'}));
app.use(cookieParser());
app.use(mongoSanitize());
app.use(xss());

app.use("/api/tours", tourRoutes);
app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);

app.use(errorController);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
