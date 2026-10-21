"use client";

const FAVORITES_KEY = "stayzy_saved_rooms";

export interface SavedRoom {
  id: string;
  name: string;
  slug: string;
  category: string;
  property: {
    name: string;
    city: string;
    address: string;
  };
  image: string;
  price: number;
  durationType: string;
  hasAc: boolean;
  savedAt: string;
}

export function getSavedRooms(): SavedRoom[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(FAVORITES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function isRoomSaved(roomId: string): boolean {
  const rooms = getSavedRooms();
  return rooms.some((r) => r.id === roomId);
}

export function toggleSaveRoom(room: {
  id: string;
  name: string;
  slug: string;
  category: string;
  property: {
    name: string;
    city: string;
    address: string;
  };
  image: string;
  price: number;
  durationType: string;
  hasAc: boolean;
}): boolean {
  if (typeof window === "undefined") return false;
  try {
    const rooms = getSavedRooms();
    const existsIndex = rooms.findIndex((r) => r.id === room.id);
    let nowSaved = false;

    if (existsIndex >= 0) {
      rooms.splice(existsIndex, 1);
      nowSaved = false;
    } else {
      rooms.unshift({
        ...room,
        savedAt: new Date().toISOString(),
      });
      nowSaved = true;
    }

    localStorage.setItem(FAVORITES_KEY, JSON.stringify(rooms));
    window.dispatchEvent(new Event("stayzy_favorites_updated"));
    return nowSaved;
  } catch {
    return false;
  }
}
