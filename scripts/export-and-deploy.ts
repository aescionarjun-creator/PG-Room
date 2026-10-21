import fs from "fs";
import path from "path";
import { execSync } from "child_process";

async function main() {
  const rootDir = process.cwd();
  const stagingDir = path.join(path.dirname(rootDir), "Stayzy-Export-Stage");
  console.log("=== Root Dir:", rootDir);
  console.log("=== Staging Dir:", stagingDir);

  // 1. Fetch pre-cached /api/rooms data from localhost:3000
  let roomsJson = "";
  try {
    const res = await fetch("http://localhost:3000/api/rooms");
    if (res.ok) {
      roomsJson = await res.text();
      console.log(`Fetched /api/rooms (${roomsJson.length} bytes)`);
    }
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

  // 2. Clean previous staging dir if exists
  if (fs.existsSync(stagingDir)) {
    console.log("Cleaning existing staging directory...");
    // Remove junction first if it exists
    const junctionPath = path.join(stagingDir, "node_modules");
    if (fs.existsSync(junctionPath)) {
      try {
        fs.unlinkSync(junctionPath);
      } catch {}
    }
    fs.rmSync(stagingDir, { recursive: true, force: true });
  }
  fs.mkdirSync(stagingDir, { recursive: true });

  try {
    console.log("=== Creating junction for node_modules ===");
    fs.symlinkSync(path.join(rootDir, "node_modules"), path.join(stagingDir, "node_modules"), "junction");

    console.log("=== Copying configuration files ===");
    fs.copyFileSync(path.join(rootDir, "package.json"), path.join(stagingDir, "package.json"));
    fs.copyFileSync(path.join(rootDir, "tsconfig.json"), path.join(stagingDir, "tsconfig.json"));
    if (fs.existsSync(path.join(rootDir, ".env"))) {
      fs.copyFileSync(path.join(rootDir, ".env"), path.join(stagingDir, ".env"));
    }

    // Copy prisma directory
    fs.cpSync(path.join(rootDir, "prisma"), path.join(stagingDir, "prisma"), { recursive: true });

    // Copy public directory
    fs.cpSync(path.join(rootDir, "public"), path.join(stagingDir, "public"), { recursive: true });

    // Copy src directory, excluding src/app/api
    console.log("=== Copying src (omitting src/app/api for static export) ===");
    fs.cpSync(path.join(rootDir, "src"), path.join(stagingDir, "src"), {
      recursive: true,
      filter: (srcPath) => {
        const norm = srcPath.replace(/\\/g, "/");
        if (norm.includes("src/app/api")) return false;
        return true;
      },
    });

    // Write next.config.ts with output: 'export'
    const nextConfigContent = `import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "plus.unsplash.com",
      },
    ],
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
`;
    fs.writeFileSync(path.join(stagingDir, "next.config.ts"), nextConfigContent, "utf8");

    console.log("=== Running next build in staging directory ===");
    execSync("npx next build", {
      stdio: "inherit",
      cwd: stagingDir,
    });

    console.log("=== Copying out/ directory to workspace ===");
    const stagingOut = path.join(stagingDir, "out");
    const workspaceOut = path.join(rootDir, "out");
    if (fs.existsSync(workspaceOut)) {
      fs.rmSync(workspaceOut, { recursive: true, force: true });
    }
    fs.cpSync(stagingOut, workspaceOut, { recursive: true });

    // Add static api/rooms.json and fallback
    const outApiDir = path.join(workspaceOut, "api");
    if (!fs.existsSync(outApiDir)) fs.mkdirSync(outApiDir, { recursive: true });
    fs.writeFileSync(path.join(outApiDir, "rooms.json"), roomsJson, "utf8");
    fs.writeFileSync(path.join(outApiDir, "rooms"), roomsJson, "utf8");
    const outRoomsDir = path.join(outApiDir, "rooms");
    if (!fs.existsSync(outRoomsDir)) fs.mkdirSync(outRoomsDir, { recursive: true });
    fs.writeFileSync(path.join(outRoomsDir, "index.html"), roomsJson, "utf8");

    // Copy fallback image
    const fallbackSrc = path.join(rootDir, "public", "fallback-room.jpg");
    if (fs.existsSync(fallbackSrc)) {
      fs.copyFileSync(fallbackSrc, path.join(workspaceOut, "fallback-room.jpg"));
    }

    console.log("=== Updating firebase.json for static hosting ===");
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

    console.log("=== Deploying to Firebase Hosting ===");
    execSync("cmd.exe /c \"firebase deploy --only hosting --non-interactive\"", {
      stdio: "inherit",
      cwd: rootDir,
    });
    console.log("=== FIREBASE HOSTING DEPLOYMENT SUCCESSFUL ===");
  } finally {
    console.log("=== Cleaning up staging directory ===");
    const junctionPath = path.join(stagingDir, "node_modules");
    if (fs.existsSync(junctionPath)) {
      try {
        fs.unlinkSync(junctionPath);
      } catch {}
    }
    try {
      fs.rmSync(stagingDir, { recursive: true, force: true });
    } catch {}
  }
}

main().catch((err) => {
  console.error("FATAL ERROR:", err);
  process.exit(1);
});
