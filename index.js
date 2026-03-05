const express = require("express");
const cors = require("cors");
const btch = require("btch-downloader");

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
    let result;

    // লিংক অনুযায়ী স্বয়ংক্রিয়ভাবে সঠিক ফাংশন কল করা
    if (videoUrl.includes("tiktok.com")) {
      result = await btch.tiktok(videoUrl);
    } else if (videoUrl.includes("instagram.com")) {
      result = await btch.igdl(videoUrl);
    } else if (videoUrl.includes("facebook.com") || videoUrl.includes("fb.watch") || videoUrl.includes("fb.com")) {
      result = await btch.fbdown(videoUrl);
    } else if (videoUrl.includes("youtube.com") || videoUrl.includes("youtu.be")) {
      result = await btch.ytdl(videoUrl);
    } else if (videoUrl.includes("twitter.com") || videoUrl.includes("x.com")) {
      result = await btch.twitter(videoUrl);
    } else {
      return res.status(400).json({ 
        success: false, 
        message: "Unsupported URL! Currently supports: TikTok, FB, IG, YT, Twitter." 
      });
    }
    
    // সফলভাবে ডাটা পেলে
    return res.status(200).json({
      success: true,
      developer: "Your Name",
      data: result
    });

  } catch (error) {
    // এরর হলে আমরা প্যাকেজের আসল ফাংশনগুলোর লিস্ট দেখতে পাবো
    return res.status(500).json({ 
      success: false, 
      message: "Download failed! Maybe link expired or private video.", 
      error: error.message,
      debug_supported_functions: Object.keys(btch)
    });
  }
});

module.exports = app;
