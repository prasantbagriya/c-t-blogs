import ftp from "basic-ftp";

async function run() {
    const client = new ftp.Client();
    try {
        await client.access({
            host: "82.29.191.97",
            user: "u491694131.chatwizs.com",
            password: "t@7Z~BR$ydK",
            secure: false
        });
        await client.remove(".in.chatwiz_upload_lite.zip.");
        console.log("Deleted stuck temporary file.");
    } catch (err) {
        console.error(err);
    }
    client.close();
}
run();
