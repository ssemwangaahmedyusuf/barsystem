import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

export async function POST(request: NextRequest) {
  const cookieStore = await cookies();
  const userId = cookieStore.get("userId")?.value;

  if (!userId) {
    return NextResponse.json({ error: "Not logged in" }, { status: 401 });
  }

  const currentUser = await prisma.user.findUnique({ where: { id: userId } });

  if (!currentUser || currentUser.role !== "MANAGER") {
    return NextResponse.json(
      { error: "Only managers can add products" },
      { status: 403 }
    );
  }

  const body = await request.json();
  const { name, categoryId, unit, costPrice, sellingPrice, currentStock, minimumStock } = body;

  if (!name || !categoryId) {
    return NextResponse.json(
      { error: "Name and category are required" },
      { status: 400 }
    );
  }

  const product = await prisma.product.create({
    data: {
      name,
      categoryId,
      unit: unit || "bottle",
      costPrice: parseFloat(costPrice) || 0,
      sellingPrice: parseFloat(sellingPrice) || 0,
      currentStock: parseFloat(currentStock) || 0,
      minimumStock: parseFloat(minimumStock) || 0,
    },
  });

  return NextResponse.json({ success: true, product });
}
