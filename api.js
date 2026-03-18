const express = require('express');
const ytDl = require('yt-dlp-exec');
const cors = require('cors');

const app = express();
app.use(cors());

// Home Route
app.get('/', (req, res) => {
    res.send('<h1>Media Downloader API is Ready!</h1>');
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
            addHeader: ['User-Agent:googlebot', 'referer:facebook.com']
        });

        // Sabcheye bhalo quality link (Instagram er khetre etaie best)
        const mainVideoUrl = info.url;

        // Sob somoy 360p, 480p, 720p thakbe
        const downloadLinks = {
            "360p": mainVideoUrl,
            "480p": mainVideoUrl,
            "720p": mainVideoUrl,
            "audio_high": mainVideoUrl
        };

        // Jodi YouTube hoy, tobe alada resolution thakbe
        if (info.formats) {
            [360, 480, 720].forEach(resHeight => {
                const found = info.formats.find(f => f.height === resHeight && f.acodec !== 'none' && f.vcodec !== 'none');
                if (found) {
                    downloadLinks[resHeight + "p"] = found.url;
                }
            });

            // Audio link (YouTube ba FB er jonno)
            const audioOnly = info.formats.find(f => f.vcodec === 'none' && (f.ext === 'm4a' || f.ext === 'mp3'));
            if (audioOnly) {
                downloadLinks["audio_high"] = audioOnly.url;
            }
        }

        // Response send kora hocche
        res.json({
            success: true,
            title: info.title || "Social Media Video",
            thumbnail: info.thumbnail,
            source: info.extractor_key || "Unknown",
            links: downloadLinks
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ 
            success: false, 
            error: "Video link khunje paoa jayni.", 
            details: error.message 
        });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
