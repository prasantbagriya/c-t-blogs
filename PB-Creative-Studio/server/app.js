const express = require('express');
const cors = require('cors');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const compression = require('compression');
const examRoutes = require('./exam_routes');

console.log("--- SYSTEM BOOT ---");
console.log("Starting Node.js Application...");

const app = express();
app.use(compression());
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// 1. Static Asset Serving
const homePublicPath = path.resolve(__dirname, 'public');

const staticCacheOptions = {
    maxAge: '0',
    setHeaders: (res, filepath) => {
        if (filepath.includes(path.sep + 'assets' + path.sep)) {
            res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
        } else if (filepath.endsWith('.html')) {
            res.setHeader('Cache-Control', 'public, max-age=0, must-revalidate');
        } else {
            res.setHeader('Cache-Control', 'public, max-age=2592000');
        }
    }
};

// Root static serving
app.use('/', express.static(homePublicPath, staticCacheOptions));
// Explicit sub-app static serving (prevents catch-all overlap for assets)
app.use('/portal', express.static(path.join(homePublicPath, 'portal'), staticCacheOptions));
app.use('/hub', express.static(path.join(homePublicPath, 'hub'), staticCacheOptions));
app.use('/tool', express.static(path.join(homePublicPath, 'tool'), staticCacheOptions));
app.use('/youtubevideodownload', express.static(path.join(homePublicPath, 'youtubevideodownload'), staticCacheOptions));

// Unified Admin Redirect
app.get(['/admin', '/admin/*'], (req, res) => {
    const subPath = req.params[0] ? `/${req.params[0]}` : '';
    res.redirect(301, `/portal/admin${subPath}`);
});

// Uploads for Exam Pro
app.use('/uploads', express.static(path.join(__dirname, 'uploads'), { maxAge: '30d' }));
const uploadsDir = path.join(__dirname, 'uploads/tmp');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

// 2. Navigation Redirects (Ensure trailing slashes)
app.get('/tool', (req, res) => res.redirect('/tool/'));
app.get('/youtubevideodownload', (req, res) => res.redirect('/youtubevideodownload/'));

// 3. Health Check
app.get('/health', (req, res) => {
    res.json({ 
        status: 'ok', 
        message: 'Unified Tools & Downloader Server is Active',
        uptime: process.uptime()
    });
});

// 4. API Endpoints (YouTube Downloader)
// Handle both root and prefixed versions for maximum compatibility
const infoHandler = (req, res) => {
    const url = req.method === 'POST' ? req.body.url : req.query.url;
    if (!url) return res.status(400).json({ error: 'URL is required' });

    const localYtDlp = path.join(__dirname, 'yt-dlp');
    const ytDlpBin = fs.existsSync(localYtDlp) ? localYtDlp : 'yt-dlp';
    const ytDlp = spawn(ytDlpBin, [
        '--dump-json',
        '--no-playlist',
        '--no-warnings',
        '--no-call-home',
        '--no-check-certificates',
        url
    ]);

    let output = '';
    let errorOutput = '';

    ytDlp.stdout.on('data', (data) => output += data.toString());
    ytDlp.stderr.on('data', (data) => errorOutput += data.toString());

    ytDlp.on('error', (err) => {
        console.error(`FATAL: yt-dlp binary error: ${err.message}`);
        if (!res.headersSent) {
            res.status(500).json({ error: 'System Error: Extraction engine not found on server.' });
        }
    });

    ytDlp.on('close', (code) => {
        if (code !== 0) {
            console.error(`yt-dlp exit ${code}: ${errorOutput}`);
            return res.status(500).json({ error: 'Extraction failed. Ensure the link is a valid YouTube video.' });
        }
        try {
            const info = JSON.parse(output);
            const formats = (info.formats || [])
                .filter(f => f.vcodec !== 'none' || f.acodec !== 'none')
                .map(f => ({
                    id: f.format_id,
                    ext: f.ext,
                    quality: f.format_note || f.resolution || 'N/A',
                    vcodec: f.vcodec,
                    acodec: f.acodec,
                    filesize: f.filesize || f.filesize_approx || 0,
                    url: f.url
                })).reverse();

            res.json({
                title: info.title || 'Unknown Video',
                thumbnail: info.thumbnail || '',
                duration: info.duration_string || 'N/A',
                formats: formats.slice(0, 15)
            });
        } catch (err) {
            res.status(500).json({ error: 'Failed to process video metadata.' });
        }
    });
};

app.all('/info', infoHandler);
app.all('/api/info', infoHandler);
app.all('/youtubevideodownload/info', infoHandler);
app.all('/youtubevideodownload/api/info', infoHandler);

const downloadHandler = (req, res) => {
    const url = req.method === 'POST' ? req.body.url : req.query.url;
    const format_id = req.method === 'POST' ? req.body.format_id : req.query.format_id;
    if (!url) return res.status(400).send('URL is required');

    console.log(`Processing Download Request: ${url}`);

    const args = ['-o', '-', '--no-warnings', url];
    if (format_id) args.push('-f', format_id);

    const localYtDlp = path.join(__dirname, 'yt-dlp');
    const ytDlpBin = fs.existsSync(localYtDlp) ? localYtDlp : 'yt-dlp';
    const ytDlp = spawn(ytDlpBin, args);

    ytDlp.on('error', (err) => {
        console.error(`FATAL: yt-dlp binary missing for download.`);
        if (!res.headersSent) res.status(500).send('System Error: extraction engine missing.');
    });

    res.setHeader('Content-Disposition', `attachment; filename="video.mp4"`);
    res.setHeader('Content-Type', 'video/mp4');
    ytDlp.stdout.pipe(res);

    ytDlp.on('close', (code) => {
        if (code !== 0) console.error(`Download failed with code ${code}`);
    });

    req.on('close', () => ytDlp.kill());
};

app.all('/download', downloadHandler);
app.all('/api/download', downloadHandler);
app.all('/youtubevideodownload/download', downloadHandler);
app.all('/youtubevideodownload/api/download', downloadHandler);

// 4.5 Exam Pro API
app.use('/api', examRoutes);

// SPA Internal Catch-Alls
app.get(['/tool', '/tool/*'], (req, res) => {
    res.setHeader('Cache-Control', 'public, max-age=0, must-revalidate');
    res.sendFile(path.resolve(__dirname, 'public', 'tool', 'index.html'));
});

app.get(['/youtubevideodownload', '/youtubevideodownload/*'], (req, res) => {
    res.setHeader('Cache-Control', 'public, max-age=0, must-revalidate');
    res.sendFile(path.resolve(__dirname, 'public', 'youtubevideodownload', 'index.html'));
});

app.get(['/portal', '/portal/*'], (req, res) => {
    res.setHeader('Cache-Control', 'public, max-age=0, must-revalidate');
    res.sendFile(path.resolve(__dirname, 'public', 'portal', 'index.html'));
});

app.get(['/hub', '/hub/*'], (req, res) => {
    res.setHeader('Cache-Control', 'public, max-age=0, must-revalidate');
    res.sendFile(path.resolve(__dirname, 'public', 'hub', 'index.html'));
});

app.get(/.*/, (req, res) => {
    res.setHeader('Cache-Control', 'public, max-age=0, must-revalidate');
    res.sendFile(path.resolve(__dirname, 'public', 'index.html'));
});

// Final Error Boundary
process.on('uncaughtException', (err) => {
    console.error('--- FATAL SYSTEM CRASH ---');
    console.error(err.stack);
});

app.listen(PORT, (err) => {
    if (err) {
        console.error('--- STARTUP FAILED ---');
        console.error(err);
        return;
    }
    console.log(`--- SERVER RUNNING ---`);
    console.log(`Mode: Production`);
    console.log(`Port: ${PORT}`);
    console.log(`----------------------`);
});
