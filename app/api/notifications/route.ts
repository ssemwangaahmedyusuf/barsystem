import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

export async function GET() {
  const cookieStore = await cookies();
  const userId = cookieStore.get("userId")?.value;
  const currentUser = userId
    ? await prisma.user.findUnique({ where: { id: userId } })
    : null;

  if (!currentUser || currentUser.role !== "MANAGER") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const notifications = await prisma.notification.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
    include: { user: true },
  });

  const unreadCount = await prisma.notification.count({ where: { read: false } });

  return NextResponse.json({ notifications, unreadCount });
}

export async function PATCH(request: NextRequest) {
  const cookieStore = await cookies();
  const userId = cookieStore.get("userId")?.value;
  const currentUser = userId
    ? await prisma.user.findUnique({ where: { id: userId } })
    : null;

  if (!currentUser || currentUser.role !== "MANAGER") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const { markAllRead } = body;

  if (markAllRead) {
    await prisma.notification.updateMany({
      where: { read: false },
      data: { read: true },
    });
  }

  return NextResponse.json({ success: true });
}
