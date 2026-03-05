const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();
app.use(cors());

// ==========================================
// ১. কাস্টম টিকটক ডাউনলোডার ফাংশন
// ==========================================
async function getTikTokData(url) {
  try {
    // আমরা সরাসরি Tikwm এর হিডেন API তে হিট করছি (কোনো প্যাকেজ ছাড়া)
    const response = await axios.post("https://www.tikwm.com/api/", {
      url: url,
      count: 12,
      cursor: 0,
      web: 1,
      hd: 1
    });
    
    const data = response.data.data;
    return {
      platform: "TikTok",
      title: data.title,
      cover_image: data.cover,
      video_watermark: data.wmplay,
      video_no_watermark: data.play,
      music_url: data.music
    };
  } catch (error) {
    throw new Error("TikTok scraping failed!");
  }
}

// ==========================================
// ২. কাস্টম অল-ইন-ওয়ান ডাউনলোডার (FB, IG, YT, Twitter)
// ==========================================
async function getUniversalData(url) {
  try {
    // Cobalt নামের একটি পাওয়ারফুল ওপেন-সোর্স API ব্যবহার করছি
    const response = await axios.post(
      "https://api.cobalt.tools/api/json",
      {
        url: url,
        vQuality: "720",
        isAudioOnly: false
      },
      {
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/json"
        }
      }
    );

    return {
      platform: "Universal (FB/IG/YT/X)",
      video_url: response.data.url
    };
  } catch (error) {
    throw new Error("Universal scraping failed! Maybe link is private.");
  }
}

// ==========================================
// Main API Route (আপনার ওয়েবসাইটের রাউট)
// ==========================================
app.get("/", (req, res) => {
  res.send("Bro's Custom Media API is Running! 🔥 Use: /api/download?url=YOUR_URL");
});

app.get("/api/download", async (req, res) => {
  const videoUrl = req.query.url;

  if (!videoUrl) {
    return res.status(400).json({ 
      success: false, 
      message: "Please provide a valid URL! Example: /api/download?url=https://..." 
    });
  }

  try {
    let result;

    // লিংক দেখে আমাদের কাস্টম ফাংশনগুলোকে কল করবো
    if (videoUrl.includes("tiktok.com")) {
      result = await getTikTokData(videoUrl);
    } else {
      result = await getUniversalData(videoUrl);
    }

    // সফল হলে ডাটা পাঠিয়ে দিবো
    return res.status(200).json({
      success: true,
      developer: "Your Name (Custom API)",
      data: result
    });

  } catch (error) {
    return res.status(500).json({ 
      success: false, 
      message: "Failed to fetch media!", 
      error: error.message 
    });
  }
});

module.exports = app;
