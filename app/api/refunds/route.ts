import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

export async function POST(request: NextRequest) {
  const cookieStore = await cookies();
  const userId = cookieStore.get("userId")?.value;

  if (!userId) {
    return NextResponse.json({ error: "Not logged in" }, { status: 401 });
  }

  const body = await request.json();
  const { orderItemId, quantity, restocked, reason, managerPin } = body;

  if (!orderItemId || !quantity || !managerPin) {
    return NextResponse.json(
      { error: "Order item, quantity, and manager PIN are required" },
      { status: 400 }
    );
  }

  const manager = await prisma.user.findFirst({
    where: { pin: managerPin, role: "MANAGER", isActive: true },
  });

  if (!manager) {
    return NextResponse.json({ error: "Invalid manager PIN" }, { status: 403 });
  }

  const orderItem = await prisma.orderItem.findUnique({
    where: { id: orderItemId },
    include: { product: true, refunds: true },
  });

  if (!orderItem) {
    return NextResponse.json({ error: "Order item not found" }, { status: 404 });
  }

  const alreadyRefunded = orderItem.refunds.reduce((sum, r) => sum + r.quantity, 0);
  const remaining = orderItem.quantity - alreadyRefunded;

  if (quantity > remaining) {
    return NextResponse.json(
      { error: `Only ${remaining} unit(s) of this item can still be refunded` },
      { status: 400 }
    );
  }

  const amount = orderItem.unitPrice * quantity;
  const shouldRestock = restocked !== false; // defaults to true unless explicitly false

  const refund = await prisma.$transaction(async (tx) => {
    const created = await tx.refund.create({
      data: {
        orderId: orderItem.orderId,
        orderItemId: orderItem.id,
        quantity,
        amount,
        restocked: shouldRestock,
        reason: reason || null,
        authorizedById: manager.id,
      },
    });

    if (shouldRestock) {
      await tx.product.update({
        where: { id: orderItem.productId },
        data: { currentStock: { increment: quantity } },
      });
    }

    // NOTE: waiter sales tallies appear to be computed on the fly from
    // Order/Payment records rather than stored — if so, tally queries
    // (dashboard, End Day) need to subtract Refund.amount for the period,
    // not this route. Flag if that assumption is wrong.

    return created;
  });

  return NextResponse.json({ success: true, refund });
}
