import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const cookieStore = await cookies();
  const userId = cookieStore.get("userId")?.value;

  if (!userId) {
    return NextResponse.json({ error: "Not logged in" }, { status: 401 });
  }

  const currentUser = await prisma.user.findUnique({ where: { id: userId } });

  if (!currentUser || currentUser.role !== "MANAGER") {
    return NextResponse.json({ error: "Only managers can cancel orders" }, { status: 403 });
  }

  const order = await prisma.order.findUnique({
    where: { id },
    include: { items: true, payments: true },
  });

  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  if (order.status === "CANCELLED") {
    return NextResponse.json({ error: "Order is already cancelled" }, { status: 400 });
  }

  if (order.payments.length > 0) {
    return NextResponse.json(
      { error: "Cannot cancel an order that has payments recorded. Contact support for refunds." },
      { status: 400 }
    );
  }

  await prisma.$transaction(async (tx) => {
    for (const item of order.items) {
      await tx.product.update({
        where: { id: item.productId },
        data: { currentStock: { increment: item.quantity } },
      });
    }

    await tx.order.update({
      where: { id },
      data: { status: "CANCELLED" },
    });

    if (order.tableId) {
      await tx.barTable.update({
        where: { id: order.tableId },
        data: { status: "AVAILABLE" },
      });
    }
  });

  return NextResponse.json({ success: true });
}
