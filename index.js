const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();
app.use(cors());

// ==========================================
// ১. TikTok Custom Scraper (১০০% Working)
// ==========================================
async function getTikTokData(url) {
  try {
    const response = await axios.post("https://www.tikwm.com/api/", { url: url, count: 12, cursor: 0, web: 1, hd: 1 });
    const data = response.data.data;
    const fixUrl = (link) => (link && !link.startsWith("http") ? "https://www.tikwm.com" + link : link);

    return {
      platform: "TikTok",
      title: data.title || "TikTok Video",
      cover_image: fixUrl(data.cover),
      video_watermark: fixUrl(data.wmplay),
      video_no_watermark: fixUrl(data.play),
      music_url: fixUrl(data.music)
    };
  } catch (error) {
    throw new Error("TikTok Scraper Failed!");
  }
}

// ==========================================
// ২. Universal Bypass Engine (YT, FB, IG, X)
// ==========================================
async function getUniversalData(url) {
  try {
    // এখানে আমরা ব্রাউজার সেজে রিকোয়েস্ট পাঠাচ্ছি (Header Spoofing)
    const response = await axios.post(
      "https://api.cobalt.tools/api/json",
      {
        url: url,
        vQuality: "720",
        filenamePattern: "basic"
      },
      {
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/json",
          "Origin": "https://cobalt.tools",    // এই লাইনটার জন্যই আগে ব্লক খেয়েছিলো
          "Referer": "https://cobalt.tools/",  // এখন সে ভাববে রিকোয়েস্ট তার নিজের সাইট থেকেই আসছে
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        }
      }
    );

    return {
      platform: "Universal",
      title: "Ready to Download! 🚀",
      video_url: response.data.url
    };
  } catch (error) {
    // যদি কোনো কারণে ব্লক হয়, তবে আমরা Fallback সার্ভার ব্যবহার করবো
    try {
      const fallback = await axios.get(`https://api.ryzendesu.vip/api/downloader/igdl?url=${encodeURIComponent(url)}`);
      return {
        platform: "Universal",
        title: "Fetched via Backup Server",
        video_url: fallback.data?.data?.[0]?.url || fallback.data?.data?.url
      };
    } catch (err) {
      throw new Error("Security is too high! Video might be private.");
    }
  }
}

// ==========================================
// Main API Route
// ==========================================
app.get("/", (req, res) => {
  res.send("Bro's Ultimate API is Live! 🔥");
});

app.get("/api/download", async (req, res) => {
  const videoUrl = req.query.url;

  if (!videoUrl) {
    return res.status(400).json({ success: false, message: "Bro, please provide a valid link!" });
  }

  try {
    let result;

    if (videoUrl.includes("tiktok.com")) {
      result = await getTikTokData(videoUrl);
    } else {
      result = await getUniversalData(videoUrl);
    }

    return res.status(200).json({ success: true, data: result });

  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = app;
