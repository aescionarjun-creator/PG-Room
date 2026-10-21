import fs from "fs";
import path from "path";

async function main() {
  const url = "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=1200&q=80";
  console.log("Fetching fallback image from:", url);
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to download: ${res.status} ${res.statusText}`);
  }
  const buffer = await res.arrayBuffer();
  const outPath = path.join(process.cwd(), "public", "fallback-room.jpg");
  fs.writeFileSync(outPath, Buffer.from(buffer));
  console.log("Successfully saved fallback image to:", outPath, `(${buffer.byteLength} bytes)`);
}

main().catch(console.error);
