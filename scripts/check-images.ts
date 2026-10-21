import fs from "fs";
import https from "https";

const filesToCheck = [
  "./prisma/seed.ts",
  "./src/components/home/Hero.tsx",
  "./src/components/home/LifestyleSection.tsx",
  "./src/components/home/FindYourSpace.tsx",
  "./src/components/home/AmenitiesPhotoGallery.tsx",
  "./src/app/admin/rooms/page.tsx",
  "./src/app/admin/properties/page.tsx",
];

const allUrls = new Set<string>();

for (const file of filesToCheck) {
  if (fs.existsSync(file)) {
    const content = fs.readFileSync(file, "utf8");
    const matches = content.match(/https:\/\/images\.unsplash\.com\/[^\",\s]+/g) || [];
    for (const m of matches) {
      allUrls.add(m);
    }
  }
}

async function checkUrl(url: string): Promise<{ url: string; status: number | string }> {
  return new Promise((resolve) => {
    const req = https.request(url, { method: "HEAD", timeout: 8000 }, (res) => {
      resolve({ url, status: res.statusCode || 0 });
    });
    req.on("error", (e) => resolve({ url, status: e.message }));
    req.on("timeout", () => {
      req.destroy();
      resolve({ url, status: "TIMEOUT" });
    });
    req.end();
  });
}

async function run() {
  console.log(`Checking ${allUrls.size} unique Unsplash URLs across codebase...`);
  const badUrls: Array<{ url: string; status: number | string }> = [];
  for (const url of Array.from(allUrls)) {
    const res = await checkUrl(url);
    if (res.status !== 200 && res.status !== 301 && res.status !== 302) {
      console.log(`❌ BAD [${res.status}]: ${url}`);
      badUrls.push(res);
    } else {
      console.log(`✅ OK [${res.status}]: ${url.substring(0, 75)}`);
    }
  }
  console.log(`\nFound ${badUrls.length} bad URLs out of ${allUrls.size}.`);
}

run();
