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
    include: { product: true, refundItems: true },
  });

  if (!orderItem) {
    return NextResponse.json({ error: "Order item not found" }, { status: 404 });
  }

  const alreadyRefunded = orderItem.refundItems.reduce(
    (sum: number, r: { quantity: number }) => sum + r.quantity,
    0
  );
  const remaining = orderItem.quantity - alreadyRefunded;

  if (quantity > remaining) {
    return NextResponse.json(
      { error: `Only ${remaining} unit(s) of this item can still be refunded` },
      { status: 400 }
    );
  }

  const amount = orderItem.unitPrice * quantity;
  const shouldRestock = restocked === true; // defaults to false unless explicitly true
  const refundNumber = `REF-${Date.now()}`;

  const refund = await prisma.$transaction(async (tx) => {
    const created = await tx.refund.create({
      data: {
        refundNumber,
        orderId: orderItem.orderId,
        managerId: manager.id,
        amount,
        reason: reason || null,
        items: {
          create: {
            orderItemId: orderItem.id,
            productId: orderItem.productId,
            quantity,
            unitPrice: orderItem.unitPrice,
            total: amount,
            restocked: shouldRestock,
          },
        },
      },
      include: { items: true },
    });

    if (shouldRestock) {
      await tx.product.update({
        where: { id: orderItem.productId },
        data: { currentStock: { increment: quantity } },
      });
    }

    await tx.notification.create({
      data: {
        type: "REFUND",
        message: `${manager.firstName} ${manager.lastName} refunded ${quantity} x ${orderItem.product.name} (${amount.toLocaleString()} UGX)`,
        userId: manager.id,
      },
    });

    return created;
  });

  return NextResponse.json({ success: true, refund });
}
