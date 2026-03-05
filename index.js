const express = require("express");
const cors = require("cors");
const alldl = require("alldl"); // নতুন প্যাকেজ

const app = express();
app.use(cors());

app.get("/", (req, res) => {
  res.send("API is Running! Use /api/download?url=YOUR_URL");
});

app.get("/api/download", async (req, res) => {
  const videoUrl = req.query.url;

  if (!videoUrl) {
    return res.status(400).json({ success: false, message: "URL is required!" });
  }

  try {
    const data = await alldl(videoUrl);
    return res.status(200).json({ success: true, data: data });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Error or unsupported URL!" });
  }
});

module.exports = app;
