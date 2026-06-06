const express = require('express');
const cors = require('cors');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const https = require('https');
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

// Helper to download yt-dlp binary dynamically if it is missing
const downloadFile = (url, dest) => {
    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(dest);
        const request = https.get(url, (response) => {
            if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
                file.close();
                fs.unlink(dest, () => {});
                downloadFile(response.headers.location, dest).then(resolve).catch(reject);
                return;
            }
            if (response.statusCode !== 200) {
                file.close();
                fs.unlink(dest, () => {});
                reject(new Error(`Failed to download: status ${response.statusCode}`));
                return;
            }
            response.pipe(file);
            file.on('finish', () => {
                file.close();
                resolve();
            });
        });
        request.on('error', (err) => {
            file.close();
            fs.unlink(dest, () => {});
            reject(err);
        });
    });
};

const ensureYtDlp = async () => {
    const isWin = process.platform === 'win32';
    const binName = isWin ? 'yt-dlp.exe' : 'yt-dlp_linux';
    const binDir = path.join(__dirname, 'bin');
    const binPath = path.join(binDir, binName);

    // Look for legacy yt-dlp file in the same directory first
    const legacyPath = path.join(__dirname, isWin ? 'yt-dlp.exe' : 'yt-dlp');
    if (fs.existsSync(legacyPath)) {
        if (!isWin) {
            try { fs.chmodSync(legacyPath, 0o755); } catch (e) {}
        }
        return legacyPath;
    }

    if (fs.existsSync(binPath)) {
        if (!isWin) {
            try {
                fs.chmodSync(binPath, 0o755);
            } catch (e) {
                console.error(`[Downloader] Chmod failed: ${e.message}`);
            }
        }
        return binPath;
    }

    console.log(`[Downloader] yt-dlp binary not found. Initiating dynamic download...`);
    if (!fs.existsSync(binDir)) {
        fs.mkdirSync(binDir, { recursive: true });
    }

    const url = isWin 
        ? 'https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp.exe'
        : 'https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp_linux';

    try {
        await downloadFile(url, binPath);
        console.log(`[Downloader] yt-dlp binary downloaded successfully to: ${binPath}`);
        if (!isWin) {
            fs.chmodSync(binPath, 0o755);
        }
        return binPath;
    } catch (err) {
        console.error(`[Downloader] Failed to download yt-dlp: ${err.message}`);
        return 'yt-dlp'; // Fallback to global
    }
};

// 4. API Endpoints (YouTube Downloader)
// Handle both root and prefixed versions for maximum compatibility
const infoHandler = async (req, res) => {
    const url = req.method === 'POST' ? req.body.url : req.query.url;
    if (!url) return res.status(400).json({ error: 'URL is required' });

    try {
        const ytDlpBin = await ensureYtDlp();
        const ytDlp = spawn(ytDlpBin, [
            '--dump-json',
            '--no-playlist',
            '--no-warnings',
            '--no-check-certificates',
            url
        ], {
            env: { ...process.env, TMPDIR: uploadsDir }
        });

        let output = '';
        let errorOutput = '';

        ytDlp.stdout.on('data', (data) => output += data.toString());
        ytDlp.stderr.on('data', (data) => errorOutput += data.toString());

        ytDlp.on('error', (err) => {
            console.error(`FATAL: yt-dlp binary error: ${err.message}`);
            if (!res.headersSent) {
                res.status(500).json({ error: 'System Error: Extraction engine (yt-dlp) not found on server.' });
            }
        });

        ytDlp.on('close', (code) => {
            if (code !== 0) {
                console.error(`yt-dlp exit ${code}: ${errorOutput}`);
                // Write detailed output to server logs for diagnostics
                try {
                    fs.writeFileSync(path.join(__dirname, 'downloader_error.log'), `[${new Date().toISOString()}] Exit code: ${code}\nError:\n${errorOutput}\n`);
                } catch (e) {}

                if (errorOutput.includes('403') || errorOutput.includes('Sign in to confirm')) {
                    return res.status(500).json({ error: 'YouTube blocks request (Bot detection). Try another link, proxy, or upload cookies.' });
                }
                return res.status(500).json({ error: `Extraction failed: ${errorOutput || 'No error output'}` });
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
                        abr: f.abr || 0,
                        filesize: f.filesize || f.filesize_approx || 0,
                        url: f.url
                    })).reverse();

                res.json({
                    title: info.title || 'Unknown Video',
                    thumbnail: info.thumbnail || '',
                    duration: info.duration_string || 'N/A',
                    formats: formats
                });
            } catch (err) {
                res.status(500).json({ error: 'Failed to process video metadata.' });
            }
        });
    } catch (err) {
        res.status(500).json({ error: 'System Error initializing extractor.' });
    }
};

app.all('/info', infoHandler);
app.all('/api/info', infoHandler);
app.all('/youtubevideodownload/info', infoHandler);
app.all('/youtubevideodownload/api/info', infoHandler);

const downloadHandler = async (req, res) => {
    const url = req.method === 'POST' ? req.body.url : req.query.url;
    const format_id = req.method === 'POST' ? req.body.format_id : req.query.format_id;
    const ext = req.method === 'POST' ? req.body.ext : req.query.ext;
    if (!url) return res.status(400).send('URL is required');

    console.log(`Processing Download Request: ${url} (Format: ${format_id || 'default'}, Extension: ${ext || 'mp4'})`);

    const args = ['-o', '-', '--no-warnings', url];
    if (format_id) args.push('-f', format_id);

    try {
        const ytDlpBin = await ensureYtDlp();
        const ytDlp = spawn(ytDlpBin, args, {
            env: { ...process.env, TMPDIR: uploadsDir }
        });

        ytDlp.on('error', (err) => {
            console.error(`FATAL: yt-dlp binary missing for download.`);
            if (!res.headersSent) res.status(500).send('System Error: extraction engine missing.');
        });

        // Determine if this is an audio format download
        const targetExt = ext || 'mp4';
        const isAudio = ['mp3', 'm4a', 'webm', 'wav', 'aac'].includes(targetExt);
        
        if (isAudio) {
            res.setHeader('Content-Disposition', `attachment; filename="audio.${targetExt}"`);
            res.setHeader('Content-Type', `audio/${targetExt === 'm4a' ? 'mp4' : targetExt}`);
        } else {
            res.setHeader('Content-Disposition', `attachment; filename="video.mp4"`);
            res.setHeader('Content-Type', 'video/mp4');
        }

        ytDlp.stdout.pipe(res);

        ytDlp.on('close', (code) => {
            if (code !== 0) console.error(`Download failed with code ${code}`);
        });

        req.on('close', () => ytDlp.kill());
    } catch (err) {
        if (!res.headersSent) res.status(500).send('System Error.');
    }
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
