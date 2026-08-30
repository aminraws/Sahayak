const express = require("express");
const cors = require("cors");

const app = express();
const authRoutes = require("./routes/authRoutes");
const workerRoutes = require("./routes/workerRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const earningsRoutes = require("./routes/earningsRoutes");
// Middleware
app.use(cors());
app.use(express.json());

// Test route
app.get("/", (req, res) => {
  res.json({
    message: "Sahayak Backend is running"
  });
});
app.use("/api/auth", authRoutes);


app.use("/api/workers", workerRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/earnings", earningsRoutes);

module.exports = app;