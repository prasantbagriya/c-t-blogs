import express from 'express';
import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

const router = express.Router();
import https from 'https';

const downloadFile = (url, dest) => {
    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(dest);
        const request = https.get(url, (response) => {
            // handle redirects
            if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
                file.close();
                try { fs.unlinkSync(dest); } catch(e) {}
                downloadFile(response.headers.location, dest).then(resolve).catch(reject);
                return;
            }
            if (response.statusCode !== 200) {
                file.close();
                try { fs.unlinkSync(dest); } catch(e) {}
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
    const binName = isWin ? 'yt-dlp.exe' : 'yt-dlp';
    const binDir = path.join(process.cwd(), 'server', 'bin');
    const binPath = path.join(binDir, binName);

    if (fs.existsSync(binPath)) {
        const stats = fs.statSync(binPath);
        if (stats.size > 0) {
            if (!isWin) {
                try {
                    fs.chmodSync(binPath, 0o755);
                } catch (e) {
                    console.error(`[Downloader] Chmod failed: ${e.message}`);
                }
            }
            return binPath;
        } else {
            console.log(`[Downloader] yt-dlp binary is 0 bytes. Re-downloading...`);
            fs.unlinkSync(binPath);
        }
    }

    console.log(`[Downloader] yt-dlp binary not found. Initiating dynamic download...`);
    if (!fs.existsSync(binDir)) {
        fs.mkdirSync(binDir, { recursive: true });
    }

    const url = isWin 
        ? 'https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp.exe'
        : 'https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp';

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

const infoHandler = async (req, res) => {
    const url = req.method === 'POST' ? req.body.url : req.query.url;
    if (!url) return res.status(400).json({ error: 'URL is required' });

    console.log(`[Downloader] Processing Info Request for: ${url}`);

    try {
        const customEnv = { ...process.env };
        const tmpDir = path.join(process.cwd(), 'server', 'tmp');
        if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });
        customEnv.TMPDIR = tmpDir;

        const ytDlpBin = await ensureYtDlp();
        const ytDlp = spawn(ytDlpBin, [
            '--dump-json',
            '--no-playlist',
            '--no-warnings',
            '--no-check-certificates',
            '--extractor-args',
            'youtube:player_client=android',
            url
        ], { env: customEnv });

        let output = '';
        let errorOutput = '';

        ytDlp.stdout.on('data', (data) => output += data.toString());
        ytDlp.stderr.on('data', (data) => errorOutput += data.toString());

        ytDlp.on('error', (err) => {
            console.error(`[Downloader] FATAL: yt-dlp binary error: ${err.message}`);
            if (!res.headersSent) {
                res.status(500).json({ error: 'System Error: Extraction engine (yt-dlp) not found on server.' });
            }
        });

        ytDlp.on('close', (code) => {
            if (code !== 0) {
                console.error(`[Downloader] yt-dlp exit ${code}: ${errorOutput}`);
                if (errorOutput.includes('403') || errorOutput.includes('Sign in to confirm')) {
                    return res.status(500).json({ error: 'YouTube blocks request (Bot detection). Try another link, proxy, or upload cookies.' });
                }
                return res.status(500).json({ error: `Extraction failed: ${errorOutput}` });
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
    } catch (err) {
        console.error(`[Downloader] Info Handler Exception: ${err.message}`);
        res.status(500).json({ error: 'Internal server error resolving downloader engine.' });
    }
};

const downloadHandler = async (req, res) => {
    const url = req.method === 'POST' ? req.body.url : req.query.url;
    const format_id = req.method === 'POST' ? req.body.format_id : req.query.format_id;
    if (!url) return res.status(400).send('URL is required');

    console.log(`[Downloader] Processing Download Request: ${url}`);

    const args = ['-o', '-', '-q', '--no-warnings', '--no-playlist', '--extractor-args', 'youtube:player_client=android', url];
    if (format_id) args.push('-f', format_id);

    try {
        const customEnv = { ...process.env };
        const tmpDir = path.join(process.cwd(), 'server', 'tmp');
        if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });
        customEnv.TMPDIR = tmpDir;

        const ytDlpBin = await ensureYtDlp();
        const ytDlp = spawn(ytDlpBin, args, { env: customEnv });

        ytDlp.on('error', (err) => {
            console.error(`[Downloader] FATAL: yt-dlp binary missing for download.`);
            if (!res.headersSent) res.status(500).send('System Error: extraction engine missing.');
        });

        // Prevent Nginx/Litespeed buffering which causes timeouts for large streams
        res.setHeader('X-Accel-Buffering', 'no');
        res.setHeader('Cache-Control', 'no-cache');
        // Let the browser handle the extension based on the actual stream
        res.setHeader('Content-Disposition', `attachment; filename="downloaded_media"`);
        res.setHeader('Content-Type', 'application/octet-stream');
        ytDlp.stdout.pipe(res);

        ytDlp.on('close', (code) => {
            if (code !== 0) console.error(`[Downloader] Download failed with code ${code}`);
        });

        req.on('close', () => ytDlp.kill());
    } catch (err) {
        console.error(`[Downloader] Download Handler Exception: ${err.message}`);
        if (!res.headersSent) res.status(500).send('Internal server error.');
    }
};

router.all('/info', infoHandler);
router.all('/download', downloadHandler);

export default router;
