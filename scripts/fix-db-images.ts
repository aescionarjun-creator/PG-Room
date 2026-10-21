import { prisma } from "../src/lib/prisma";

async function main() {
  const newImages = JSON.stringify([
    "https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1200&q=80",
  ]);

  const updated = await prisma.roomType.updateMany({
    where: { slug: "urban-minimalist-studio" },
    data: { images: newImages },
  });

  console.log(`Updated ${updated.count} roomType records for urban-minimalist-studio.`);
}

main()
  .catch((err) => console.error(err))
  .finally(() => prisma.$disconnect());
