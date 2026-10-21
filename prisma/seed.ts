import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding Stayzy database with 18+ comprehensive listings...");

  // Clean existing transactional & inventory data
  await prisma.refund.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.paymentSchedule.deleteMany();
  await prisma.bookingItem.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.inventoryHold.deleteMany();
  await prisma.availabilityBlock.deleteMany();
  await prisma.inventoryUnit.deleteMany();
  await prisma.room.deleteMany();
  await prisma.ratePlan.deleteMany();
  await prisma.roomType.deleteMany();
  await prisma.visitRequest.deleteMany();
  await prisma.supportTicket.deleteMany();
  await prisma.property.deleteMany();
  await prisma.user.deleteMany();
  await prisma.siteContent.deleteMany();
  await prisma.auditLog.deleteMany();

  // 1. Users
  const admin = await prisma.user.create({
    data: {
      email: "admin@stayzy.com",
      name: "Stayzy Ops Admin",
      phone: "+91 98765 43210",
      role: "ADMIN",
      passwordHash: "stayzy_admin_2026",
    },
  });

  const demoCustomer = await prisma.user.create({
    data: {
      email: "aarav.sharma@example.com",
      name: "Aarav Sharma",
      phone: "+91 98765 12345",
      role: "CUSTOMER",
      passwordHash: "stayzy_guest_2026",
    },
  });

  // 2. Properties
  const propKoramangala = await prisma.property.create({
    data: {
      name: "Stayzy Haven — Koramangala",
      slug: "stayzy-haven-koramangala",
      tagline: "Prime co-living nestled near 80 Feet Road & Sony World Signal",
      description:
        "Stayzy Haven Koramangala is crafted for modern working professionals and students. Featuring 300 Mbps Wi-Fi, ergonomic work pods, rooftop cafe terrace, and daily nutritious home-cooked meals.",
      address: "Plot 42, 4th Block, 80 Feet Road, Near Sony Signal, Koramangala",
      city: "Bengaluru",
      state: "Karnataka",
      pincode: "560034",
      contactPhone: "+91 80 4567 8900",
      contactEmail: "koramangala@stayzy.in",
      rules: "Quiet hours: 10:30 PM to 6:30 AM. Visitors allowed in lounge till 8:00 PM. Alcohol/smoking restricted to designated rooftop zones.",
      checkInTime: "12:00 PM",
      checkOutTime: "11:00 AM",
      timezone: "Asia/Kolkata",
      coverImage: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80",
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=1200&q=80",
      ]),
    },
  });

  const propHSR = await prisma.property.create({
    data: {
      name: "Stayzy Heights — HSR Layout",
      slug: "stayzy-heights-hsr-layout",
      tagline: "Serene co-living retreat in Sector 2, near 27th Main",
      description:
        "Stayzy Heights offers tranquil living with leafy avenue views, an indoor gym, communal kitchen, and seamless connectivity to Electronic City and Bellandur tech parks.",
      address: "189, 17th Cross, Sector 2, HSR Layout",
      city: "Bengaluru",
      state: "Karnataka",
      pincode: "560102",
      contactPhone: "+91 80 4567 8901",
      contactEmail: "hsr@stayzy.in",
      rules: "Quiet hours: 11:00 PM to 6:00 AM. Keycard access 24/7. Visitors allowed in lobby area.",
      checkInTime: "12:00 PM",
      checkOutTime: "11:00 AM",
      timezone: "Asia/Kolkata",
      coverImage: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80",
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80",
      ]),
    },
  });

  const propIndiranagar = await prisma.property.create({
    data: {
      name: "Stayzy Urban — Indiranagar",
      slug: "stayzy-urban-indiranagar",
      tagline: "Vibrant living off 100 Feet Road, walking distance to Metro",
      description:
        "Stayzy Urban puts you in the heartbeat of Bengaluru's most creative neighborhood. Steps away from cafes, boutique studios, and quick transit to Central Business District.",
      address: "712, 12th Main Road, HAL 2nd Stage, Indiranagar",
      city: "Bengaluru",
      state: "Karnataka",
      pincode: "560038",
      contactPhone: "+91 80 4567 8902",
      contactEmail: "indiranagar@stayzy.in",
      rules: "Quiet hours: 11:00 PM to 7:00 AM. Biometric access enabled 24/7.",
      checkInTime: "12:00 PM",
      checkOutTime: "11:00 AM",
      timezone: "Asia/Kolkata",
      coverImage: "https://images.unsplash.com/photo-1574362848149-11496d93a7c7?auto=format&fit=crop&w=1200&q=80",
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1574362848149-11496d93a7c7?auto=format&fit=crop&w=1200&q=80",
      ]),
    },
  });

  // 3. Define 18 Varied Stays
  interface StayDefinition {
    property: any;
    name: string;
    slug: string;
    category: "PRIVATE" | "TWIN_SHARING" | "TRIPLE_SHARING";
    description: string;
    sizeSqFt: number;
    baseCapacity: number;
    maxCapacity: number;
    hasAc: boolean;
    bathroomType: "ATTACHED" | "COMMON";
    foodIncluded: boolean;
    foodDetails: string | null;
    keyAmenities: string[];
    images: string[];
    rates: Array<{
      durationType: "HOURLY" | "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY";
      price: number;
      depositAmount: number;
      minDuration?: number;
      maxDuration?: number;
      foodMonthlyCharge?: number;
      allowedHoursStart?: string;
      allowedHoursEnd?: string;
      notes?: string;
    }>;
    roomNumber: string;
    floor: number;
  }

  const stayDefinitions: StayDefinition[] = [
    // 1. Deluxe Private Studio Suite
    {
      property: propKoramangala,
      name: "Deluxe Private Studio Suite",
      slug: "deluxe-private-studio-suite",
      category: "PRIVATE",
      description:
        "A spacious private sanctuary featuring a plush Queen bed, dedicated teak study workstation, 43-inch Smart TV, mini-fridge, and an attached designer bath with instant geyser.",
      sizeSqFt: 220,
      baseCapacity: 1,
      maxCapacity: 2,
      hasAc: true,
      bathroomType: "ATTACHED",
      foodIncluded: false,
      foodDetails: "Optional 3-meal subscription available",
      keyAmenities: ["Attached Washroom", "300 Mbps Wi-Fi & Work Desk", "Daikin Inverter AC", "Mini Refrigerator", "Daily Housekeeping", "Biometric Smart Lock"],
      images: [
        "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&w=1200&q=80",
      ],
      rates: [
        { durationType: "HOURLY", price: 350, depositAmount: 0, minDuration: 2, maxDuration: 10, allowedHoursStart: "08:00", allowedHoursEnd: "22:00", notes: "Min 2 hrs day-stay." },
        { durationType: "DAILY", price: 1800, depositAmount: 1000, minDuration: 1, maxDuration: 14, notes: "Daily checkout at 11:00 AM." },
        { durationType: "WEEKLY", price: 10800, depositAmount: 2500, minDuration: 1, maxDuration: 4, notes: "Weekly rate includes daily housekeeping." },
        { durationType: "MONTHLY", price: 32000, depositAmount: 25000, minDuration: 1, maxDuration: 11, foodMonthlyCharge: 3500, notes: "Metered electricity at state tariff." },
        { durationType: "YEARLY", price: 348000, depositAmount: 32000, minDuration: 1, maxDuration: 3, notes: "Discounted annual lease." },
      ],
      roomNumber: "Room 101",
      floor: 1,
    },

    // 2. Executive Twin Sharing Room
    {
      property: propKoramangala,
      name: "Executive Twin Sharing Room",
      slug: "executive-twin-sharing-room",
      category: "TWIN_SHARING",
      description:
        "Balanced privacy and community. Two solid-wood beds, personal lockers, dual ergonomic study desks, attached washroom, and 3 fresh daily home-style meals included.",
      sizeSqFt: 240,
      baseCapacity: 1,
      maxCapacity: 2,
      hasAc: true,
      bathroomType: "ATTACHED",
      foodIncluded: true,
      foodDetails: "3 fresh daily home-style meals included",
      keyAmenities: ["Attached Modern Washroom", "Twin Individual Study Desks", "Daikin Dual-Split AC", "Personal Digital Lockers", "Daily Housekeeping", "High-Speed Wi-Fi"],
      images: [
        "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&w=1200&q=80",
      ],
      rates: [
        { durationType: "DAILY", price: 1100, depositAmount: 500, minDuration: 1, maxDuration: 21, notes: "Per bed. Flexible check-in." },
        { durationType: "WEEKLY", price: 6800, depositAmount: 1500, minDuration: 1, maxDuration: 8, notes: "Per bed. Housekeeping included." },
        { durationType: "MONTHLY", price: 16500, depositAmount: 16500, minDuration: 1, maxDuration: 11, foodMonthlyCharge: 3500, notes: "Per bed with food included." },
        { durationType: "YEARLY", price: 180000, depositAmount: 16500, minDuration: 1, maxDuration: 2, notes: "Per bed annual package." },
      ],
      roomNumber: "Room 201",
      floor: 2,
    },

    // 3. Community Triple Sharing Suite
    {
      property: propKoramangala,
      name: "Community Triple Sharing Suite",
      slug: "community-triple-sharing-suite",
      category: "TRIPLE_SHARING",
      description:
        "High-energy, affordable social living for interns, early career professionals, and students. Individual spring-mattress beds, personal full-height wardrobes, and attached en-suite.",
      sizeSqFt: 290,
      baseCapacity: 1,
      maxCapacity: 3,
      hasAc: true,
      bathroomType: "ATTACHED",
      foodIncluded: true,
      foodDetails: "Breakfast & dinner included on weekdays; 3 meals on weekends",
      keyAmenities: ["Attached Washroom", "Individual Study Lamps", "High-Speed 300 Mbps Wi-Fi", "Locker Cupboards", "Daily Housekeeping", "Rooftop Terrace Access"],
      images: [
        "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=1200&q=80",
      ],
      rates: [
        { durationType: "DAILY", price: 850, depositAmount: 500, minDuration: 1, maxDuration: 14, notes: "Per bed." },
        { durationType: "WEEKLY", price: 5200, depositAmount: 1000, minDuration: 1, maxDuration: 6, notes: "Per bed." },
        { durationType: "MONTHLY", price: 12500, depositAmount: 12500, minDuration: 1, maxDuration: 11, foodMonthlyCharge: 2500, notes: "Per bed with meals included." },
        { durationType: "YEARLY", price: 135000, depositAmount: 12500, minDuration: 1, maxDuration: 2, notes: "Per bed annual plan." },
      ],
      roomNumber: "Room 301",
      floor: 3,
    },

    // 4. Solo Day-Stay & Work Pod
    {
      property: propHSR,
      name: "Solo Day-Stay & Work Pod",
      slug: "solo-day-stay-and-work-pod",
      category: "PRIVATE",
      description:
        "A hyper-focused private pod built for high productivity and daytime recharge. Features an ergonomic Herman Miller style chair, 4K external display hookup, high-speed Wi-Fi, and sound-dampened acoustics.",
      sizeSqFt: 110,
      baseCapacity: 1,
      maxCapacity: 1,
      hasAc: true,
      bathroomType: "COMMON",
      foodIncluded: false,
      foodDetails: "Complimentary bean-to-cup espresso coffee & green tea in lounge",
      keyAmenities: ["Ergonomic Work Desk", "Dual-Band Wi-Fi (300 Mbps)", "Whisper-Quiet AC", "Sound Isolation Walls", "Unlimited Lounge Coffee"],
      images: [
        "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80",
      ],
      rates: [
        { durationType: "HOURLY", price: 220, depositAmount: 0, minDuration: 2, maxDuration: 10, allowedHoursStart: "08:00", allowedHoursEnd: "22:00", notes: "Min 2 hrs. No deposit." },
        { durationType: "DAILY", price: 1200, depositAmount: 500, minDuration: 1, maxDuration: 5, notes: "Overnight day stay." },
      ],
      roomNumber: "Pod 101",
      floor: 1,
    },

    // 5. Urban Minimalist Studio
    {
      property: propIndiranagar,
      name: "Urban Minimalist Studio",
      slug: "urban-minimalist-studio",
      category: "PRIVATE",
      description:
        "Sleek Scandinavian aesthetic with oak finishes, warm ambient lighting, private attached washroom, and sunny Juliet balcony overlooking Indiranagar avenues.",
      sizeSqFt: 210,
      baseCapacity: 1,
      maxCapacity: 2,
      hasAc: true,
      bathroomType: "ATTACHED",
      foodIncluded: false,
      foodDetails: "Nearby gourmet cafes with resident discount",
      keyAmenities: ["Private Juliet Balcony", "Attached En-Suite", "Daikin Inverter AC", "Solid Wood Desk", "300 Mbps Wi-Fi"],
      images: [
        "https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1200&q=80",
      ],
      rates: [
        { durationType: "DAILY", price: 1950, depositAmount: 1000, minDuration: 1, maxDuration: 14 },
        { durationType: "WEEKLY", price: 11500, depositAmount: 2500, minDuration: 1, maxDuration: 4 },
        { durationType: "MONTHLY", price: 34000, depositAmount: 25000, minDuration: 1, maxDuration: 11 },
        { durationType: "YEARLY", price: 375000, depositAmount: 34000, minDuration: 1, maxDuration: 2 },
      ],
      roomNumber: "Room 102",
      floor: 1,
    },

    // 6. Budget Non-AC Single Room
    {
      property: propKoramangala,
      name: "Budget Non-AC Single Room",
      slug: "budget-non-ac-single-room",
      category: "PRIVATE",
      description:
        "High-ceiling room with cross-ventilation, ceiling fan, solid teak single bed, attached modern washroom, and high-speed Wi-Fi. Perfect for budget-conscious professionals.",
      sizeSqFt: 160,
      baseCapacity: 1,
      maxCapacity: 1,
      hasAc: false,
      bathroomType: "ATTACHED",
      foodIncluded: false,
      foodDetails: "Optional food subscription",
      keyAmenities: ["Attached Washroom", "High Ceiling & Natural Breeze", "Study Desk", "300 Mbps Wi-Fi", "Daily Cleaning"],
      images: [
        "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80",
      ],
      rates: [
        { durationType: "DAILY", price: 950, depositAmount: 500, minDuration: 1, maxDuration: 21 },
        { durationType: "WEEKLY", price: 5800, depositAmount: 1500, minDuration: 1, maxDuration: 8 },
        { durationType: "MONTHLY", price: 15500, depositAmount: 15500, minDuration: 1, maxDuration: 11 },
        { durationType: "YEARLY", price: 165000, depositAmount: 15500, minDuration: 1, maxDuration: 2 },
      ],
      roomNumber: "Room 103",
      floor: 1,
    },

    // 7. Premium Penthouse Suite with Balcony
    {
      property: propHSR,
      name: "Premium Penthouse Suite with Balcony",
      slug: "premium-penthouse-suite-with-balcony",
      category: "PRIVATE",
      description:
        "Top floor luxury suite with panoramic city skyline views, private wrap-around terrace, plush King-size mattress, and dedicated lounge seating.",
      sizeSqFt: 320,
      baseCapacity: 1,
      maxCapacity: 2,
      hasAc: true,
      bathroomType: "ATTACHED",
      foodIncluded: true,
      foodDetails: "Chef's gourmet breakfast included daily",
      keyAmenities: ["Panoramic City Terrace", "King-Size Orthopedic Bed", "Attached Designer Bath", "55-inch OLED TV", "300 Mbps Wi-Fi"],
      images: [
        "https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=1200&q=80",
      ],
      rates: [
        { durationType: "DAILY", price: 2800, depositAmount: 1500, minDuration: 1, maxDuration: 14 },
        { durationType: "WEEKLY", price: 16500, depositAmount: 4000, minDuration: 1, maxDuration: 4 },
        { durationType: "MONTHLY", price: 46000, depositAmount: 35000, minDuration: 1, maxDuration: 11 },
      ],
      roomNumber: "Room 401",
      floor: 4,
    },

    // 8. Garden View Twin Sharing PG
    {
      property: propHSR,
      name: "Garden View Twin Sharing PG",
      slug: "garden-view-twin-sharing-pg",
      category: "TWIN_SHARING",
      description:
        "Spacious shared room opening to landscaped rear garden. Twin pine-wood beds, personal storage, and dedicated study stations.",
      sizeSqFt: 250,
      baseCapacity: 1,
      maxCapacity: 2,
      hasAc: false,
      bathroomType: "ATTACHED",
      foodIncluded: true,
      foodDetails: "3 daily home-style vegetarian/non-veg meals",
      keyAmenities: ["Garden Avenue View", "Attached Bathroom", "Dedicated Study Desks", "Personal Lockers", "High-Speed Wi-Fi"],
      images: [
        "https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=1200&q=80",
      ],
      rates: [
        { durationType: "DAILY", price: 900, depositAmount: 500, minDuration: 1, maxDuration: 14 },
        { durationType: "WEEKLY", price: 5600, depositAmount: 1200, minDuration: 1, maxDuration: 8 },
        { durationType: "MONTHLY", price: 14000, depositAmount: 14000, minDuration: 1, maxDuration: 11 },
      ],
      roomNumber: "Room 202",
      floor: 2,
    },

    // 9. Modern Techie Workstation Room
    {
      property: propKoramangala,
      name: "Modern Techie Workstation Room",
      slug: "modern-techie-workstation-room",
      category: "PRIVATE",
      description:
        "Designed for remote developers and founders. Equipped with an electric height-adjustable standing desk, dual-monitor arm, Cat-6 ethernet jack, and blackout curtains.",
      sizeSqFt: 230,
      baseCapacity: 1,
      maxCapacity: 1,
      hasAc: true,
      bathroomType: "ATTACHED",
      foodIncluded: false,
      foodDetails: "On-demand healthy meals",
      keyAmenities: ["Standing Desk & Ergonomic Chair", "Gigabit Ethernet + Wi-Fi", "Attached Washroom", "Daikin AC", "Smart Door Lock"],
      images: [
        "https://images.unsplash.com/photo-1585412727339-54e4bae3bbf9?auto=format&fit=crop&w=1200&q=80",
      ],
      rates: [
        { durationType: "HOURLY", price: 320, depositAmount: 0, minDuration: 2, maxDuration: 10, allowedHoursStart: "08:00", allowedHoursEnd: "22:00" },
        { durationType: "DAILY", price: 1850, depositAmount: 1000, minDuration: 1, maxDuration: 14 },
        { durationType: "WEEKLY", price: 11200, depositAmount: 2500, minDuration: 1, maxDuration: 4 },
        { durationType: "MONTHLY", price: 33000, depositAmount: 25000, minDuration: 1, maxDuration: 11 },
      ],
      roomNumber: "Room 203",
      floor: 2,
    },

    // 10. Comfort Triple Sharing Bed
    {
      property: propIndiranagar,
      name: "Comfort Triple Sharing Bed",
      slug: "comfort-triple-sharing-bed",
      category: "TRIPLE_SHARING",
      description:
        "Lively coliving space in Indiranagar. Three individual solid beds, soundproof windows, attached washroom, and daily cleaning service.",
      sizeSqFt: 280,
      baseCapacity: 1,
      maxCapacity: 3,
      hasAc: true,
      bathroomType: "ATTACHED",
      foodIncluded: true,
      foodDetails: "Daily hot breakfast and dinner included",
      keyAmenities: ["Attached Washroom", "Individual Power Strips & Lamp", "Daikin AC", "Lockable Wardrobe", "Wi-Fi 300 Mbps"],
      images: [
        "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=1200&q=80",
      ],
      rates: [
        { durationType: "DAILY", price: 800, depositAmount: 500, minDuration: 1, maxDuration: 14 },
        { durationType: "WEEKLY", price: 4900, depositAmount: 1000, minDuration: 1, maxDuration: 8 },
        { durationType: "MONTHLY", price: 11800, depositAmount: 11800, minDuration: 1, maxDuration: 11 },
        { durationType: "YEARLY", price: 125000, depositAmount: 11800, minDuration: 1, maxDuration: 2 },
      ],
      roomNumber: "Room 302",
      floor: 3,
    },

    // 11. Quiet Reading Studio with Bookshelf
    {
      property: propIndiranagar,
      name: "Quiet Reading Studio with Bookshelf",
      slug: "quiet-reading-studio-with-bookshelf",
      category: "PRIVATE",
      description:
        "Sun-drenched corner room featuring built-in library shelving, reading armchair, Queen bed, and tranquil garden facing windows.",
      sizeSqFt: 240,
      baseCapacity: 1,
      maxCapacity: 2,
      hasAc: true,
      bathroomType: "ATTACHED",
      foodIncluded: false,
      foodDetails: "Community kitchen on same floor",
      keyAmenities: ["Attached Washroom", "Built-In Bookshelf", "Reading Armchair", "Daikin AC", "Fast Wi-Fi"],
      images: [
        "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=1200&q=80",
      ],
      rates: [
        { durationType: "WEEKLY", price: 12000, depositAmount: 2500, minDuration: 1, maxDuration: 4 },
        { durationType: "MONTHLY", price: 35000, depositAmount: 25000, minDuration: 1, maxDuration: 11 },
        { durationType: "YEARLY", price: 380000, depositAmount: 35000, minDuration: 1, maxDuration: 2 },
      ],
      roomNumber: "Room 204",
      floor: 2,
    },

    // 12. Transit Layover Day Pod
    {
      property: propKoramangala,
      name: "Transit Layover Day Pod",
      slug: "transit-layover-day-pod",
      category: "PRIVATE",
      description:
        "Quiet private micro-pod engineered for layovers and afternoon power-naps. Soundproofing, plush single mattress, fresh linen, and common shower access.",
      sizeSqFt: 90,
      baseCapacity: 1,
      maxCapacity: 1,
      hasAc: true,
      bathroomType: "COMMON",
      foodIncluded: false,
      foodDetails: "Cafe on rooftop",
      keyAmenities: ["Noise-Dampened Walls", "Clean Bedding & Towels", "Common Modern Shower", "300 Mbps Wi-Fi", "Locker Storage"],
      images: [
        "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80",
      ],
      rates: [
        { durationType: "HOURLY", price: 180, depositAmount: 0, minDuration: 2, maxDuration: 8, allowedHoursStart: "08:00", allowedHoursEnd: "22:00", notes: "Hourly layover stay." },
      ],
      roomNumber: "Pod 102",
      floor: 1,
    },

    // 13. Skyline View Twin Bed
    {
      property: propHSR,
      name: "Skyline View Twin Bed",
      slug: "skyline-view-twin-bed",
      category: "TWIN_SHARING",
      description:
        "Elevated twin-sharing on the 3rd floor with sweeping neighborhood views, abundant cross-ventilation, and dual study desks.",
      sizeSqFt: 260,
      baseCapacity: 1,
      maxCapacity: 2,
      hasAc: true,
      bathroomType: "ATTACHED",
      foodIncluded: true,
      foodDetails: "3 daily meals included",
      keyAmenities: ["Panoramic Horizon View", "Attached Bath", "AC with Climate Control", "Twin Work Desks", "Wi-Fi"],
      images: [
        "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80",
      ],
      rates: [
        { durationType: "DAILY", price: 1150, depositAmount: 500, minDuration: 1, maxDuration: 14 },
        { durationType: "WEEKLY", price: 7100, depositAmount: 1500, minDuration: 1, maxDuration: 8 },
        { durationType: "MONTHLY", price: 17200, depositAmount: 17200, minDuration: 1, maxDuration: 11 },
        { durationType: "YEARLY", price: 188000, depositAmount: 17200, minDuration: 1, maxDuration: 2 },
      ],
      roomNumber: "Room 303",
      floor: 3,
    },

    // 14. Cozy Solo PG Room with Balcony
    {
      property: propHSR,
      name: "Cozy Solo PG Room with Balcony",
      slug: "cozy-solo-pg-room-with-balcony",
      category: "PRIVATE",
      description:
        "Charming private retreat with an east-facing balcony capturing morning sunrise. Includes single bed, work desk, and attached washroom.",
      sizeSqFt: 180,
      baseCapacity: 1,
      maxCapacity: 1,
      hasAc: true,
      bathroomType: "ATTACHED",
      foodIncluded: false,
      foodDetails: "Home food add-on available",
      keyAmenities: ["Sunrise Balcony", "Attached Washroom", "Daikin AC", "Workstation", "Fast Wi-Fi"],
      images: [
        "https://images.unsplash.com/photo-1591088398332-8a7791972843?auto=format&fit=crop&w=1200&q=80",
      ],
      rates: [
        { durationType: "DAILY", price: 1400, depositAmount: 500, minDuration: 1, maxDuration: 14 },
        { durationType: "WEEKLY", price: 8900, depositAmount: 2000, minDuration: 1, maxDuration: 4 },
        { durationType: "MONTHLY", price: 24000, depositAmount: 20000, minDuration: 1, maxDuration: 11 },
        { durationType: "YEARLY", price: 260000, depositAmount: 24000, minDuration: 1, maxDuration: 2 },
      ],
      roomNumber: "Room 205",
      floor: 2,
    },

    // 15. Executive Suite with Living Nook
    {
      property: propIndiranagar,
      name: "Executive Suite with Living Nook",
      slug: "executive-suite-with-living-nook",
      category: "PRIVATE",
      description:
        "Generously proportioned suite with partitioned living area, plush armchair, Queen bed, attached bath, and floor-to-ceiling windows.",
      sizeSqFt: 290,
      baseCapacity: 1,
      maxCapacity: 2,
      hasAc: true,
      bathroomType: "ATTACHED",
      foodIncluded: false,
      foodDetails: "Near top gourmet restaurants",
      keyAmenities: ["Living Nook & Armchair", "Attached Designer Bath", "43-inch Smart TV", "Mini Refrigerator", "300 Mbps Wi-Fi"],
      images: [
        "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80",
      ],
      rates: [
        { durationType: "DAILY", price: 2200, depositAmount: 1000, minDuration: 1, maxDuration: 14 },
        { durationType: "WEEKLY", price: 13500, depositAmount: 3000, minDuration: 1, maxDuration: 4 },
        { durationType: "MONTHLY", price: 38000, depositAmount: 30000, minDuration: 1, maxDuration: 11 },
      ],
      roomNumber: "Room 304",
      floor: 3,
    },

    // 16. Budget Non-AC Twin Bed
    {
      property: propKoramangala,
      name: "Budget Non-AC Twin Bed",
      slug: "budget-non-ac-twin-bed",
      category: "TWIN_SHARING",
      description:
        "Affordable twin accommodation with large cross-ventilation windows, personal steel almirah, study desk, and attached washroom.",
      sizeSqFt: 220,
      baseCapacity: 1,
      maxCapacity: 2,
      hasAc: false,
      bathroomType: "ATTACHED",
      foodIncluded: true,
      foodDetails: "Daily wholesome meals included",
      keyAmenities: ["Attached Washroom", "Large Airy Windows", "Personal Steel Wardrobe", "Study Desk", "High-Speed Wi-Fi"],
      images: [
        "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=1200&q=80",
      ],
      rates: [
        { durationType: "DAILY", price: 750, depositAmount: 500, minDuration: 1, maxDuration: 14 },
        { durationType: "WEEKLY", price: 4600, depositAmount: 1000, minDuration: 1, maxDuration: 8 },
        { durationType: "MONTHLY", price: 11500, depositAmount: 11500, minDuration: 1, maxDuration: 11 },
        { durationType: "YEARLY", price: 120000, depositAmount: 11500, minDuration: 1, maxDuration: 2 },
      ],
      roomNumber: "Room 104",
      floor: 1,
    },

    // 17. Premium Triple Sharing Corner Bed
    {
      property: propHSR,
      name: "Premium Triple Sharing Corner Bed",
      slug: "premium-triple-sharing-corner-bed",
      category: "TRIPLE_SHARING",
      description:
        "Spacious corner triple suite with dual-aspect natural lighting. Three single beds, lockable drawers, attached bathroom, and daily housekeeping.",
      sizeSqFt: 300,
      baseCapacity: 1,
      maxCapacity: 3,
      hasAc: true,
      bathroomType: "ATTACHED",
      foodIncluded: true,
      foodDetails: "3 daily freshly cooked meals",
      keyAmenities: ["Attached Modern Washroom", "Daikin Inverter AC", "Lockable Dressers", "Individual Study Desks", "Fast Wi-Fi"],
      images: [
        "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=1200&q=80",
      ],
      rates: [
        { durationType: "DAILY", price: 850, depositAmount: 500, minDuration: 1, maxDuration: 14 },
        { durationType: "WEEKLY", price: 5100, depositAmount: 1000, minDuration: 1, maxDuration: 8 },
        { durationType: "MONTHLY", price: 12200, depositAmount: 12200, minDuration: 1, maxDuration: 11 },
      ],
      roomNumber: "Room 305",
      floor: 3,
    },

    // 18. Artist Loft Studio with Natural Light
    {
      property: propIndiranagar,
      name: "Artist Loft Studio with Natural Light",
      slug: "artist-loft-studio-with-natural-light",
      category: "PRIVATE",
      description:
        "Double-height ceiling studio with skylights, easel workstation, Queen memory-foam bed, private attached washroom, and artisan coffee bar.",
      sizeSqFt: 280,
      baseCapacity: 1,
      maxCapacity: 2,
      hasAc: true,
      bathroomType: "ATTACHED",
      foodIncluded: false,
      foodDetails: "Artisan bakeries and cafes nearby",
      keyAmenities: ["Double-Height Ceiling & Skylight", "Attached Designer Bath", "Art & Work Easel", "Daikin AC", "Wi-Fi 300 Mbps"],
      images: [
        "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=1200&q=80",
      ],
      rates: [
        { durationType: "WEEKLY", price: 13000, depositAmount: 3000, minDuration: 1, maxDuration: 4 },
        { durationType: "MONTHLY", price: 36000, depositAmount: 30000, minDuration: 1, maxDuration: 11 },
        { durationType: "YEARLY", price: 395000, depositAmount: 36000, minDuration: 1, maxDuration: 2 },
      ],
      roomNumber: "Room 306",
      floor: 3,
    },
  ];

  // Insert room types, rooms, inventory units, and rate plans
  const createdUnitsMap: Record<string, any[]> = {};
  const createdRoomTypes: any[] = [];

  for (const def of stayDefinitions) {
    const rt = await prisma.roomType.create({
      data: {
        propertyId: def.property.id,
        name: def.name,
        slug: def.slug,
        category: def.category,
        description: def.description,
        sizeSqFt: def.sizeSqFt,
        baseCapacity: def.baseCapacity,
        maxCapacity: def.maxCapacity,
        hasAc: def.hasAc,
        bathroomType: def.bathroomType,
        foodIncluded: def.foodIncluded,
        foodDetails: def.foodDetails,
        keyAmenities: JSON.stringify(def.keyAmenities),
        images: JSON.stringify(def.images),
      },
    });

    createdRoomTypes.push(rt);

    // Rate plans
    for (const r of def.rates) {
      await prisma.ratePlan.create({
        data: {
          roomTypeId: rt.id,
          durationType: r.durationType,
          price: r.price,
          depositAmount: r.depositAmount,
          minDuration: r.minDuration || 1,
          maxDuration: r.maxDuration || null,
          foodMonthlyCharge: r.foodMonthlyCharge || 0,
          allowedHoursStart: r.allowedHoursStart || "08:00",
          allowedHoursEnd: r.allowedHoursEnd || "22:00",
          notes: r.notes || null,
        },
      });
    }

    // Physical room
    const physicalRoom = await prisma.room.create({
      data: {
        roomTypeId: rt.id,
        roomNumber: def.roomNumber,
        floor: def.floor,
        status: "ACTIVE",
      },
    });

    // Inventory units: 1 unit for private, 2 for twin, 3 for triple
    const isBed = def.category !== "PRIVATE";
    const unitCount = def.category === "TRIPLE_SHARING" ? 3 : def.category === "TWIN_SHARING" ? 2 : 1;
    createdUnitsMap[rt.id] = [];

    for (let i = 0; i < unitCount; i++) {
      const u = await prisma.inventoryUnit.create({
        data: {
          roomId: physicalRoom.id,
          identifier: isBed ? `Bed ${String.fromCharCode(65 + i)}` : physicalRoom.roomNumber,
          isBed,
          status: "AVAILABLE",
        },
      });
      createdUnitsMap[rt.id].push(u);
    }
  }

  // 4. Sample Past & Active Bookings for Aarav Sharma
  const now = new Date();
  const pastStart = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
  const pastEnd = new Date(pastStart.getTime() + 7 * 24 * 60 * 60 * 1000);

  const rt1 = createdRoomTypes[0]; // Deluxe Private Studio
  const u1 = createdUnitsMap[rt1.id][0];

  const pastBooking = await prisma.booking.create({
    data: {
      bookingReference: "STY-2026-PAST01",
      userId: demoCustomer.id,
      propertyId: propKoramangala.id,
      roomTypeId: rt1.id,
      inventoryUnitId: u1.id,
      durationType: "WEEKLY",
      startTime: pastStart,
      endTime: pastEnd,
      durationCount: 1,
      guestCount: 1,
      guestName: "Aarav Sharma",
      guestEmail: "aarav.sharma@example.com",
      guestPhone: "+91 98765 12345",
      specialRequests: "Quiet room requested.",
      basePrice: 10800,
      foodCharges: 0,
      taxes: 1296,
      depositAmount: 2500,
      totalAmount: 14596,
      payableNow: 14596,
      balanceRemaining: 0,
      status: "CHECKED_OUT",
      paymentStatus: "PAID",
      createdAt: pastStart,
    },
  });

  await prisma.payment.create({
    data: {
      bookingId: pastBooking.id,
      amount: 14596,
      currency: "INR",
      status: "SUCCESS",
      provider: "DEMO_ADAPTER",
      transactionRef: "TXN_DEMO_PAST_77192",
      isDemo: true,
      paidAt: pastStart,
    },
  });

  // Active future booking for Aarav
  const rt2 = createdRoomTypes[1]; // Executive Twin
  const u2 = createdUnitsMap[rt2.id][0];

  const futureStart = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000);
  const futureEnd = new Date(futureStart.getTime() + 30 * 24 * 60 * 60 * 1000);

  const activeBooking = await prisma.booking.create({
    data: {
      bookingReference: "STY-2026-ACTV02",
      userId: demoCustomer.id,
      propertyId: propKoramangala.id,
      roomTypeId: rt2.id,
      inventoryUnitId: u2.id,
      durationType: "MONTHLY",
      startTime: futureStart,
      endTime: futureEnd,
      durationCount: 1,
      guestCount: 1,
      guestName: "Aarav Sharma",
      guestEmail: "aarav.sharma@example.com",
      guestPhone: "+91 98765 12345",
      specialRequests: "Window side bed preferred",
      basePrice: 16500,
      foodCharges: 3500,
      taxes: 1980,
      depositAmount: 16500,
      totalAmount: 38480,
      payableNow: 38480,
      balanceRemaining: 0,
      status: "CONFIRMED",
      paymentStatus: "PAID",
      createdAt: now,
    },
  });

  await prisma.bookingItem.create({
    data: {
      bookingId: activeBooking.id,
      inventoryUnitId: u2.id,
      startTime: futureStart,
      endTime: futureEnd,
    },
  });

  await prisma.payment.create({
    data: {
      bookingId: activeBooking.id,
      amount: 38480,
      currency: "INR",
      status: "SUCCESS",
      provider: "DEMO_ADAPTER",
      transactionRef: "TXN_DEMO_ACTV_89214",
      isDemo: true,
      paidAt: now,
    },
  });

  // 5. Sample Visit Requests
  const visitDate1 = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000);
  await prisma.visitRequest.create({
    data: {
      propertyId: propKoramangala.id,
      userId: demoCustomer.id,
      customerName: "Aarav Sharma",
      customerEmail: "aarav.sharma@example.com",
      customerPhone: "+91 98765 12345",
      preferredDate: visitDate1,
      timeSlot: "11:00 AM - 01:00 PM",
      status: "CONFIRMED",
      notes: "Looking to see the rooftop lounge and study spaces.",
    },
  });

  // 6. Sample Support Ticket
  await prisma.supportTicket.create({
    data: {
      userId: demoCustomer.id,
      bookingId: activeBooking.id,
      category: "MAINTENANCE",
      subject: "Air Conditioner filter servicing request",
      message: "Could the housekeeping team clean the AC filter tomorrow morning between 10 AM and 12 PM?",
      status: "IN_PROGRESS",
      adminReply: "Scheduled with our HVAC technician for tomorrow 11:00 AM. Thank you!",
      repliedAt: now,
    },
  });

  // 7. Initial Dynamic Site Content
  await prisma.siteContent.upsert({
    where: { key: "hero_content" },
    create: {
      key: "hero_content",
      value: JSON.stringify({
        headline: "Find your space. Stay your way.",
        tagline: "FLEXIBLE STAYS. EVERYDAY COMFORT.",
        description:
          "From a few hours to a whole year, discover comfortable rooms and shared spaces that fit your life.",
        primaryCtaText: "Explore Stays",
        secondaryCtaText: "Schedule a Visit",
      }),
    },
    update: {},
  });

  // 8. Initial Audit Log
  await prisma.auditLog.create({
    data: {
      adminEmail: "admin@stayzy.com",
      action: "SYSTEM_INITIALIZE",
      entityType: "System",
      entityId: "init",
      details: "Seeded 18 comprehensive room types with physical units across 3 properties.",
    },
  });

  console.log(`Database seeded successfully! Created ${createdRoomTypes.length} room types with physical rooms and beds.`);
}

main()
  .catch((e) => {
    console.error("Seeding error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
