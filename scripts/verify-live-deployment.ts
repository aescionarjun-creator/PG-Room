async function testUrl(urlPath: string) {
  const fullUrl = `https://stayzy-dac67.web.app${urlPath}`;
  try {
    const res = await fetch(fullUrl);
    console.log(`[${res.status}] ${urlPath} -> Content-Type: ${res.headers.get("content-type")}`);
    if (res.ok) {
      const text = await res.text();
      const titleMatch = text.match(/<title>([^<]+)<\/title>/);
      const title = titleMatch ? titleMatch[1] : "(no title)";
      console.log(`       Title: "${title.trim()}", HTML length: ${text.length}`);
    }
  } catch (err: any) {
    console.log(`[ERROR] ${urlPath}: ${err.message}`);
  }
}

async function main() {
  console.log("=== VERIFYING LIVE FIREBASE DEPLOYMENT ===");
  await testUrl("/");
  await testUrl("/rooms");
  await testUrl("/rooms/urban-minimalist-studio");
  await testUrl("/about");
  await testUrl("/contact");
  await testUrl("/api/rooms");
  await testUrl("/fallback-room.jpg");
  console.log("=== LIVE VERIFICATION COMPLETE ===");
}

main().catch(console.error);
