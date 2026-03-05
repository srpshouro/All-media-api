const express = require("express");
const cors = require("cors");
const { ndown } = require("nayan-media-downloader");

const app = express();
app.use(cors());

app.get("/", (req, res) => {
  res.send("API is Running! Use /api/download?url=YOUR_URL");
});

app.get("/api/download", async (req, res) => {
  const videoUrl = req.query.url;

  if (!videoUrl) {
    return res.status(400).json({
      success: false,
      message: "Please provide a valid URL! Example: /api/download?url=https://...",
    });
  }

  try {
    const result = await ndown(videoUrl);
    if (result.status) {
      return res.status(200).json({
        success: true,
        data: result.data,
      });
    } else {
      return res.status(404).json({ success: false, message: "Media not found!" });
    }
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server Error", error: error.message });
  }
});

module.exports = app;
