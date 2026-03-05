const express = require("express");
const cors = require("cors");
const { ndown } = require("btch-downloader");

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
      message: "Bro, please provide a valid URL! Example: /api/download?url=https://..." 
    });
  }

  try {
    const result = await ndown(videoUrl);
    
    if (result && result.status !== false) {
      return res.status(200).json({
        success: true,
        developer: "Your Name",
        data: result
      });
    } else {
      return res.status(404).json({ success: false, message: "Media not found or link expired!" });
    }
  } catch (error) {
    return res.status(500).json({ 
      success: false, 
      message: "Internal Server Error", 
      error: error.message 
    });
  }
});

module.exports = app;
