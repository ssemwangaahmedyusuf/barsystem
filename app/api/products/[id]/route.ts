import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

async function requireManager() {
  const cookieStore = await cookies();
  const userId = cookieStore.get("userId")?.value;
  if (!userId) return null;
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || user.role !== "MANAGER") return null;
  return user;
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const manager = await requireManager();

  if (!manager) {
    return NextResponse.json({ error: "Only managers can edit products" }, { status: 403 });
  }

  const body = await request.json();
  const { name, categoryId, unit, costPrice, sellingPrice, minimumStock } = body;

  if (!name || !categoryId) {
    return NextResponse.json({ error: "Name and category are required" }, { status: 400 });
  }

  const product = await prisma.product.update({
    where: { id },
    data: {
      name,
      categoryId,
      unit,
      costPrice: parseFloat(costPrice) || 0,
      sellingPrice: parseFloat(sellingPrice) || 0,
      minimumStock: parseFloat(minimumStock) || 0,
      updatedById: manager.id,
    },
  });

  return NextResponse.json({ success: true, product });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const manager = await requireManager();

  if (!manager) {
    return NextResponse.json({ error: "Only managers can delete products" }, { status: 403 });
  }

  const orderItemCount = await prisma.orderItem.count({ where: { productId: id } });

  if (orderItemCount > 0) {
    await prisma.product.update({ where: { id }, data: { isActive: false } });
    return NextResponse.json({
      success: true,
      message: "Product has order history, so it was deactivated instead of deleted.",
    });
  }

  await prisma.product.delete({ where: { id } });
  return NextResponse.json({ success: true, message: "Product deleted." });
}
