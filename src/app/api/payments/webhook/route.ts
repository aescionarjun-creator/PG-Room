import { NextResponse } from "next/server";
import { PaymentAdapter } from "@/lib/payments/adapter";

export async function POST(request: Request) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get("x-stayzy-signature") || "";

    if (!signature) {
      return NextResponse.json(
        { error: "Missing x-stayzy-signature webhook header." },
        { status: 401 }
      );
    }

    const result = await PaymentAdapter.processWebhook({
      rawBody,
      signature,
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error, status: result.status },
        { status: result.status === "UNAUTHORIZED" ? 401 : 400 }
      );
    }

    return NextResponse.json({
      success: true,
      status: result.status,
      bookingReference: result.bookingReference,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
