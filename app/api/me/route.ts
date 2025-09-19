import { NextResponse } from "next/server";
import { auth0 } from "@/lib/auth0";

export async function GET() {
  try {
    const session = await auth0.getSession();
    const userId = (session?.user as any)?.sub || null;
    return NextResponse.json({ userId }, { status: 200 });
  } catch {
    return NextResponse.json({ userId: null }, { status: 200 });
  }
}


