import React from "react";
import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import { DemoBanner } from "@/components/common/DemoBanner";
import { Navbar } from "@/components/common/Navbar";
import { Footer } from "@/components/common/Footer";
import { RoomDetailsClient } from "./RoomDetailsClient";

export default async function RoomDetailsPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  const { slug } = await params;
  const query = await searchParams;

  const roomType = await prisma.roomType.findUnique({
    where: { slug },
    include: {
      property: true,
      ratePlans: {
        where: { isEnabled: true },
        orderBy: { durationType: "asc" },
      },
      rooms: {
        where: { status: "ACTIVE" },
        include: {
          inventoryUnits: {
            where: { status: "AVAILABLE" },
          },
        },
      },
    },
  });

  if (!roomType) {
    notFound();
  }

  let images: string[] = [];
  try {
    images = JSON.parse(roomType.images);
  } catch {
    images = [];
  }
  if (images.length === 0) {
    images = [roomType.property.coverImage];
  }

  let keyAmenities: string[] = [];
  try {
    keyAmenities = JSON.parse(roomType.keyAmenities);
  } catch {
    keyAmenities = [];
  }

  const availableUnits = roomType.rooms.reduce(
    (acc, r) => acc + r.inventoryUnits.length,
    0
  );

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F7F2]">
      <DemoBanner />
      <Navbar />
      <main className="flex-1">
        <RoomDetailsClient
          room={{
            ...roomType,
            images,
            keyAmenities,
            availableUnits,
          }}
          initialParams={query}
        />
      </main>
      <Footer />
    </div>
  );
}
