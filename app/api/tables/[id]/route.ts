import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const cookieStore = await cookies();
  const userId = cookieStore.get("userId")?.value;
  if (!userId) {
    return NextResponse.json({ error: "Not logged in" }, { status: 401 });
  }

  const body = await request.json();
  const { capacity } = body;

  if (capacity === undefined || capacity === null || Number(capacity) <= 0) {
    return NextResponse.json({ error: "Capacity must be a positive number" }, { status: 400 });
  }

  const table = await prisma.barTable.findUnique({ where: { id } });
  if (!table) {
    return NextResponse.json({ error: "Table not found" }, { status: 404 });
  }

  const updated = await prisma.barTable.update({
    where: { id },
    data: { capacity: Number(capacity) },
  });

  return NextResponse.json({ success: true, table: updated });
}
