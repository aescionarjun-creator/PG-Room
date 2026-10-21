import { prisma } from "../src/lib/prisma";

async function main() {
  const rooms = await prisma.roomType.findMany({
    include: { property: true },
  });
  console.log(`Checking ${rooms.length} rooms in DB:`);
  for (const r of rooms) {
    const imgs = JSON.parse(r.images);
    console.log(`- ${r.name} (${r.slug}): ${imgs.length} images. First: ${imgs[0]}`);
  }
}

main().catch(console.error);
