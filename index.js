const express = require("express");
const cors = require("cors");
const axios = require("axios");
const ytdl = require("@distube/ytdl-core");

const app = express();
app.use(cors());

// ==========================================
// ১. TikTok Custom Scraper (Working)
// ==========================================
async function getTikTokData(url) {
  const response = await axios.post("https://www.tikwm.com/api/", { url: url, count: 12, cursor: 0, web: 1, hd: 1 });
  const data = response.data.data;
  const fixUrl = (link) => (link && !link.startsWith("http") ? "https://www.tikwm.com" + link : link);

  return {
    platform: "TikTok",
    title: data.title,
    cover_image: fixUrl(data.cover),
    video_watermark: fixUrl(data.wmplay),
    video_no_watermark: fixUrl(data.play),
    music_url: fixUrl(data.music)
  };
}

// ==========================================
// ২. YouTube Custom Engine (ytdl-core)
// ==========================================
async function getYouTubeData(url) {
  try {
    // সরাসরি ইউটিউব থেকে ভিডিওর ইনফরমেশন ডিকোড করা
    const info = await ytdl.getInfo(url);
    
    // এমন একটা লিংক খোঁজা যেখানে ভিডিও এবং অডিও দুটোই আছে
    let format = ytdl.chooseFormat(info.formats, { filter: 'audioandvideo', quality: 'highest' });
    if (!format) format = info.formats.find(f => f.url);

    return {
      platform: "YouTube",
      title: info.videoDetails.title,
      cover_image: info.videoDetails.thumbnails[0]?.url,
      video_url: format.url
    };
  } catch (error) {
    throw new Error("YouTube decoding failed!");
  }
}

// ==========================================
// ৩. Facebook Raw HTML Scraper (নিজস্ব লজিক)
// ==========================================
async function getFacebookData(url) {
  try {
    // আমরা ব্রাউজার সেজে ফেসবুকে ঢুকবো
    const { data } = await axios.get(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36",
        "Accept-Language": "en-US,en;q=0.9"
      }
    });

    // ফেসবুকের সোর্স কোড থেকে ডাইরেক্ট ভিডিও লিংক বের করা (Regex Magic)
    const hdMatch = data.match(/"hd_src":"(https:\/\/[^"]+)"/);
    const sdMatch = data.match(/"sd_src":"(https:\/\/[^"]+)"/);
    
    let videoUrl = null;
    if (hdMatch) videoUrl = hdMatch[1].replace(/\\/g, '');
    else if (sdMatch) videoUrl = sdMatch[1].replace(/\\/g, '');

    if (!videoUrl) throw new Error("Video is private or unsupported!");

    return {
      platform: "Facebook",
      title: "Facebook Video",
      video_url: videoUrl
    };
  } catch (error) {
    throw new Error("Facebook scraping failed!");
  }
}

// ==========================================
// ৪. Instagram Bypass Scraper
// ==========================================
async function getInstagramData(url) {
  try {
    // Cobalt এর হিডেন ওপেন-সোর্স ইঞ্জিন ব্যবহার করে আইজি বাইপাস
    const response = await axios.post("https://api.cobalt.tools/api/json", 
      { url: url },
      {
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/json",
          "Origin": "https://cobalt.tools",
          "User-Agent": "Mozilla/5.0"
        }
      }
    );

    return {
      platform: "Instagram",
      video_url: response.data.url
    };
  } catch (error) {
    throw new Error("Instagram blocked the request!");
  }
}

// ==========================================
// Main API Route
// ==========================================
app.get("/", (req, res) => res.send("Bro's Ultimate Custom API is Live! 🚀"));

app.get("/api/download", async (req, res) => {
  const videoUrl = req.query.url;

  if (!videoUrl) {
    return res.status(400).json({ success: false, message: "URL is required!" });
  }

  try {
    let result;

    // লিংক দেখে আমাদের নিজস্ব ফাংশন কল করা
    if (videoUrl.includes("tiktok.com")) {
      result = await getTikTokData(videoUrl);
    } else if (videoUrl.includes("youtube.com") || videoUrl.includes("youtu.be")) {
      result = await getYouTubeData(videoUrl);
    } else if (videoUrl.includes("facebook.com") || videoUrl.includes("fb.watch") || videoUrl.includes("fb.com")) {
      result = await getFacebookData(videoUrl);
    } else if (videoUrl.includes("instagram.com")) {
      result = await getInstagramData(videoUrl);
    } else {
      return res.status(400).json({ success: false, message: "Only TT, YT, FB, and IG are supported right now!" });
    }

    return res.status(200).json({ success: true, data: result });

  } catch (error) {
    return res.status(500).json({ success: false, message: error.message || "Failed to fetch media!" });
  }
});

module.exports = app;
