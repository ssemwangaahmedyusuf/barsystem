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
      { error: "Only managers can deactivate staff" },
      { status: 403 }
    );
  }

  if (id === currentUser.id) {
    return NextResponse.json(
      { error: "You cannot deactivate your own account" },
      { status: 400 }
    );
  }

  await prisma.user.update({
    where: { id },
    data: { isActive: false },
  });

  return NextResponse.json({ success: true });
}

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
      { error: "Only managers can reactivate staff" },
      { status: 403 }
    );
  }

  const body = await request.json();

  if (body.isActive === true) {
    const target = await prisma.user.findUnique({ where: { id } });
    const existingPinHolder = await prisma.user.findFirst({
      where: { pin: target?.pin, id: { not: id }, isActive: true },
    });
    if (existingPinHolder) {
      return NextResponse.json(
        { error: "Cannot reactivate: another active user now shares this PIN" },
        { status: 400 }
      );
    }
  }

  const updated = await prisma.user.update({
    where: { id },
    data: { isActive: body.isActive },
  });

  return NextResponse.json({ success: true, user: updated });
}
