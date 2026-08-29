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
  const { capacity, status } = body;

  const table = await prisma.barTable.findUnique({ where: { id } });
  if (!table) {
    return NextResponse.json({ error: "Table not found" }, { status: 404 });
  }

  const data: { capacity?: number; status?: "AVAILABLE" | "OCCUPIED" } = {};

  if (capacity !== undefined) {
    if (capacity === null || Number(capacity) <= 0) {
      return NextResponse.json({ error: "Capacity must be a positive number" }, { status: 400 });
    }
    data.capacity = Number(capacity);
  }

  if (status !== undefined) {
    if (status !== "AVAILABLE" && status !== "OCCUPIED") {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }
    data.status = status;
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
  }

  const updated = await prisma.barTable.update({ where: { id }, data });

  return NextResponse.json({ success: true, table: updated });
}
