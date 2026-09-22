require("dotenv").config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const connectDB = require("./config/db");

const app = express();

const { notFound, errorHandler } = require("./middleware/errorMiddleware");

const userRoutes = require("./routes/userRoutes");
const charityRoutes = require("./routes/charityRoutes");
const scoreRoutes = require("./routes/scoreRoutes");
const subscriptionRoutes = require("./routes/subscriptionRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const drawRoutes = require("./routes/drawRoutes");
const winnerRoutes = require("./routes/winnerRoutes");
const adminRoutes = require("./routes/adminRoutes");

connectDB();
app.use(helmet());
const allowedOrigins = [
  "http://localhost:5173",
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("CORS origin not allowed."));
    },
    credentials: true,
  }),
);
app.use(express.json());
app.use(morgan("dev"));
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 200,
    message: {
      success: false,
      message: "Too many requests. Please try again later.",
    },
  }),
);



app.use("/api/users", userRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/charities", charityRoutes);
app.use("/api/scores", scoreRoutes);
app.use("/api/subscriptions", subscriptionRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/draws", drawRoutes);
app.use("/api/winners", winnerRoutes);


app.use(notFound);
app.use(errorHandler);



const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
