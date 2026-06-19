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
        
        await client.cd("..");
        
        console.log("Cleaning up public_html...");
        try { await client.removeDir("public_html/server"); } catch(e){}
        try { await client.removeDir("public_html/blog"); } catch(e){}
        try { await client.removeDir("public_html/PB-Creative-Studio"); } catch(e){}
        try { await client.removeDir("public_html/dist"); } catch(e){}
        try { await client.remove("public_html/app.js"); } catch(e){}
        try { await client.remove("public_html/server.cjs"); } catch(e){}
        try { await client.remove("public_html/.htaccess"); } catch(e){}
        
        console.log("Uploading to nodejs folder...");
        await client.cd("nodejs");
        
        client.trackProgress(info => {
            console.log(`Uploaded ${info.bytes / 1024 / 1024} MB`);
        });
        await client.uploadFrom(path.join(__dirname, "chatwiz_upload_lite.zip"), "chatwiz_upload_lite.zip");
        
        console.log("Uploading shims...");
        await client.ensureDir("shims/node-domexception");
        await client.uploadFromDir(path.join(__dirname, "shims", "node-domexception"), "shims/node-domexception");
        
        console.log("Uploading unzip.php...");
        // Wait, we can't run unzip.php from nodejs via HTTP!
        // Hostinger HTTP only serves from public_html!
        // We need to put unzip.php in public_html but tell it to extract ../nodejs/chatwiz_upload_lite.zip into ../nodejs/
        await client.cd("../public_html");
        await client.uploadFrom(path.join(__dirname, "unzip-nodejs.php"), "unzip-nodejs.php");
        
        console.log("Done uploading.");
    } catch (err) {
        console.error(err);
    }
    client.close();
}
run();
