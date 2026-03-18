const express = require('express');
const ytDl = require('yt-dlp-exec');
const cors = require('cors');

const app = express();
app.use(cors());

const PORT = process.env.PORT || 3000;

// Home Route
app.get('/', (req, res) => {
    res.send('<h1>All Media Downloader API is Live!</h1>');
});

// Download API Route
app.get('/api/download', async (req, res) => {
    const videoUrl = req.query.url;

    if (!videoUrl) {
        return res.status(400).json({ error: 'Please provide a video URL!' });
    }

    try {
        // Fetching all metadata using yt-dlp
        const info = await ytDl(videoUrl, {
            dumpSingleJson: true,
            noCheckCertificates: true,
            noWarnings: true,
            preferFreeFormats: true,
            addHeader: [
                'User-Agent:Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            ]
        });

        // Filter formats for 360p, 480p, 720p
        const formats = info.formats;
        
        const getFormat = (resHeight) => {
            // Find mp4 format with video+audio that matches height
            return formats.find(f => f.height === resHeight && f.ext === 'mp4' && f.acodec !== 'none') || 
                   formats.find(f => f.height === resHeight && f.ext === 'mp4');
        };

        const result = {
            success: true,
            title: info.title,
            thumbnail: info.thumbnail,
            source: info.extractor,
            links: {
                "360p": getFormat(360)?.url || "Not Found",
                "480p": getFormat(480)?.url || "Not Found",
                "720p": getFormat(720)?.url || "Not Found",
                "audio_high": formats.filter(f => f.vcodec === 'none').pop()?.url || "Not Found"
            }
        };

        // Instagram/FB er khetre jodi specific resolution na thake tobe best available video dewa
        if(result.links["720p"] === "Not Found") {
            result.links["best_quality"] = info.url;
        }

        res.json(result);

    } catch (error) {
        console.error(error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to extract video links. Link ta check koro ba private kina dekho.',
            details: error.message 
        });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
