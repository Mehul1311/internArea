const express = require("express");
const http = require("http");
const cors = require("cors");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const rateLimit = require("express-rate-limit");
const bodyparser = require("body-parser");
const compression = require("compression");
const router = require("./Routes/index");
const communityRoutes = require("./Routes/communityRoutes");
const { initSocket } = require("./socket");

require("dotenv").config();

const app = express();
const server = http.createServer(app);
const port = process.env.PORT || 5050;

// Initialize Socket.io
initSocket(server);

// Compress responses
app.use(compression());

// Security Middlewares & Dynamic CORS
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "http://localhost:*", "http://127.0.0.1:*"],
      fontSrc: ["'self'", "https:", "data:"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: [],
    }
  }
}));
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || origin.includes("localhost") || origin.includes("127.0.0.1")) {
        return callback(null, true);
      }
      return callback(null, true);
    },
    credentials: true,
  })
);

// Rate Limiting (Global)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 2000, // Increased to 2000 per 15 minutes to prevent 429 during heavy filtering
});
app.use(limiter);

// Parsers
app.use(cookieParser());
app.use(bodyparser.json({ limit: "2mb" })); // Reduced from 50mb to 2mb
app.use(bodyparser.urlencoded({ extended: true, limit: "2mb" })); // Reduced from 50mb to 2mb
app.use(express.json());

// Routes
app.get("/", (req, res) => res.send("Internshala Backend is running with production-grade security and embedded SQLite fallback."));
app.get("/health", (req, res) => res.status(200).json({ status: "ok" }));



app.use("/api", router);
app.use("/api/community", communityRoutes);

app.use("/", router);
app.use("/community", communityRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Express Error:', err.stack);
  res.status(err.status || 500).json({ error: err.message || "Internal Server Error" });
});

if (require.main === module && !process.env.VERCEL) {
  server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
}

module.exports = app;
