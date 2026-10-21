import fs from "fs";
import path from "path";
import { execSync } from "child_process";

async function main() {
  console.log("=== STEP 1: Pre-caching dynamic API data ===");
  let roomsJson = "";
  let contentJson = "";

  try {
    const res = await fetch("http://localhost:3000/api/rooms");
    if (res.ok) {
      roomsJson = await res.text();
      console.log(`Fetched /api/rooms (${roomsJson.length} bytes)`);
    }
  } catch (e: any) {
    console.log("Dev server not responding, will fallback to database query");
  }

  if (!roomsJson) {
    const { prisma } = await import("../src/lib/prisma");
    const roomTypes = await prisma.roomType.findMany({
      include: {
        property: true,
        ratePlans: { where: { isEnabled: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    const enriched = roomTypes.map((rt) => ({
      ...rt,
      images: JSON.parse(rt.images || "[]"),
      keyAmenities: JSON.parse(rt.keyAmenities || "[]"),
      currentRatePlan: rt.ratePlans.find((r) => r.durationType === "MONTHLY") || rt.ratePlans[0],
      allRatePlans: rt.ratePlans,
      isAvailable: true,
      availableCount: 3,
    }));
    roomsJson = JSON.stringify({ success: true, rooms: enriched });
  }

  try {
    const { prisma } = await import("../src/lib/prisma");
    const contents = await prisma.siteContent.findMany();
    const map: Record<string, any> = {};
    for (const c of contents) {
      try {
        map[c.key] = JSON.parse(c.value);
      } catch {
        map[c.key] = c.value;
      }
    }
    contentJson = JSON.stringify({ success: true, content: map });
  } catch {
    contentJson = JSON.stringify({ success: true, content: {} });
  }

  const projectDir = process.cwd();
  const apiDir = path.join(projectDir, "src", "app", "api");
  const tempApiDir = path.join(projectDir, "src", "api-backup-temp");
  const nextConfigPath = path.join(projectDir, "next.config.ts");
  const originalNextConfig = fs.readFileSync(nextConfigPath, "utf8");

  try {
    console.log("=== STEP 2: Preparing Next.js static export ===");
    // Temporarily move API routes so static export does not fail
    if (fs.existsSync(apiDir)) {
      if (fs.existsSync(tempApiDir)) {
        fs.rmSync(tempApiDir, { recursive: true, force: true });
      }
      fs.renameSync(apiDir, tempApiDir);
      console.log("Temporarily moved src/app/api -> src/api-backup-temp");
    }

    // Set output: "export" in next.config.ts
    const exportConfig = originalNextConfig.replace(
      /output:\s*["']standalone["']/,
      'output: "export"'
    );
    fs.writeFileSync(nextConfigPath, exportConfig, "utf8");
    console.log("Configured next.config.ts with output: 'export'");

    console.log("=== STEP 3: Running production build (next build) ===");
    execSync("npx next build", { stdio: "inherit", cwd: projectDir });

    console.log("=== STEP 4: Creating static JSON endpoints in out/ ===");
    const outDir = path.join(projectDir, "out");
    const outApiDir = path.join(outDir, "api");
    if (!fs.existsSync(outApiDir)) {
      fs.mkdirSync(outApiDir, { recursive: true });
    }

    // Write out/api/rooms (both as file and as index.html so both /api/rooms and /api/rooms/ work)
    fs.writeFileSync(path.join(outApiDir, "rooms"), roomsJson, "utf8");
    fs.writeFileSync(path.join(outApiDir, "rooms.json"), roomsJson, "utf8");
    const outRoomsDir = path.join(outApiDir, "rooms");
    if (!fs.existsSync(outRoomsDir)) fs.mkdirSync(outRoomsDir, { recursive: true });
    fs.writeFileSync(path.join(outRoomsDir, "index.html"), roomsJson, "utf8");

    // Write out/api/content
    fs.writeFileSync(path.join(outApiDir, "content"), contentJson, "utf8");
    fs.writeFileSync(path.join(outApiDir, "content.json"), contentJson, "utf8");
    const outContentDir = path.join(outApiDir, "content");
    if (!fs.existsSync(outContentDir)) fs.mkdirSync(outContentDir, { recursive: true });
    fs.writeFileSync(path.join(outContentDir, "index.html"), contentJson, "utf8");

    // Ensure fallback image exists in out/
    const fallbackSrc = path.join(projectDir, "public", "fallback-room.jpg");
    if (fs.existsSync(fallbackSrc)) {
      fs.copyFileSync(fallbackSrc, path.join(outDir, "fallback-room.jpg"));
    }

    // Check index.html exists
    const indexHtmlPath = path.join(outDir, "index.html");
    if (fs.existsSync(indexHtmlPath)) {
      const stat = fs.statSync(indexHtmlPath);
      console.log(`Verified out/index.html generated (${stat.size} bytes)`);
    } else {
      throw new Error("out/index.html was not generated!");
    }

    console.log("=== STEP 5: Updating firebase.json to point to out ===");
    const firebaseJson = {
      hosting: {
        public: "out",
        ignore: ["firebase.json", "**/.*", "**/node_modules/**"],
        cleanUrls: true,
        trailingSlash: false,
        rewrites: [
          {
            source: "/api/rooms",
            destination: "/api/rooms.json",
          },
          {
            source: "/api/content",
            destination: "/api/content.json",
          },
          {
            source: "**",
            destination: "/index.html",
          },
        ],
      },
    };
    fs.writeFileSync(
      path.join(projectDir, "firebase.json"),
      JSON.stringify(firebaseJson, null, 2),
      "utf8"
    );
    console.log("Updated firebase.json with public: 'out' and clean SPA rewrites");
  } finally {
    // ALWAYS restore original files
    console.log("=== Restoring source files ===");
    if (fs.existsSync(tempApiDir)) {
      if (fs.existsSync(apiDir)) {
        fs.rmSync(apiDir, { recursive: true, force: true });
      }
      fs.renameSync(tempApiDir, apiDir);
      console.log("Restored src/app/api");
    }
    fs.writeFileSync(nextConfigPath, originalNextConfig, "utf8");
    console.log("Restored next.config.ts");
  }

  console.log("=== STEP 6: Deploying to Firebase Hosting ===");
  execSync("cmd.exe /c \"firebase deploy --only hosting --non-interactive\"", {
    stdio: "inherit",
    cwd: projectDir,
  });
  console.log("=== DEPLOYMENT COMPLETE ===");
}

main().catch((err) => {
  console.error("FATAL ERROR in build-and-deploy:", err);
  process.exit(1);
});
