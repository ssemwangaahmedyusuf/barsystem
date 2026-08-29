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
  const { name, capacity } = body;

  if (!name || typeof name !== "string" || !name.trim()) {
    return NextResponse.json({ error: "Table name is required" }, { status: 400 });
  }

  const existing = await prisma.barTable.findFirst({ where: { name: name.trim() } });
  if (existing) {
    return NextResponse.json({ error: "A table with that name already exists" }, { status: 400 });
  }

  const table = await prisma.barTable.create({
    data: {
      name: name.trim(),
      capacity: capacity ? Number(capacity) : null,
      status: "AVAILABLE",
    },
  });

  return NextResponse.json({ success: true, table });
}
