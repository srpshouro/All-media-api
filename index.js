const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();
app.use(cors());

// ==========================================
// ১. টিকটক ডাউনলোডার (Fixed Cover & Download Links)
// ==========================================
async function getTikTokData(url) {
  try {
    const response = await axios.post("https://www.tikwm.com/api/", { url: url, count: 12, cursor: 0, web: 1, hd: 1 });
    const data = response.data.data;
    const domain = "https://www.tikwm.com";

    // লিংকগুলোর শুরুতে http না থাকলে সেটা ফিক্স করার ফাংশন
    const fixUrl = (link) => (link && !link.startsWith("http") ? domain + link : link);

    return {
      platform: "TikTok",
      title: data.title,
      cover_image: fixUrl(data.cover),
      video_watermark: fixUrl(data.wmplay),
      video_no_watermark: fixUrl(data.play),
      music_url: fixUrl(data.music)
    };
  } catch (error) {
    throw new Error("TikTok scraping failed!");
  }
}

// ==========================================
// ২. অল-ইন-ওয়ান ডাউনলোডার (FB, IG, YouTube)
// ==========================================
async function getOtherMediaData(url) {
  try {
    let apiUrl = "";
    
    // লিংক অনুযায়ী পাওয়ারফুল ফ্রি API সিলেক্ট করা
    if (url.includes("instagram.com")) {
      apiUrl = `https://api.siputzx.my.id/api/d/igdl?url=${encodeURIComponent(url)}`;
    } else if (url.includes("facebook.com") || url.includes("fb.watch") || url.includes("fb.com")) {
      apiUrl = `https://api.siputzx.my.id/api/d/facebook?url=${encodeURIComponent(url)}`;
    } else if (url.includes("youtube.com") || url.includes("youtu.be")) {
      apiUrl = `https://api.siputzx.my.id/api/d/ytmp4?url=${encodeURIComponent(url)}`;
    } else {
      throw new Error("Unsupported URL!");
    }

    const response = await axios.get(apiUrl);
    let videoUrl = "";
    
    // API থেকে সঠিক ভিডিও লিংকটা বের করে আনা
    if (url.includes("instagram.com")) {
      videoUrl = response.data.data[0].url; // ইন্সটাগ্রামের লিংক
    } else if (url.includes("facebook.com") || url.includes("fb.watch")) {
      videoUrl = response.data.data.hd || response.data.data.sd || response.data.data[0].url; // ফেসবুকের লিংক
    } else if (url.includes("youtube.com") || url.includes("youtu.be")) {
      videoUrl = response.data.data.dl; // ইউটিউবের লিংক
    }

    return {
      platform: "Universal",
      video_url: videoUrl
    };
  } catch (error) {
    throw new Error("Failed to fetch from this platform!");
  }
}

// ==========================================
// Main API Route
// ==========================================
app.get("/", (req, res) => {
  res.send("Bro's Custom Media API is Running! 🔥");
});

app.get("/api/download", async (req, res) => {
  const videoUrl = req.query.url;

  if (!videoUrl) {
    return res.status(400).json({ success: false, message: "URL is required!" });
  }

  try {
    let result;
    // লিংক দেখে ফাংশন কল করা
    if (videoUrl.includes("tiktok.com")) {
      result = await getTikTokData(videoUrl);
    } else {
      result = await getOtherMediaData(videoUrl);
    }

    return res.status(200).json({ success: true, data: result });

  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to fetch media!", error: error.message });
  }
});

module.exports = app;
