const express = require('express');
const ytDl = require('yt-dlp-exec');
const cors = require('cors');

const app = express();
app.use(cors());

// Home Route (eta check korar jonno je server cholche ki na)
app.get('/', (req, res) => {
    res.send('<h1>Server is Live!</h1>');
});

// Download Route
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

        res.json({
            success: true,
            title: info.title,
            links: {
                "video": info.url,
                "thumbnail": info.thumbnail
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Running on ${PORT}`));
