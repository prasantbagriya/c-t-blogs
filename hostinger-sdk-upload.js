import fs from 'fs';
import pkg from 'hostinger-api-sdk';
const { Configuration, HostingNodeJSApi } = pkg;

const token = "wQ3RDKhNzln1rit5Z6QYKI5kc33UMxBMy6wxAmrld9a8bbbb";

async function run() {
    try {
        console.log("Reading zip file...");
        const archiveBase64 = fs.readFileSync('chatwiz_upload_lite.zip', { encoding: 'base64' });
        console.log("Zip read successfully. Size in base64:", (archiveBase64.length / 1024 / 1024).toFixed(2), "MB");

        const conf = new Configuration({ accessToken: token });
        const api = new HostingNodeJSApi(conf);
        
        console.log("Attempting to upload to chatwizs.com...");
        const req = {
            archive: archiveBase64,
            app_type: 'express', // assuming express or null
            node_version: null
        };

        const res = await api.createNodeJSBuildFromArchiveV1("u491694131", "chatwizs.com", req);
        console.log("Upload Success:", res.data);
    } catch (e) {
        if (e.response) {
            console.error("API Error Status:", e.response.status);
            console.error("API Error Data:", JSON.stringify(e.response.data, null, 2));
        } else {
            console.error("General Error:", e.message);
        }
    }
}

run();
