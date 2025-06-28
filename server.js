const express = require("express");
const dotenv = require("dotenv");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const rateLimit = require("express-rate-limit");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const hpp = require("hpp");
const path = require("path");
const Tour = require('./models/Tour');
const connectDB = require("./config/db");
const tourRoutes = require("./routes/tourRoutes");
const userRoutes = require("./routes/userRoutes");
const reviewRouter = require("./routes/reviewRoutes");
const authController = require("./controllers/authController");
const userRouter = require('./routes/userRoutes');

dotenv.config();
connectDB();

const app = express();

app.set("view engine", "pug");
app.set("views", path.join(__dirname, "./views"));

app.use(express.static(path.join(__dirname, "public")));

app.use(helmet());

const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: "Too many requests",
});

app.use("/api", limiter);

app.use(
  hpp({
    whitelist: [
      "duration",
      "difficulty",
      "ratingsAverage",
      "ratingsQuantity",
      "price",
    ],
  })
);

app.use(express.json({ limit: "10kb" }));
app.use(cookieParser());

app.use(mongoSanitize());
app.use(xss());

app.get('/', async (req, res, next) => {
  try {
    const tours = await Tour.find().populate({
      path: 'guides',
      select: 'name email role'
    });

    res.status(200).render('overview', {
      title: 'All Tours',
      user: "Ishan Jain",
      tours
    });
  } catch (err) {
    console.error(err);
    res.status(500).render('error', {
      title: 'Error',
      message: 'Failed to load tours'
    });
  }
});

app.get("/tour", (req, res) => {
  res.status(200).render("tour", {
    tour: "The forest hiker",
    user: "Ishan",
  });
});

app.get('/tour/:id', async (req, res, next) => {
  try {
    const tour = await Tour.findById(req.params.id)
      .populate({
        path: 'guides',
        select: 'name email role'
      })
      .populate({
        path: 'reviews',
        select: 'review rating createdAt'
      });

    if (!tour) {
      return res.status(404).render('error', {
        title: 'Tour not found',
        message: 'The tour does not exist.'
      });
    }

    res.status(200).render('tour', {
      title: tour.name,
      user: user.name,
      tour
    });
  } catch (err) {
    console.error(err);
    res.status(500).render('error', {
      title: 'Error',
      message: 'Failed to load the tour'
    });
  }
});

app.get("/login", (req, res) => {
  res.status(200).render("login", {
    title: "Log in to your account"
  });
});

app.get('/account', (req, res) => {
  res.status(200).render('account', {
    title: 'Your Account',
    user: {
      name: 'Ishan Jain',
      email: 'ishan@example.com'
    }
  });
});

app.post("/logout", authController.logout);


app.use("/api/users", userRoutes);
app.use("/api/tours", tourRoutes);
app.use("/api/reviews", reviewRouter);
app.use('/api/auth', userRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
