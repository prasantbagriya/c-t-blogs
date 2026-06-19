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
        const pwd = await client.pwd();
        console.log("Current working directory:", pwd);
        
        const list = await client.list();
        console.log("Files:", list.map(l => l.name));
    } catch (err) {
        console.error(err);
    }
    client.close();
}
run();
