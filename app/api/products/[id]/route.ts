import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

export async function DELETE(
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
    return NextResponse.json(
      { error: "Only managers can delete products" },
      { status: 403 }
    );
  }

  const orderItemCount = await prisma.orderItem.count({
    where: { productId: id },
  });

  if (orderItemCount > 0) {
    await prisma.product.update({
      where: { id },
      data: { isActive: false },
    });
    return NextResponse.json({
      success: true,
      message: "Product has order history, so it was deactivated instead of deleted.",
    });
  }

  await prisma.product.delete({ where: { id } });

  return NextResponse.json({ success: true, message: "Product deleted." });
}
