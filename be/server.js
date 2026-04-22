const express = require("express");
const cors = require("cors");
const path = require("path");

const specsRouter = require("./routes/specs");
const bagsRouter = require("./routes/bags");
const cosmeticsRouter = require("./routes/cosmetics");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use("/images", express.static(path.join(__dirname, "public/images")));

app.use("/api/specs", specsRouter);
app.use("/api/bags", bagsRouter);
app.use("/api/cosmetics", cosmeticsRouter);

// Health check
app.get("/api/health", (_req, res) => {
  res.json({ success: true, message: "skin-fashion-app API is running" });
});

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
