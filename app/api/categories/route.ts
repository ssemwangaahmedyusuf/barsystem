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
    return NextResponse.json({ error: "Only managers can add categories" }, { status: 403 });
  }

  const body = await request.json();
  const { name } = body;

  if (!name || !name.trim()) {
    return NextResponse.json({ error: "Category name is required" }, { status: 400 });
  }

  const existing = await prisma.category.findUnique({ where: { name: name.trim() } });
  if (existing) {
    return NextResponse.json({ error: "A category with that name already exists" }, { status: 400 });
  }

  const category = await prisma.category.create({ data: { name: name.trim() } });

  return NextResponse.json({ success: true, category });
}
