import fs from "fs";
import path from "path";
import { execSync } from "child_process";

const ROUTES = [
  "/",
  "/rooms",
  "/explore",
  "/about",
  "/contact",
  "/amenities",
  "/faq",
  "/privacy",
  "/terms",
  "/cancellation-policy",
  "/login",
  "/register",
  "/dashboard",
  "/dashboard/saved",
  "/dashboard/bookings",
  "/admin",
  "/admin/rooms",
  "/admin/properties",
  "/admin/rates",
  "/admin/calendar",
  "/admin/bookings",
  "/admin/beds",
  "/admin/customers",
  "/admin/payments",
  "/admin/support",
  "/admin/settings",
];

async function main() {
  const rootDir = process.cwd();
  const outDir = path.join(rootDir, "out");

  console.log("=== STEP 1: Preparing out/ directory ===");
  if (fs.existsSync(outDir)) {
    fs.rmSync(outDir, { recursive: true, force: true });
  }
  fs.mkdirSync(outDir, { recursive: true });

  // 1. Copy public assets
  const publicDir = path.join(rootDir, "public");
  if (fs.existsSync(publicDir)) {
    console.log("Copying public assets to out/...");
    fs.cpSync(publicDir, outDir, { recursive: true });
  }

  // 2. Copy .next/static to out/_next/static
  const nextStaticDir = path.join(rootDir, ".next", "static");
  const outNextStaticDir = path.join(outDir, "_next", "static");
  if (fs.existsSync(nextStaticDir)) {
    console.log("Copying .next/static to out/_next/static...");
    fs.mkdirSync(path.join(outDir, "_next"), { recursive: true });
    fs.cpSync(nextStaticDir, outNextStaticDir, { recursive: true });
  } else {
    throw new Error(".next/static does not exist! Please run npm run build first.");
  }

  // 3. Pre-fetch API data and write to out/api/
  console.log("Fetching /api/rooms...");
  let roomsJson = "";
  try {
    const res = await fetch("http://localhost:3000/api/rooms");
    if (res.ok) roomsJson = await res.text();
  } catch {}

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

  const outApiDir = path.join(outDir, "api");
  fs.mkdirSync(outApiDir, { recursive: true });
  fs.writeFileSync(path.join(outApiDir, "rooms.json"), roomsJson, "utf8");
  fs.writeFileSync(path.join(outApiDir, "rooms"), roomsJson, "utf8");

  // 4. Get all room slugs
  const { prisma } = await import("../src/lib/prisma");
  const allRooms = await prisma.roomType.findMany({ select: { slug: true } });
  const allRoutes = [...ROUTES, ...allRooms.map((r) => `/rooms/${r.slug}`)];

  console.log(`=== STEP 2: Pre-rendering ${allRoutes.length} pages from dev server ===`);
  for (const route of allRoutes) {
    try {
      const url = `http://localhost:3000${route}`;
      const res = await fetch(url);
      if (!res.ok) {
        console.warn(`Warning: ${route} returned status ${res.status}`);
        continue;
      }
      const html = await res.text();

      // Determine output file path
      let filePath = "";
      if (route === "/") {
        filePath = path.join(outDir, "index.html");
      } else {
        const subDir = path.join(outDir, ...route.split("/").filter(Boolean));
        fs.mkdirSync(subDir, { recursive: true });
        filePath = path.join(subDir, "index.html");
      }
      fs.writeFileSync(filePath, html, "utf8");
      console.log(`  ✓ ${route} -> ${path.relative(rootDir, filePath)}`);
    } catch (err: any) {
      console.error(`  ✗ Error rendering ${route}:`, err.message);
    }
  }

  // 5. Ensure fallback-room.jpg exists in out
  const fallbackSrc = path.join(publicDir, "fallback-room.jpg");
  if (fs.existsSync(fallbackSrc)) {
    fs.copyFileSync(fallbackSrc, path.join(outDir, "fallback-room.jpg"));
  }

  console.log("=== STEP 3: Updating firebase.json ===");
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
          source: "**",
          destination: "/index.html",
        },
      ],
    },
  };
  fs.writeFileSync(
    path.join(rootDir, "firebase.json"),
    JSON.stringify(firebaseJson, null, 2),
    "utf8"
  );
  console.log("Updated firebase.json with public: 'out' and cleanUrls");

  console.log("=== STEP 4: Deploying to Firebase Hosting ===");
  execSync("cmd.exe /c \"firebase deploy --only hosting --non-interactive\"", {
    stdio: "inherit",
    cwd: rootDir,
  });
  console.log("=== FIREBASE HOSTING DEPLOYMENT FINISHED SUCCESSFULLY! ===");
}

main().catch((err) => {
  console.error("FATAL ERROR in generate-static-site:", err);
  process.exit(1);
});
