import http from "http";

async function fetchUrl(url: string): Promise<string> {
  const res = await fetch(url);
  return await res.text();
}

async function main() {
  console.log("Fetching http://localhost:3000/ ...");
  const homeHtml = await fetchUrl("http://localhost:3000/");
  console.log("Home HTML length:", homeHtml.length);

  // Find img tags
  const imgMatches = homeHtml.match(/<img[^>]+>/g) || [];
  console.log(`Found ${imgMatches.length} <img tags in Home HTML:`);
  for (const img of imgMatches.slice(0, 8)) {
    console.log("  IMG:", img);
    const srcMatch = img.match(/src="([^"]+)"/);
    if (srcMatch) {
      const src = srcMatch[1];
      const fullSrc = src.startsWith("http") ? src : `http://localhost:3000${src}`;
      try {
        const imgRes = await fetch(fullSrc);
        console.log(`    Status: ${imgRes.status} Content-Type: ${imgRes.headers.get("content-type")}`);
      } catch (err: any) {
        console.log(`    Fetch error: ${err.message}`);
      }
    }
  }

  console.log("\nFetching http://localhost:3000/rooms ...");
  const roomsHtml = await fetchUrl("http://localhost:3000/rooms");
  console.log("Rooms HTML length:", roomsHtml.length);
  const roomImgs = roomsHtml.match(/<img[^>]+>/g) || [];
  console.log(`Found ${roomImgs.length} <img tags in Rooms HTML:`);
  for (const img of roomImgs.slice(0, 5)) {
    console.log("  ROOM IMG:", img);
  }
}

main().catch(console.error);
