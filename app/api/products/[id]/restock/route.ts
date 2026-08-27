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
    return NextResponse.json({ error: "Only managers can restock products" }, { status: 403 });
  }

  const body = await request.json();
  const { quantity } = body;
  const qty = parseFloat(quantity);

  if (!qty || qty <= 0) {
    return NextResponse.json({ error: "Enter a valid quantity greater than 0" }, { status: 400 });
  }

  const product = await prisma.product.update({
    where: { id },
    data: { currentStock: { increment: qty } },
  });

  return NextResponse.json({ success: true, product });
}
