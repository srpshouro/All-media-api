const express = require('express');
const ytDl = require('yt-dlp-exec');
const cors = require('cors');

const app = express();
app.use(cors());

app.get('/api/download', async (req, res) => {
    const videoUrl = req.query.url;
    if (!videoUrl) return res.status(400).json({ error: 'URL required' });

    try {
        // noPlaylist: true দেওয়াতে এটি অনেক ফাস্ট কাজ করবে
        const info = await ytDl(videoUrl, {
            dumpSingleJson: true,
            noWarnings: true,
            noCheckCertificates: true,
            noPlaylist: true, 
            addHeader:['User-Agent:Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0 Safari/537.36']
        });

        const formats = info.formats ||[];
        
        // Audio Link
        const audioFormat = formats.filter(f => f.vcodec === 'none' || (f.format_id && f.format_id.includes('audio'))).pop();
        const audioUrl = audioFormat ? audioFormat.url : null;

        // Video Links
        const videoFormats = formats.filter(f => f.vcodec !== 'none');
        const bestVideo = info.url || (videoFormats.length > 0 ? videoFormats[videoFormats.length - 1].url : null);

        const getVid = (h) => {
            let f = videoFormats.find(x => x.height === h && x.acodec !== 'none') || videoFormats.find(x => x.height === h);
            return f ? f.url : bestVideo; // Na pele best quality ta dibe
        };

        // একদম ক্লিন এবং ছোট রেসপন্স
        res.json({
            success: true,
            title: info.title || "Video",
            video_urls: {
                "720p": getVid(720),
                "480p": getVid(480),
                "360p": getVid(360)
            },
            audio_url: audioUrl || bestVideo
        });

    } catch (error) {
        res.status(500).json({ success: false, error: "Link blocked or invalid." });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Fast API running on ${PORT}`));
