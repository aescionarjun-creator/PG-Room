import { prisma } from "../src/lib/prisma";
import { hashPassword } from "../src/lib/auth";

async function provisionAdmin() {
  const email = process.argv[2] || process.env.ADMIN_EMAIL || "admin@stayzy.com";
  const password = process.argv[3] || process.env.ADMIN_PASSWORD || "admin123";
  const name = process.argv[4] || "Stayzy Operations Director";
  const phone = process.argv[5] || "+91 80 4567 8900";

  console.log(`[Stayzy Security] Provisioning administrator account for: ${email}`);

  const passwordHash = hashPassword(password);

  const adminUser = await prisma.user.upsert({
    where: { email },
    update: {
      role: "ADMIN",
      name,
      phone,
      passwordHash,
    },
    create: {
      email,
      name,
      phone,
      role: "ADMIN",
      passwordHash,
    },
  });

  // Log to AuditLog
  await prisma.auditLog.create({
    data: {
      adminEmail: email,
      action: "PROVISION_ADMIN_ACCOUNT",
      entityType: "User",
      entityId: adminUser.id,
      details: `Provisioned admin account via CLI script for ${name} (${email})`,
    },
  });

  console.log(`[Stayzy Security] SUCCESS: Admin account successfully provisioned.`);
  console.log(`  User ID: ${adminUser.id}`);
  console.log(`  Role:    ${adminUser.role}`);
  console.log(`  Email:   ${adminUser.email}`);
  console.log(`  Name:    ${adminUser.name}`);
  console.log(`\nYou can now sign in at http://localhost:3000/admin/login with these credentials.`);
}

provisionAdmin()
  .catch((e) => {
    console.error("[Stayzy Security] Failed to provision admin:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
