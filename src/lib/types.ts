export type DurationType = "HOURLY" | "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY";

export type RoomCategory = "PRIVATE" | "TWIN_SHARING" | "TRIPLE_SHARING";

export type BathroomType = "ATTACHED" | "COMMON";

export type BookingStatus =
  | "PENDING"
  | "CONFIRMED"
  | "CHECKED_IN"
  | "CHECKED_OUT"
  | "CANCELLED";

export type PaymentStatus =
  | "UNPAID"
  | "HELD"
  | "PAID"
  | "REFUNDED"
  | "PARTIALLY_REFUNDED";

export interface PricingCalculationInput {
  roomTypeId: string;
  durationType: DurationType;
  startDate: string; // YYYY-MM-DD or ISO
  startTime?: string; // HH:mm for hourly
  durationCount: number; // hours, days, weeks, months, or 1 for year
  includeFood?: boolean;
}

export interface PricingBreakdown {
  durationType: DurationType;
  durationCount: number;
  unitPrice: number;
  unitLabel: string;
  baseAmount: number;
  foodCharge: number;
  foodChargeRate?: number;
  taxes: number; // 12% standard GST
  depositAmount: number; // 100% refundable
  totalAmount: number;
  payableNow: number;
  balanceRemaining: number;
  schedule?: {
    dueDate: string;
    amount: number;
    description: string;
  }[];
  startDateTime: string;
  endDateTime: string;
  monthEndAdjustmentNote?: string;
}

export interface SearchFilters {
  propertyId?: string;
  durationType: DurationType;
  startDate: string;
  startTime?: string;
  durationCount: number;
  category?: RoomCategory | "ALL";
  hasAc?: boolean;
  bathroomType?: BathroomType | "ALL";
  foodIncluded?: boolean;
  maxBudget?: number;
  sortBy?: "price_asc" | "price_desc" | "recommended";
}
