import ftp from "basic-ftp";
import path from "path";
import { fileURLToPath } from "url";

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
        console.log("Connected to FTP. Uploading .htaccess...");
        await client.uploadFrom(path.join(__dirname, ".htaccess"), ".htaccess");
        
        // Touch tmp/restart.txt to restart the app
        await client.ensureDir("tmp");
        await client.uploadFrom(path.join(__dirname, ".htaccess"), "tmp/restart.txt"); // uploading a dummy file to update timestamp
        
        console.log(".htaccess uploaded and app restarted successfully!");
    } catch (err) {
        console.error(err);
    }
    client.close();
}
run();
