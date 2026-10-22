import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

// Initialize DATABASE_URL if missing or running in serverless / Vercel
function setupDatabaseUrl(): string {
  // If user provided a remote database (Postgres, MySQL, etc.) or explicit non-file URL
  if (process.env.DATABASE_URL && !process.env.DATABASE_URL.startsWith("file:")) {
    return process.env.DATABASE_URL;
  }

  const isVercel = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);
  const cwd = process.cwd();

  if (isVercel) {
    // In Vercel serverless functions, the root directory (/var/task) is read-only.
    // Copy the seeded dev.db to /tmp which is writable.
    const tmpDir = "/tmp";
    const tmpDbPath = path.join(tmpDir, "dev.db");
    const sourceDbPath = path.join(cwd, "prisma", "dev.db");

    try {
      if (!fs.existsSync(tmpDbPath)) {
        if (fs.existsSync(sourceDbPath)) {
          fs.copyFileSync(sourceDbPath, tmpDbPath);
          console.log(`[Stayzy Prisma] Seeded SQLite DB copied to ${tmpDbPath}`);
        } else {
          console.warn(`[Stayzy Prisma] Source DB not found at ${sourceDbPath}`);
        }
      }
      const dbUrl = `file:${tmpDbPath}`;
      process.env.DATABASE_URL = dbUrl;
      return dbUrl;
    } catch (err) {
      console.error("[Stayzy Prisma] Failed setting up /tmp SQLite database:", err);
    }
  }

  // Local or standard fallback
  if (!process.env.DATABASE_URL) {
    const localDbPath = path.join(cwd, "prisma", "dev.db");
    if (fs.existsSync(localDbPath)) {
      process.env.DATABASE_URL = `file:${localDbPath}`;
    } else {
      process.env.DATABASE_URL = "file:./dev.db";
    }
  }

  return process.env.DATABASE_URL;
}

const dbUrl = setupDatabaseUrl();

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    datasourceUrl: dbUrl,
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;

