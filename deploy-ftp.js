import ftp from "basic-ftp";

async function deploy() {
    const client = new ftp.Client();
    client.ftp.verbose = false;
    try {
        console.log("Connecting to FTP...");
        await client.access({
            host: "82.29.191.97",
            user: "u491694131.chatwizs.com",
            password: "t@7Z~BR$ydK",
            secure: false
        });
        
        console.log("Connected! Uploading chatwiz_upload_lite.zip (95MB, this will take a few minutes)...");
        client.trackProgress(info => {
            console.log(`Uploaded ${info.bytes / 1024 / 1024} MB`);
        });
        await client.uploadFrom("chatwiz_upload_lite.zip", "chatwiz_upload_lite.zip");
        
        console.log("Uploading unzip.php...");
        await client.uploadFrom("unzip.php", "unzip.php");
        
        console.log("Uploads finished successfully!");
    }
    catch (err) {
        console.error("Deployment failed:", err);
    }
    client.close();
}

deploy();
