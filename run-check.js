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
        
        console.log("Uploading check-server.php...");
        await client.uploadFrom(path.join(__dirname, "check-server.php"), "check-server.php");
        
        console.log("Fetching check-server.php...");
        https.get('https://chatwizs.com/check-server.php', (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                console.log("HTTP Response:");
                console.log(data);
            });
        });
    } catch (err) {
        console.error(err);
    }
    client.close();
}
run();
