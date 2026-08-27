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
      { error: "Only managers can add staff" },
      { status: 403 }
    );
  }

  const body = await request.json();
  const { firstName, lastName, pin, role } = body;

  if (!firstName || !lastName || !pin) {
    return NextResponse.json(
      { error: "First name, last name, and PIN are required" },
      { status: 400 }
    );
  }

  const existingPin = await prisma.user.findUnique({ where: { pin } });
  if (existingPin) {
    return NextResponse.json(
      { error: "That PIN is already in use. Choose a different one." },
      { status: 400 }
    );
  }

  const username = `${firstName.toLowerCase()}.${lastName.toLowerCase()}.${Date.now()}`;

  const user = await prisma.user.create({
    data: {
      username,
      passwordHash: "not-used",
      pin,
      firstName,
      lastName,
      role: role || "WAITER",
      isActive: true,
    },
  });

  return NextResponse.json({ success: true, user });
}
