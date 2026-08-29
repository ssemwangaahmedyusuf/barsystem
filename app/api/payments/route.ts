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
  const { orderId, amount, method } = body;

  if (!orderId || !amount || !method) {
    return NextResponse.json(
      { error: "Order, amount, and method are required" },
      { status: 400 }
    );
  }

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { payments: true },
  });

  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  const paymentNumber = `PAY-${Date.now()}`;

  const payment = await prisma.payment.create({
    data: {
      paymentNumber,
      orderId,
      cashierId: userId,
      amount: parseFloat(amount),
      method,
      status: "COMPLETED",
    },
  });

  const totalPaid = order.payments.reduce((sum, p) => sum + p.amount, 0) + payment.amount;

  if (totalPaid >= order.total) {
    await prisma.order.update({
      where: { id: orderId },
      data: { status: "PAID" },
    });

    if (order.tableId) {
      await prisma.barTable.update({
        where: { id: order.tableId },
        data: { status: "AVAILABLE" },
      });
    }
  }

  return NextResponse.json({ success: true, payment });
}
