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
        console.log("Connected to FTP. Uploading shims...");
        await client.ensureDir("shims/node-domexception");
        await client.uploadFromDir(path.join(__dirname, "shims", "node-domexception"), "shims/node-domexception");
        console.log("Shims uploaded successfully!");
    } catch (err) {
        console.error(err);
    }
    client.close();
}
run();
