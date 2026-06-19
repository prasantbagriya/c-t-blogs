const token = "wQ3RDKhNzln1rit5Z6QYKI5kc33UMxBMy6wxAmrld9a8bbbb";

async function testApi() {
  try {
    const res = await fetch("https://api.hostinger.com/api/v1/vps", {
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    });
    
    if (res.ok) {
      const data = await res.json();
      console.log("Success! VPS data:", JSON.stringify(data, null, 2));
    } else {
      console.error("Failed:", res.status, res.statusText);
      const text = await res.text();
      console.error(text);
    }
  } catch (err) {
    console.error("Error:", err);
  }
}

testApi();
