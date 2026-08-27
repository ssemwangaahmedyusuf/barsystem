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

  const currentUser = await prisma.user.findUnique({ where: { id: userId } });

  if (!currentUser || currentUser.role !== "MANAGER") {
    return NextResponse.json(
      { error: "Only managers can change staff PINs" },
      { status: 403 }
    );
  }

  const body = await request.json();
  const { pin } = body;

  if (!pin || typeof pin !== "string" || pin.length < 4) {
    return NextResponse.json(
      { error: "PIN must be at least 4 digits" },
      { status: 400 }
    );
  }

  const existingActivePin = await prisma.user.findFirst({
    where: { pin, isActive: true, id: { not: id } },
  });
  if (existingActivePin) {
    return NextResponse.json(
      { error: "That PIN is currently in use by another active staff member." },
      { status: 400 }
    );
  }

  const updated = await prisma.user.update({
    where: { id },
    data: { pin },
  });

  return NextResponse.json({ success: true, user: updated });
}
