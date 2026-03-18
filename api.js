const express = require('express');
const ytDl = require('yt-dlp-exec');
const cors = require('cors');

const app = express();
app.use(cors());

// Home Route
app.get('/', (req, res) => {
    res.send('<h1>Media Downloader API is Running Super Fast!</h1>');
});

// Download API Route
app.get('/api/download', async (req, res) => {
    const videoUrl = req.query.url;

    if (!videoUrl) {
        return res.status(400).json({ success: false, error: 'URL provide koro bro!' });
    }

    try {
        const info = await ytDl(videoUrl, {
            dumpSingleJson: true,
            noCheckCertificates: true,
            noWarnings: true,
            preferFreeFormats: true,
            addHeader:['User-Agent:Mozilla/5.0 (Windows NT 10.0; Win64; x64)']
        });

        const formats = info.formats ||[];

        // 1. অডিও লিঙ্ক খোঁজা
        let audioUrl = "Not Found";
        const audioFormats = formats.filter(f => f.vcodec === 'none' || (f.format_id && f.format_id.includes('audio')));
        if (audioFormats.length > 0) {
            audioUrl = audioFormats[audioFormats.length - 1].url; // সবচেয়ে ভালো কোয়ালিটির অডিও
        }

        // 2. সেরা ভিডিও লিঙ্ক খোঁজা
        let bestVideoUrl = info.url || "Not Found";
        const videoFormats = formats.filter(f => f.vcodec !== 'none');
        if (videoFormats.length > 0) {
            bestVideoUrl = videoFormats[videoFormats.length - 1].url; // সবচেয়ে ভালো কোয়ালিটির ভিডিও
        }

        // 3. নির্দিষ্ট রেজোলিউশন খোঁজা (৩৬০, ৪৮০, ৭২০)
        const getResolution = (height) => {
            let format = videoFormats.find(f => f.height === height && f.acodec !== 'none'); // অডিও সহ ভিডিও
            if (!format) format = videoFormats.find(f => f.height === height); // শুধু ভিডিও
            return format ? format.url : null;
        };

        // 4. লিঙ্কগুলো সাজানো
        const downloadLinks = {
            "360p": getResolution(360) || bestVideoUrl,
            "480p": getResolution(480) || bestVideoUrl,
            "720p": getResolution(720) || bestVideoUrl,
            "best_quality_video": bestVideoUrl, // এটা সব সময় কাজ করবে
            "audio_high": audioUrl !== "Not Found" ? audioUrl : bestVideoUrl
        };

        // 5. রেসপন্স পাঠানো
        res.json({
            success: true,
            title: info.title || "Instagram Video",
            thumbnail: info.thumbnail || "No Thumbnail",
            source: info.extractor_key || "Instagram",
            links: downloadLinks
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ 
            success: false, 
            error: "Failed to fetch video. Might be private or blocked.", 
            details: error.message 
        });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
