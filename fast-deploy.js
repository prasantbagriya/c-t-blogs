import ftp from "basic-ftp";
import path from "path";
import { fileURLToPath } from "url";
import https from "https";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function run() {
    const client = new ftp.Client();
    try {
        await client.access({
            host: "82.29.191.97",
            user: "u491694131.chatwizs.com",
            password: "t@7Z~BR$ydK",
            secure: false
        });
        
        console.log("Uploading cleanup-and-unzip.php to public_html...");
        await client.uploadFrom(path.join(__dirname, "cleanup-and-unzip.php"), "cleanup-and-unzip.php");
        
        console.log("Moving to nodejs directory...");
        await client.cd("../nodejs");
        
        console.log("Uploading chatwiz_upload_lite.zip to nodejs (130MB, takes a few minutes)...");
        client.trackProgress(info => {
            console.log(`Uploaded ${info.bytes / 1024 / 1024} MB`);
        });
        await client.uploadFrom(path.join(__dirname, "chatwiz_upload_lite.zip"), "chatwiz_upload_lite.zip");
        client.trackProgress(); // disable
        
        console.log("Uploading shims to nodejs/shims...");
        await client.ensureDir("shims/node-domexception");
        await client.uploadFromDir(path.join(__dirname, "shims", "node-domexception"), "shims/node-domexception");
        
        console.log("Upload finished. Triggering cleanup and extraction via HTTP...");
        
        https.get('https://chatwizs.com/cleanup-and-unzip.php', (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                console.log("HTTP Response:");
                console.log(data);
                console.log("All done!");
            });
        }).on('error', err => {
            console.error("HTTP Error:", err);
        });
        
    } catch (err) {
        console.error(err);
    }
    client.close();
}
run();
