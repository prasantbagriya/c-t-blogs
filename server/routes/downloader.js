import express from 'express';
import { spawn } from 'child_process';

const router = express.Router();

const infoHandler = (req, res) => {
    const url = req.method === 'POST' ? req.body.url : req.query.url;
    if (!url) return res.status(400).json({ error: 'URL is required' });

    console.log(`[Downloader] Processing Info Request for: ${url}`);

    const ytDlp = spawn('yt-dlp', [
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
        console.error(`[Downloader] FATAL: yt-dlp binary error: ${err.message}`);
        if (!res.headersSent) {
            res.status(500).json({ error: 'System Error: Extraction engine (yt-dlp) not found on server.' });
        }
    });

    ytDlp.on('close', (code) => {
        if (code !== 0) {
            console.error(`[Downloader] yt-dlp exit ${code}: ${errorOutput}`);
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

const downloadHandler = (req, res) => {
    const url = req.method === 'POST' ? req.body.url : req.query.url;
    const format_id = req.method === 'POST' ? req.body.format_id : req.query.format_id;
    if (!url) return res.status(400).send('URL is required');

    console.log(`[Downloader] Processing Download Request: ${url}`);

    const args = ['-o', '-', '--no-warnings', url];
    if (format_id) args.push('-f', format_id);

    const ytDlp = spawn('yt-dlp', args);

    ytDlp.on('error', (err) => {
        console.error(`[Downloader] FATAL: yt-dlp binary missing for download.`);
        if (!res.headersSent) res.status(500).send('System Error: extraction engine missing.');
    });

    res.setHeader('Content-Disposition', `attachment; filename="video.mp4"`);
    res.setHeader('Content-Type', 'video/mp4');
    ytDlp.stdout.pipe(res);

    ytDlp.on('close', (code) => {
        if (code !== 0) console.error(`[Downloader] Download failed with code ${code}`);
    });

    req.on('close', () => ytDlp.kill());
};

router.all('/info', infoHandler);
router.all('/download', downloadHandler);

export default router;
