import crypto from "crypto";
import { prisma } from "../prisma";
import { isUnitAvailable } from "../inventory";

export interface PaymentInitiationResult {
  transactionRef: string;
  amount: number;
  currency: string;
  provider: "DEMO_ADAPTER" | "RAZORPAY" | "STRIPE";
  isDemo: boolean;
  paymentUrl?: string;
  signature: string;
}

const WEBHOOK_SECRET = process.env.PAYMENT_WEBHOOK_SECRET || "stayzy_demo_secret_2026";

/**
 * Sign webhook payload with HMAC-SHA256 for cryptographic authenticity.
 */
export function signWebhookPayload(payloadString: string): string {
  return crypto.createHmac("sha256", WEBHOOK_SECRET).update(payloadString).digest("hex");
}

/**
 * Verify webhook signature.
 */
export function verifyWebhookSignature(payloadString: string, signature: string): boolean {
  try {
    const expected = signWebhookPayload(payloadString);
    return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
  } catch {
    return false;
  }
}

/**
 * Server-side payment adapter interface & implementation
 */
export class PaymentAdapter {
  /**
   * Initiate a demo or real payment transaction.
   */
  static async initiatePayment(params: {
    bookingId: string;
    amount: number;
    currency?: string;
    customerEmail: string;
  }): Promise<PaymentInitiationResult> {
    const isDemo = process.env.PAYMENT_PROVIDER !== "LIVE_RAZORPAY";
    const transactionRef = `TXN_${isDemo ? "DEMO" : "LIVE"}_${Date.now()}_${crypto.randomBytes(4).toString("hex").toUpperCase()}`;

    // Create payment entry in PENDING status
    const payment = await prisma.payment.create({
      data: {
        bookingId: params.bookingId,
        amount: params.amount,
        currency: params.currency || "INR",
        status: "PENDING",
        provider: isDemo ? "DEMO_ADAPTER" : "RAZORPAY",
        transactionRef,
        isDemo,
      },
    });

    const payloadToSign = JSON.stringify({
      paymentId: payment.id,
      transactionRef,
      bookingId: params.bookingId,
      amount: params.amount,
      status: "SUCCESS",
    });

    const signature = signWebhookPayload(payloadToSign);

    return {
      transactionRef,
      amount: params.amount,
      currency: params.currency || "INR",
      provider: isDemo ? "DEMO_ADAPTER" : "RAZORPAY",
      isDemo,
      signature,
    };
  }

  /**
   * Process payment confirmation via signed webhook.
   * Completely idempotent: repeated webhook events do not duplicate records.
   */
  static async processWebhook(params: {
    rawBody: string;
    signature: string;
  }): Promise<{ success: boolean; status: string; bookingReference?: string; error?: string }> {
    const { rawBody, signature } = params;

    // 1. Authenticate signature
    const isValid = verifyWebhookSignature(rawBody, signature);
    if (!isValid) {
      return { success: false, status: "UNAUTHORIZED", error: "Invalid webhook cryptographic signature." };
    }

    const event = JSON.parse(rawBody);
    const { paymentId, transactionRef, bookingId, status } = event;

    // 2. Fetch payment and booking
    const payment = await prisma.payment.findFirst({
      where: {
        OR: [{ id: paymentId }, { transactionRef }],
      },
      include: {
        booking: {
          include: {
            bookingItems: true,
            roomType: true,
          },
        },
      },
    });

    if (!payment) {
      return { success: false, status: "NOT_FOUND", error: "Payment transaction not found." };
    }

    // Idempotency check: If already SUCCESS, return early safely without modifying
    if (payment.status === "SUCCESS") {
      return {
        success: true,
        status: "ALREADY_PROCESSED",
        bookingReference: payment.booking.bookingReference,
      };
    }

    // 3. Handle Failed Payment
    if (status === "FAILED") {
      await prisma.$transaction([
        prisma.payment.update({
          where: { id: payment.id },
          data: { status: "FAILED" },
        }),
        prisma.booking.update({
          where: { id: payment.bookingId },
          data: { paymentStatus: "UNPAID", status: "PENDING" },
        }),
      ]);
      return { success: true, status: "PAYMENT_FAILED" };
    }

    // 4. Handle Successful Payment
    if (status === "SUCCESS") {
      const booking = payment.booking;

      // Late payment safety: Verify inventory unit is still available or held
      if (booking.inventoryUnitId) {
        const stillAvailable = await isUnitAvailable(
          booking.inventoryUnitId,
          booking.startTime,
          booking.endTime
        );

        if (!stillAvailable) {
          // Safe refund/flagging if double-booked due to late payment past hold
          await prisma.payment.update({
            where: { id: payment.id },
            data: { status: "SUCCESS" },
          });
          await prisma.refund.create({
            data: {
              bookingId: booking.id,
              paymentId: payment.id,
              amount: payment.amount,
              reason: "Late payment arrived after inventory hold expired and unit was reallocated.",
              status: "REQUESTED",
            },
          });
          await prisma.booking.update({
            where: { id: booking.id },
            data: { status: "CANCELLED", notes: "Cancelled automatically: Hold expired prior to payment." },
          });

          return {
            success: false,
            status: "INVENTORY_EXPIRED",
            error: "Inventory hold expired prior to payment arrival. Refund has been automatically scheduled.",
          };
        }
      }

      // Execute transaction to confirm booking and mark payment PAID
      await prisma.$transaction([
        prisma.payment.update({
          where: { id: payment.id },
          data: {
            status: "SUCCESS",
            paidAt: new Date(),
            webhookSignature: signature,
          },
        }),
        prisma.booking.update({
          where: { id: booking.id },
          data: {
            status: "CONFIRMED",
            paymentStatus: "PAID",
          },
        }),
        // Ensure BookingItem links inventoryUnit for precise overlap queries
        ...(booking.inventoryUnitId
          ? [
              prisma.bookingItem.upsert({
                where: { id: `item_${booking.id}` },
                create: {
                  id: `item_${booking.id}`,
                  bookingId: booking.id,
                  inventoryUnitId: booking.inventoryUnitId,
                  startTime: booking.startTime,
                  endTime: booking.endTime,
                },
                update: {},
              }),
            ]
          : []),
      ]);

      return {
        success: true,
        status: "CONFIRMED",
        bookingReference: booking.bookingReference,
      };
    }

    return { success: false, status: "UNKNOWN_EVENT" };
  }
}
