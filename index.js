const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();
app.use(cors());

// ==========================================
// ১. TikTok Scraper (tikwm backend) - Working
// ==========================================
async function getTikTokData(url) {
  const { data } = await axios.post("https://www.tikwm.com/api/", { url, count: 12, cursor: 0, web: 1, hd: 1 });
  const fixUrl = (link) => (link && !link.startsWith("http") ? "https://www.tikwm.com" + link : link);
  return {
    platform: "TikTok",
    title: data.data.title || "TikTok Video",
    cover_image: fixUrl(data.data.cover),
    video_watermark: fixUrl(data.data.wmplay),
    video_no_watermark: fixUrl(data.data.play),
    music_url: fixUrl(data.data.music)
  };
}

// ==========================================
// ২. Instagram Scraper (v3.igdownloader backend)
// ==========================================
async function getInstagramData(url) {
  try {
    // আমরা ব্রাউজারের মতো Form-Data পাঠাচ্ছি
    const params = new URLSearchParams({ q: url, t: "media", lang: "en" });
    const { data } = await axios.post("https://v3.igdownloader.app/api/ajaxSearch", params.toString(), {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0 Safari/537.36"
      }
    });

    // সোর্স কোড থেকে ডাইরেক্ট MP4 লিংক বের করা (Regex Magic)
    const match = data.data.match(/href="([^"]+)"/);
    if (!match) throw new Error("Video not found!");

    return { platform: "Instagram", video_url: match[1].replace(/&amp;/g, "&") };
  } catch (err) {
    // Fallback: যদি মেইন সাইট ব্লক করে, আমরা বিকল্প ব্যাকএন্ডে হিট করবো
    const backup = await axios.get(`https://api.vreden.web.id/api/igdownload?url=${encodeURIComponent(url)}`);
    return { platform: "Instagram", video_url: backup.data.result[0].url || backup.data.result[0].url_download };
  }
}

// ==========================================
// ৩. Facebook Scraper (getmyfb backend)
// ==========================================
async function getFacebookData(url) {
  try {
    const params = new URLSearchParams({ q: url, t: "media", lang: "en" });
    const { data } = await axios.post("https://getmyfb.com/api/ajaxSearch", params.toString(), {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0"
      }
    });

    const match = data.data.match(/href="([^"]+)"/);
    if (!match) throw new Error("Private video!");

    return { platform: "Facebook", video_url: match[1].replace(/&amp;/g, "&") };
  } catch (err) {
    const backup = await axios.get(`https://api.vreden.web.id/api/fbdownload?url=${encodeURIComponent(url)}`);
    return { platform: "Facebook", video_url: backup.data.result.Normal_video };
  }
}

// ==========================================
// ৪. X / Twitter Scraper (twitsave backend)
// ==========================================
async function getTwitterData(url) {
  try {
    const { data } = await axios.get(`https://twitsave.com/info?url=${encodeURIComponent(url)}`);
    // HTML থেকে ভিডিও লিংক ফিল্টার করা
    const match = data.match(/href="([^"]+)"[^>]*>Download/i) || data.match(/src="([^"]+)" type="video\/mp4"/);
    return { platform: "Twitter/X", video_url: match[1] };
  } catch (err) {
    throw new Error("Twitter Scraping Failed!");
  }
}

// ==========================================
// ৫. YouTube Scraper (Hidden Community Backend)
// ==========================================
async function getYouTubeData(url) {
  try {
    // Vercel ব্লক এড়াতে স্পেশাল Community Server
    const { data } = await axios.post("https://cobalt.owo.si/api/json", { url: url, vQuality: "720" }, {
      headers: { "Accept": "application/json", "Content-Type": "application/json" }
    });
    return { platform: "YouTube", video_url: data.url };
  } catch (err) {
    const backup = await axios.get(`https://api.vreden.web.id/api/ytmp4?url=${encodeURIComponent(url)}`);
    return { platform: "YouTube", video_url: backup.data.result.download.url };
  }
}

// ==========================================
// Main Route Logic
// ==========================================
app.get("/", (req, res) => res.send("Bro's Custom Scraper Engine is Running! 🚀"));

app.get("/api/download", async (req, res) => {
  const videoUrl = req.query.url;
  if (!videoUrl) return res.status(400).json({ success: false, message: "URL required!" });

  try {
    let result;
    if (videoUrl.includes("tiktok.com")) result = await getTikTokData(videoUrl);
    else if (videoUrl.includes("instagram.com")) result = await getInstagramData(videoUrl);
    else if (videoUrl.includes("facebook.com") || videoUrl.includes("fb.watch") || videoUrl.includes("fb.com")) result = await getFacebookData(videoUrl);
    else if (videoUrl.includes("twitter.com") || videoUrl.includes("x.com")) result = await getTwitterData(videoUrl);
    else if (videoUrl.includes("youtube.com") || videoUrl.includes("youtu.be")) result = await getYouTubeData(videoUrl);
    else return res.status(400).json({ success: false, message: "Unsupported Link!" });

    return res.status(200).json({ success: true, data: result });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server Blocked or Private Video!", error: error.message });
  }
});

module.exports = app;
