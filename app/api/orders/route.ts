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
  const { tableId, items } = body;

  if (!items || items.length === 0) {
    return NextResponse.json(
      { error: "Order must have at least one item" },
      { status: 400 }
    );
  }

  const products = await prisma.product.findMany({
    where: { id: { in: items.map((i: { productId: string }) => i.productId) } },
  });

  // Check stock availability before creating the order
  for (const item of items as { productId: string; quantity: number }[]) {
    const product = products.find((p) => p.id === item.productId);
    if (!product) {
      return NextResponse.json(
        { error: "One of the products no longer exists" },
        { status: 400 }
      );
    }
    if (product.currentStock < item.quantity) {
      return NextResponse.json(
        { error: `Not enough stock for ${product.name}. Only ${product.currentStock} left.` },
        { status: 400 }
      );
    }
  }

  let subtotal = 0;
  const orderItemsData = items.map((item: { productId: string; quantity: number }) => {
    const product = products.find((p) => p.id === item.productId);
    const unitPrice = product?.sellingPrice || 0;
    const total = unitPrice * item.quantity;
    subtotal += total;
    return {
      productId: item.productId,
      quantity: item.quantity,
      unitPrice,
      total,
    };
  });

  const orderNumber = `ORD-${Date.now()}`;

  const order = await prisma.$transaction(async (tx) => {
    const created = await tx.order.create({
      data: {
        orderNumber,
        tableId: tableId || null,
        waiterId: userId,
        createdById: userId,
        subtotal,
        total: subtotal,
        status: "OPEN",
        items: {
          create: orderItemsData,
        },
      },
      include: { items: true },
    });

    // Reduce stock for each product ordered
    for (const item of items as { productId: string; quantity: number }[]) {
      await tx.product.update({
        where: { id: item.productId },
        data: { currentStock: { decrement: item.quantity } },
      });
    }

    return created;
  });

  return NextResponse.json({ success: true, order });
}
