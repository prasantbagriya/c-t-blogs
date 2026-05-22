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

async function startApp() {
    try {
        console.log('[Info] Wrapper starting app.js...');
        await import('./app.js');
        console.log('[Info] app.js imported successfully.');
    } catch (err) {
        console.error("Failed to load app.js:", err);
    }
}

startApp();

