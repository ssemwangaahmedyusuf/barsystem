import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getBusinessDayStart, getBusinessDayEnd } from "@/lib/business-day";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { pin } = body;

  if (!pin || typeof pin !== "string") {
    return NextResponse.json(
      { error: "PIN is required" },
      { status: 400 }
    );
  }

  const user = await prisma.user.findUnique({
    where: { pin },
  });

  if (!user || !user.isActive) {
    return NextResponse.json(
      { error: "Invalid PIN" },
      { status: 401 }
    );
  }

  const sessionExpiry = getBusinessDayEnd(getBusinessDayStart());

  await prisma.notification.create({
    data: {
      type: "LOGIN",
      message: `${user.firstName} ${user.lastName} logged in`,
      userId: user.id,
    },
  });

  const response = NextResponse.json({
    success: true,
    user: {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
    },
  });

  response.cookies.set("userId", user.id, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    expires: sessionExpiry,
  });

  return response;
}
