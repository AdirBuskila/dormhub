import { NextResponse } from "next/server";
import { auth0 } from "@/lib/auth0";
import { UserUpsertInput } from "@/lib/validation/users";
import { upsertUser } from "@/lib/repos/appwrite/usersRepo";

export async function POST(request: Request) {
  try {
    const session = await auth0.getSession();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const parsed = UserUpsertInput.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: "Invalid payload" }, { status: 400 });

    const created = await upsertUser(parsed.data);
    return NextResponse.json(created, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}


