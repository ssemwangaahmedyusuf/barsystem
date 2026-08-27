import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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
    maxAge: 60 * 60 * 12, // 12 hours
  });

  return response;
}
