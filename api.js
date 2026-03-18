const express = require('express');
const ytDl = require('yt-dlp-exec');
const cors = require('cors');

const app = express();
app.use(cors());

app.get('/', (req, res) => {
    res.send('<h1>Media Downloader is Live and Working!</h1>');
});

app.get('/api/download', async (req, res) => {
    const videoUrl = req.query.url;

    if (!videoUrl) {
        return res.status(400).json({ error: 'URL provide koro bro!' });
    }

    try {
        const info = await ytDl(videoUrl, {
            dumpSingleJson: true,
            noCheckCertificates: true,
            noWarnings: true,
            preferFreeFormats: true,
            addHeader: ['referer:facebook.com', 'user-agent:googlebot']
        });

        // Best Quality Video Link (Instagram er khetre etaie best)
        const bestVideo = info.url;

        // Filtering resolutions if available
        const formats = info.formats;
        const resolutions = {};

        // 360p, 480p, 720p khujbe, na pele best quality video link diye dibe
        [360, 480, 720].forEach(res => {
            const found = formats.find(f => f.height === res) || formats.find(f => f.format_note === res + 'p');
            resolutions[res + "p"] = found ? found.url : bestVideo; // Jodi na pay tobe main video link tai dibe
        });

        res.json({
            success: true,
            title: info.title || "No Title",
            thumbnail: info.thumbnail,
            source: info.extractor_key,
            links: {
                "360p": resolutions["360p"],
                "480p": resolutions["480p"],
                "720p": resolutions["720p"],
                "best_quality": bestVideo,
                "audio_high": formats.find(f => f.vcodec === 'none' || f.format_id === 'audio')?.url || bestVideo
            }
        });

    } catch (error) {
        res.status(500).json({ 
            success: false, 
            error: "Failed to fetch links", 
            details: error.message 
        });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on ${PORT}`));
