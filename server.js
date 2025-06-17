const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const tourRoutes = require("./routes/tourRoutes");
const userRoutes = require("./routes/userRoutes");
const errorController = require("./controllers/errorController");
const authRoutes = require("./routes/authRoutes");

dotenv.config();
connectDB();

const app = express();
app.use(express.json());

app.use("/tours", tourRoutes);
app.use("/users", userRoutes);
app.use(errorController);
app.use("/auth", authRoutes);


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
