import fs from "fs";

async function testPage(path: string) {
  console.log(`\n================ Testing ${path} ================`);
  const res = await fetch(`http://localhost:3000${path}`);
  console.log(`Page Status: ${res.status}`);
  const html = await res.text();
  const imgMatches = html.match(/<img[^>]+>/g) || [];
  console.log(`Found ${imgMatches.length} <img tags:`);
  for (const img of imgMatches.slice(0, 6)) {
    const srcMatch = img.match(/src="([^"]+)"/);
    const altMatch = img.match(/alt="([^"]*)"/);
    const src = srcMatch ? srcMatch[1] : "(no src)";
    const alt = altMatch ? altMatch[1] : "(no alt)";
    const fullSrc = src.startsWith("http") ? src : `http://localhost:3000${src}`;
    try {
      const imgRes = await fetch(fullSrc);
      console.log(`  - [${imgRes.status}] [${imgRes.headers.get("content-type")}] ALT: "${alt.slice(0, 40)}" SRC: ${src.slice(0, 60)}...`);
    } catch (e: any) {
      console.log(`  - [ERROR] ${e.message} SRC: ${src}`);
    }
  }
}

async function main() {
  await testPage("/");
  await testPage("/rooms/urban-minimalist-studio");
  await testPage("/about");
  await testPage("/contact");
}

main().catch(console.error);
