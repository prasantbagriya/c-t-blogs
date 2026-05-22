// Hostinger Passenger CommonJS Wrapper with Advanced Real-Time Debugging
// Passenger's loader uses require() which crashes on ES Modules (type: "module")
// This wrapper uses dynamic import() to load app.js and hijacks the console
// to write all console.log/error outputs directly to hostinger_debug.log in real time.

const fs = require('fs');
const path = require('path');

const logPath = path.join(__dirname, 'hostinger_debug.log');

// Clear/initialize the log file at startup
try {
    fs.writeFileSync(logPath, `=== ChatWizs Hostinger Debug Session Started ${new Date().toISOString()} ===\n`);
} catch (e) {
    console.error('Failed to initialize hostinger_debug.log:', e);
}

function appendToLog(prefix, args) {
    const time = new Date().toISOString();
    const message = args.map(arg => {
        if (arg instanceof Error) return arg.stack || arg.toString();
        if (typeof arg === 'object') {
            try { return JSON.stringify(arg, null, 2); } catch (e) { return String(arg); }
        }
        return String(arg);
    }).join(' ');
    
    try {
        fs.appendFileSync(logPath, `[${time}] [${prefix}] ${message}\n`);
    } catch (e) {
        // Fallback if write fails
    }
}

// Hijack all console methods to log to hostinger_debug.log
const originalLog = console.log;
const originalError = console.error;
const originalWarn = console.warn;
const originalInfo = console.info;

console.log = (...args) => {
    originalLog.apply(console, args);
    appendToLog('LOG', args);
};
console.error = (...args) => {
    originalError.apply(console, args);
    appendToLog('ERROR', args);
};
console.warn = (...args) => {
    originalWarn.apply(console, args);
    appendToLog('WARN', args);
};
console.info = (...args) => {
    originalInfo.apply(console, args);
    appendToLog('INFO', args);
};

process.on('uncaughtException', (err) => {
    console.error('[CRITICAL] Uncaught Exception in Wrapper:', err);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('[CRITICAL] Unhandled Rejection in Wrapper:', reason);
});

const http = require('http');
const server = http.createServer();

// Hostinger/LiteSpeed requires listen to be called synchronously
const PORT = process.env.PORT || 3001;
server.listen(PORT);

server.on('error', (err) => {
    console.error('[CRITICAL] Server Listen Error:', err);
});

// Set a flag so the dynamically loaded app knows it's running under the wrapper
process.env.IS_WRAPPER = 'true';

let expressApp = null;
let appLoadError = null;

server.on('request', (req, res) => {
    if (expressApp) {
        expressApp(req, res);
    } else if (appLoadError) {
        // Expose the error directly to the browser to debug Hostinger issues!
        res.writeHead(500, { 'Content-Type': 'text/html' });
        res.end(`
            <html>
                <body style="font-family: monospace; background: #1e1e1e; color: #ff5555; padding: 20px;">
                    <h2>ChatWiz Server Startup Failed</h2>
                    <p>The Node.js server started, but the main application code failed to load.</p>
                    <hr/>
                    <pre>${appLoadError.stack || appLoadError.message || String(appLoadError)}</pre>
                </body>
            </html>
        `);
    } else {
        res.writeHead(503, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Service is starting. Please retry shortly.' }));
    }
});

async function startApp() {
    try {
        console.log('[Info] Wrapper starting app.js...');
        const appModule = await import('./app.js');
        expressApp = appModule.app;
        console.log('[Info] app.js imported successfully.');
    } catch (err) {
        console.error("Failed to load app.js:", err);
        appLoadError = err;
    }
}

startApp();

