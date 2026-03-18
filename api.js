const express = require('express');
const ytDl = require('yt-dlp-exec');
const cors = require('cors');

const app = express();
app.use(cors());

// Home Route
app.get('/', (req, res) => {
    res.send('<h1>All Media Downloader API is Running!</h1>');
});

// Download API Route
app.get('/api/download', async (req, res) => {
    const videoUrl = req.query.url;

    if (!videoUrl) {
        return res.status(400).json({ success: false, error: 'URL provide koro bro!' });
    }

    try {
        // Fetch metadata using yt-dlp
        const info = await ytDl(videoUrl, {
            dumpSingleJson: true,
            noCheckCertificates: true,
            noWarnings: true,
            preferFreeFormats: true,
            addHeader: ['User-Agent:googlebot', 'referer:facebook.com']
        });

        // Get the best available direct video link
        // Instagram and many others provide a direct URL in info.url
        const bestDirectUrl = info.url || (info.formats && info.formats.length > 0 ? info.formats[info.formats.length - 1].url : null);

        // Building the links object
        const downloadLinks = {
            "360p": bestDirectUrl, // Default to best if specific resolution not found
            "480p": bestDirectUrl,
            "720p": bestDirectUrl,
            "audio_high": bestDirectUrl
        };

        // If specific resolutions are available (especially for YouTube)
        if (info.formats) {
            [360, 480, 720].forEach(resHeight => {
                const found = info.formats.find(f => f.height === resHeight && f.acodec !== 'none');
                if (found) {
                    downloadLinks[resHeight + "p"] = found.url;
                }
            });

            // Find high quality audio if separate
            const audioOnly = info.formats.find(f => f.vcodec === 'none' && (f.ext === 'm4a' || f.ext === 'mp3'));
            if (audioOnly) {
                downloadLinks["audio_high"] = audioOnly.url;
            }
        }

        // Final JSON Response
        res.json({
            success: true,
            title: info.title || "No Title",
            thumbnail: info.thumbnail,
            source: info.extractor_key,
            links: downloadLinks // Ekhane video link gulo thakbe
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ 
            success: false, 
            error: "Failed to extract links", 
            details: error.message 
        });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
