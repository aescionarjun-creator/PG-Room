import { DurationType, PricingBreakdown } from "./types";

/**
 * Robust calendar month addition with strict month-end clamping.
 * e.g., Jan 31 + 1 month => Feb 28 (or Feb 29 in leap year).
 * Aug 31 + 1 month => Sep 30.
 * Aug 15 + 1 month => Sep 15.
 */
export function addCalendarMonths(date: Date, months: number): { resultDate: Date; clamped: boolean } {
  const year = date.getFullYear();
  const month = date.getMonth();
  const day = date.getDate();

  const targetMonthIndex = month + months;
  const targetYear = year + Math.floor(targetMonthIndex / 12);
  const normalizedMonth = ((targetMonthIndex % 12) + 12) % 12;

  // Days in target month: day 0 of normalizedMonth + 1 gives last day of target month
  const daysInTargetMonth = new Date(targetYear, normalizedMonth + 1, 0).getDate();

  let clamped = false;
  let targetDay = day;
  if (day > daysInTargetMonth) {
    targetDay = daysInTargetMonth;
    clamped = true;
  }

  const resultDate = new Date(date);
  resultDate.setFullYear(targetYear, normalizedMonth, targetDay);
  return { resultDate, clamped };
}

/**
 * Add calendar years with leap-year clamping (e.g. Feb 29 => Feb 28 next year)
 */
export function addCalendarYears(date: Date, years: number): { resultDate: Date; clamped: boolean } {
  return addCalendarMonths(date, years * 12);
}

export interface RatePlanData {
  durationType: string;
  price: number;
  isEnabled: boolean;
  minDuration: number;
  maxDuration: number | null;
  allowedHoursStart: string | null;
  allowedHoursEnd: string | null;
  depositAmount: number;
  foodMonthlyCharge: number | null;
  electricityRule: string | null;
  notes: string | null;
}

export function calculateBookingPricing(params: {
  ratePlan: RatePlanData;
  durationType: DurationType;
  durationCount: number;
  startDateStr: string; // YYYY-MM-DD
  startTimeStr?: string; // HH:mm (default "10:00")
  includeFood?: boolean;
}): { success: true; breakdown: PricingBreakdown } | { success: false; error: string } {
  const { ratePlan, durationType, durationCount, startDateStr, startTimeStr = "10:00", includeFood = false } = params;

  if (!ratePlan || !ratePlan.isEnabled) {
    return { success: false, error: `Duration "${durationType}" is currently not enabled for this room.` };
  }

  if (durationCount < ratePlan.minDuration) {
    return {
      success: false,
      error: `Minimum duration for ${durationType.toLowerCase()} booking is ${ratePlan.minDuration}.`,
    };
  }

  if (ratePlan.maxDuration && durationCount > ratePlan.maxDuration) {
    return {
      success: false,
      error: `Maximum duration for ${durationType.toLowerCase()} booking is ${ratePlan.maxDuration}.`,
    };
  }

  const [year, month, day] = startDateStr.split("-").map(Number);
  if (!year || !month || !day) {
    return { success: false, error: "Invalid check-in date format. Expected YYYY-MM-DD." };
  }

  let startDateTime: Date;
  let endDateTime: Date;
  let monthEndAdjustmentNote: string | undefined;

  let unitLabel = "";
  let baseAmount = 0;
  let foodCharge = 0;
  let depositAmount = ratePlan.depositAmount || 0;
  const unitPrice = ratePlan.price;

  if (durationType === "HOURLY") {
    unitLabel = "/ hour";
    const [hour, minute] = startTimeStr.split(":").map(Number);
    startDateTime = new Date(year, month - 1, day, hour || 10, minute || 0, 0);

    // Validate allowed hours
    const allowedStart = ratePlan.allowedHoursStart || "08:00";
    const allowedEnd = ratePlan.allowedHoursEnd || "22:00";
    const [startH] = allowedStart.split(":").map(Number);
    const [endH] = allowedEnd.split(":").map(Number);

    const bookingStartHour = startDateTime.getHours();
    const bookingEndHour = bookingStartHour + durationCount;

    if (bookingStartHour < startH || bookingEndHour > endH) {
      return {
        success: false,
        error: `Hourly bookings must start and end between ${allowedStart} and ${allowedEnd}.`,
      };
    }

    endDateTime = new Date(startDateTime.getTime() + durationCount * 60 * 60 * 1000);
    baseAmount = unitPrice * durationCount;
  } else if (durationType === "DAILY") {
    unitLabel = "/ night";
    // Check-in at 12:00 PM, Check-out at 11:00 AM
    startDateTime = new Date(year, month - 1, day, 12, 0, 0);
    endDateTime = new Date(startDateTime.getTime() + durationCount * 24 * 60 * 60 * 1000);
    endDateTime.setHours(11, 0, 0);
    baseAmount = unitPrice * durationCount;
  } else if (durationType === "WEEKLY") {
    unitLabel = "/ week";
    startDateTime = new Date(year, month - 1, day, 12, 0, 0);
    endDateTime = new Date(startDateTime.getTime() + durationCount * 7 * 24 * 60 * 60 * 1000);
    endDateTime.setHours(11, 0, 0);
    baseAmount = unitPrice * durationCount;
  } else if (durationType === "MONTHLY") {
    unitLabel = "/ month";
    startDateTime = new Date(year, month - 1, day, 12, 0, 0);
    const { resultDate, clamped } = addCalendarMonths(startDateTime, durationCount);
    endDateTime = resultDate;
    endDateTime.setHours(11, 0, 0);

    if (clamped) {
      monthEndAdjustmentNote = `Checkout adjusted to ${endDateTime.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })} to account for calendar month length.`;
    }

    baseAmount = unitPrice * durationCount;
    if (includeFood && ratePlan.foodMonthlyCharge) {
      foodCharge = ratePlan.foodMonthlyCharge * durationCount;
    }
  } else if (durationType === "YEARLY") {
    unitLabel = "/ month (12 mo. commitment)";
    startDateTime = new Date(year, month - 1, day, 12, 0, 0);
    const { resultDate, clamped } = addCalendarYears(startDateTime, 1);
    endDateTime = resultDate;
    endDateTime.setHours(11, 0, 0);

    if (clamped) {
      monthEndAdjustmentNote = `Leap-year/month-end rule applied to exact 12-month calendar cycle.`;
    }

    // Contractual total for 12 months
    const totalContractRent = unitPrice * 12;
    baseAmount = totalContractRent;
    if (includeFood && ratePlan.foodMonthlyCharge) {
      foodCharge = ratePlan.foodMonthlyCharge * 12;
    }
  } else {
    return { success: false, error: "Unsupported duration type." };
  }

  // Taxes: 12% GST applied to stay service charges
  const taxableAmount = baseAmount + foodCharge;
  const taxes = Math.round(taxableAmount * 0.12);
  const totalAmount = taxableAmount + taxes + depositAmount;

  let payableNow = totalAmount;
  let balanceRemaining = 0;
  let schedule: PricingBreakdown["schedule"] = undefined;

  // Yearly payment flexibility: First month's rent + full refundable deposit + first month food/tax payable now
  if (durationType === "YEARLY") {
    const monthlyRent = unitPrice;
    const monthlyFood = includeFood && ratePlan.foodMonthlyCharge ? ratePlan.foodMonthlyCharge : 0;
    const monthlyTax = Math.round((monthlyRent + monthlyFood) * 0.12);
    const firstMonthTotal = monthlyRent + monthlyFood + monthlyTax + depositAmount;

    payableNow = firstMonthTotal;
    balanceRemaining = totalAmount - payableNow;

    schedule = [];
    for (let m = 1; m < 12; m++) {
      const { resultDate } = addCalendarMonths(startDateTime, m);
      schedule.push({
        dueDate: resultDate.toISOString().split("T")[0],
        amount: monthlyRent + monthlyFood + monthlyTax,
        description: `Month ${m + 1} Rent & Services installment`,
      });
    }
  }

  return {
    success: true,
    breakdown: {
      durationType,
      durationCount,
      unitPrice,
      unitLabel,
      baseAmount,
      foodCharge,
      foodChargeRate: ratePlan.foodMonthlyCharge || undefined,
      taxes,
      depositAmount,
      totalAmount,
      payableNow,
      balanceRemaining,
      schedule,
      startDateTime: startDateTime.toISOString(),
      endDateTime: endDateTime.toISOString(),
      monthEndAdjustmentNote,
    },
  };
}
