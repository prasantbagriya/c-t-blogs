const express = require('express');
const cors    = require('cors');
const { spawn } = require('child_process');
const path    = require('path');
const fs      = require('fs');

console.log("=== PB CREATIVE STUDIO BOOT ===");
console.log("__dirname   :", __dirname);
console.log("process.cwd :", process.cwd());

const app  = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// ─── Resolve Dist Paths Robustly ─────────────────────────────────────────────
// Try multiple base locations so it works regardless of where Hostinger runs
function findDist(relativePath) {
  const candidates = [
    path.join(__dirname,       relativePath),
    path.join(process.cwd(),   relativePath),
    path.join(__dirname, '..', relativePath),
  ];
  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      console.log(`[FOUND] ${relativePath} => ${candidate}`);
      return candidate;
    }
  }
  console.error(`[MISSING] Could not find: ${relativePath}`);
  console.error(`[TRIED]`, candidates);
  return candidates[0]; // fallback to first guess
}

const downloaderDist = findDist('apps/downloader/dist');
const toolsDist      = findDist('apps/tools/dist');
const homepageDist   = findDist('apps/homepage/dist');

console.log("Downloader :", downloaderDist);
console.log("Tools      :", toolsDist);
console.log("Homepage   :", homepageDist);
console.log("================================");

// ─── Static File Serving ──────────────────────────────────────────────────────
app.use('/youtubevideodownload', express.static(downloaderDist));
app.use('/tool',                 express.static(toolsDist));
app.use('/',                     express.static(homepageDist));

// ─── Redirects ────────────────────────────────────────────────────────────────
app.get('/tool',                 (req, res) => res.redirect('/tool/'));
app.get('/youtubevideodownload', (req, res) => res.redirect('/youtubevideodownload/'));

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
    res.json({
        status:      'ok',
        uptime:      process.uptime(),
        __dirname:   __dirname,
        cwd:         process.cwd(),
        homepage:    homepageDist,
        downloader:  downloaderDist,
        tools:       toolsDist,
        homepageOK:  fs.existsSync(path.join(homepageDist, 'index.html')),
        downloaderOK:fs.existsSync(path.join(downloaderDist,'index.html')),
        toolsOK:     fs.existsSync(path.join(toolsDist,    'index.html')),
    });
});

// ─── YouTube Info API ─────────────────────────────────────────────────────────
const infoHandler = (req, res) => {
    const url = req.method === 'POST' ? req.body.url : req.query.url;
    if (!url) return res.status(400).json({ error: 'URL is required' });

    const ytDlp = spawn('yt-dlp', [
        '--dump-json', '--no-playlist',
        '--no-warnings', '--no-call-home',
        '--no-check-certificates', url
    ]);

    let output = '', errorOutput = '';
    ytDlp.stdout.on('data', d => output += d.toString());
    ytDlp.stderr.on('data', d => errorOutput += d.toString());

    ytDlp.on('error', err => {
        if (!res.headersSent) res.status(500).json({ error: 'yt-dlp not found on server.' });
    });

    ytDlp.on('close', code => {
        if (code !== 0) return res.status(500).json({ error: 'Extraction failed. Check the URL.' });
        try {
            const info = JSON.parse(output);
            const formats = (info.formats || [])
                .filter(f => f.vcodec !== 'none' || f.acodec !== 'none')
                .map(f => ({
                    id:       f.format_id,
                    ext:      f.ext,
                    quality:  f.format_note || f.resolution || 'N/A',
                    vcodec:   f.vcodec,
                    acodec:   f.acodec,
                    abr:      f.abr || 0,
                    filesize: f.filesize || f.filesize_approx || 0,
                    url:      f.url
                })).reverse();

            res.json({
                title:     info.title || 'Unknown Video',
                thumbnail: info.thumbnail || '',
                duration:  info.duration_string || 'N/A',
                formats:   formats
            });
        } catch (e) {
            res.status(500).json({ error: 'Failed to parse metadata.' });
        }
    });
};

app.all('/info',                          infoHandler);
app.all('/api/info',                      infoHandler);
app.all('/youtubevideodownload/info',     infoHandler);
app.all('/youtubevideodownload/api/info', infoHandler);

// ─── YouTube Download API ─────────────────────────────────────────────────────
const downloadHandler = (req, res) => {
    const url       = req.method === 'POST' ? req.body.url       : req.query.url;
    const format_id = req.method === 'POST' ? req.body.format_id : req.query.format_id;
    const ext       = req.method === 'POST' ? req.body.ext       : req.query.ext;
    if (!url) return res.status(400).send('URL is required');

    const args = ['-o', '-', '--no-warnings', url];
    if (format_id) args.push('-f', format_id);

    const ytDlp = spawn('yt-dlp', args);
    ytDlp.on('error', err => {
        if (!res.headersSent) res.status(500).send('yt-dlp missing on server.');
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
    ytDlp.on('close', code => { if (code !== 0) console.error(`Download failed: ${code}`); });
    req.on('close', () => ytDlp.kill());
};

app.all('/download',                          downloadHandler);
app.all('/api/download',                      downloadHandler);
app.all('/youtubevideodownload/download',     downloadHandler);
app.all('/youtubevideodownload/api/download', downloadHandler);

// ─── SPA Catch-All ────────────────────────────────────────────────────────────
app.get(/\/tool\/.*/, (req, res) => {
    const file = path.join(toolsDist, 'index.html');
    if (fs.existsSync(file)) res.sendFile(file);
    else res.status(404).send('Tools app not found');
});

app.get(/\/youtubevideodownload\/.*/, (req, res) => {
    const file = path.join(downloaderDist, 'index.html');
    if (fs.existsSync(file)) res.sendFile(file);
    else res.status(404).send('Downloader app not found');
});

app.get(/.*/, (req, res) => {
    const file = path.join(homepageDist, 'index.html');
    if (fs.existsSync(file)) {
        res.sendFile(file);
    } else {
        // Debug response so user can see what's happening
        res.status(404).send(`
            <h2>Homepage index.html not found</h2>
            <p><strong>__dirname:</strong> ${__dirname}</p>
            <p><strong>Looking for:</strong> ${file}</p>
            <p>Please visit <a href="/health">/health</a> for full diagnostics.</p>
        `);
    }
});

// ─── Error Boundary ───────────────────────────────────────────────────────────
process.on('uncaughtException', err => console.error('CRASH:', err.stack));

// ─── Start ────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Visit /health to check file paths`);
});
