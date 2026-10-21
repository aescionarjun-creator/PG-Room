import { prisma } from "./prisma";
import crypto from "crypto";

const HOLD_DURATION_MINUTES = 15;
const CLEANING_BUFFER_MINUTES = 60; // 1-hour buffer between checkouts and next check-in

/**
 * Release all expired holds. Called before checking availability or allocating.
 */
export async function cleanupExpiredHolds(): Promise<number> {
  const now = new Date();
  const deleted = await prisma.inventoryHold.deleteMany({
    where: {
      expiresAt: { lt: now },
    },
  });
  return deleted.count;
}

/**
 * Check if a specific inventory unit is available in the target window.
 */
export async function isUnitAvailable(
  inventoryUnitId: string,
  startTime: Date,
  endTime: Date,
  excludeHoldToken?: string
): Promise<boolean> {
  await cleanupExpiredHolds();

  // Buffer: expand window with cleaning buffer
  const bufferedStart = new Date(startTime.getTime() - CLEANING_BUFFER_MINUTES * 60 * 1000);
  const bufferedEnd = new Date(endTime.getTime() + CLEANING_BUFFER_MINUTES * 60 * 1000);

  // 1. Check existing confirmed bookings
  const overlappingBookings = await prisma.booking.findFirst({
    where: {
      inventoryUnitId,
      status: { in: ["CONFIRMED", "CHECKED_IN", "PENDING"] },
      paymentStatus: { in: ["PAID", "HELD"] },
      AND: [
        { startTime: { lt: bufferedEnd } },
        { endTime: { gt: bufferedStart } },
      ],
    },
  });

  if (overlappingBookings) return false;

  // 2. Check availability blocks (maintenance, cleaning)
  const block = await prisma.availabilityBlock.findFirst({
    where: {
      inventoryUnitId,
      AND: [
        { startTime: { lt: bufferedEnd } },
        { endTime: { gt: bufferedStart } },
      ],
    },
  });

  if (block) return false;

  // 3. Check active inventory holds
  const hold = await prisma.inventoryHold.findFirst({
    where: {
      inventoryUnitId,
      expiresAt: { gt: new Date() },
      token: excludeHoldToken ? { not: excludeHoldToken } : undefined,
      AND: [
        { startTime: { lt: bufferedEnd } },
        { endTime: { gt: bufferedStart } },
      ],
    },
  });

  if (hold) return false;

  return true;
}

/**
 * Find available units for a given RoomType and time range.
 * For private rooms, if any bed in that room is booked, the room is not available.
 * For sharing rooms, returns available individual beds.
 */
export async function findAvailableUnits(
  roomTypeId: string,
  startTime: Date,
  endTime: Date,
  excludeHoldToken?: string
) {
  await cleanupExpiredHolds();

  const roomType = await prisma.roomType.findUnique({
    where: { id: roomTypeId },
    include: {
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

  if (!roomType) return [];

  const availableUnits: {
    unitId: string;
    roomId: string;
    roomNumber: string;
    identifier: string;
    isBed: boolean;
  }[] = [];

  for (const room of roomType.rooms) {
    if (roomType.category === "PRIVATE") {
      // Entire room must be free
      let allUnitsInRoomFree = true;
      for (const unit of room.inventoryUnits) {
        const free = await isUnitAvailable(unit.id, startTime, endTime, excludeHoldToken);
        if (!free) {
          allUnitsInRoomFree = false;
          break;
        }
      }
      if (allUnitsInRoomFree && room.inventoryUnits.length > 0) {
        // Return primary unit for room
        availableUnits.push({
          unitId: room.inventoryUnits[0].id,
          roomId: room.id,
          roomNumber: room.roomNumber,
          identifier: `Room ${room.roomNumber}`,
          isBed: false,
        });
      }
    } else {
      // Sharing room: check each bed individually
      for (const unit of room.inventoryUnits) {
        const free = await isUnitAvailable(unit.id, startTime, endTime, excludeHoldToken);
        if (free) {
          availableUnits.push({
            unitId: unit.id,
            roomId: room.id,
            roomNumber: room.roomNumber,
            identifier: `${unit.identifier} (Room ${room.roomNumber})`,
            isBed: true,
          });
        }
      }
    }
  }

  return availableUnits;
}

/**
 * Create a temporary hold for checkout with 15-minute expiration.
 */
export async function createInventoryHold(params: {
  roomTypeId: string;
  inventoryUnitId?: string;
  durationType: string;
  startTime: Date;
  endTime: Date;
  guestEmail?: string;
}): Promise<{ success: boolean; token?: string; expiresAt?: Date; unit?: any; error?: string }> {
  await cleanupExpiredHolds();

  // If unitId specified, verify availability
  let targetUnitId = params.inventoryUnitId;

  if (targetUnitId) {
    const available = await isUnitAvailable(targetUnitId, params.startTime, params.endTime);
    if (!available) {
      return { success: false, error: "The selected bed or room is no longer available for these dates." };
    }
  } else {
    // Automatically select first available unit
    const units = await findAvailableUnits(params.roomTypeId, params.startTime, params.endTime);
    if (units.length === 0) {
      return { success: false, error: "No beds or rooms are currently available for the selected dates." };
    }
    targetUnitId = units[0].unitId;
  }

  const token = `hold_${crypto.randomBytes(16).toString("hex")}`;
  const expiresAt = new Date(Date.now() + HOLD_DURATION_MINUTES * 60 * 1000);

  const hold = await prisma.inventoryHold.create({
    data: {
      token,
      roomTypeId: params.roomTypeId,
      inventoryUnitId: targetUnitId,
      durationType: params.durationType,
      startTime: params.startTime,
      endTime: params.endTime,
      expiresAt,
      guestEmail: params.guestEmail,
    },
    include: {
      inventoryUnit: {
        include: {
          room: true,
        },
      },
    },
  });

  return {
    success: true,
    token: hold.token,
    expiresAt: hold.expiresAt,
    unit: hold.inventoryUnit,
  };
}

/**
 * Release an active hold (e.g., if checkout is cancelled).
 */
export async function releaseInventoryHold(token: string) {
  try {
    await prisma.inventoryHold.delete({
      where: { token },
    });
    return true;
  } catch {
    return false;
  }
}
