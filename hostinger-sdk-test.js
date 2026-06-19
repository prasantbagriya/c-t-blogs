import pkg from "hostinger-api-sdk";
const { Configuration, HostingNodeJSApi } = pkg;

const token = "wQ3RDKhNzln1rit5Z6QYKI5kc33UMxBMy6wxAmrld9a8bbbb";

async function run() {
    try {
        const conf = new Configuration({ accessToken: token });
        const api = new HostingNodeJSApi(conf);
        console.log("Methods:", Object.getOwnPropertyNames(Object.getPrototypeOf(api)));
        
        // Let's also check if we can list NodeJS applications
        // First we need to find what methods are available to list or create
    } catch (e) {
        console.error("General Error:", e);
    }
}

run();
