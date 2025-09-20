import { NextResponse } from "next/server";
import { auth0 } from "@/lib/auth0";
import { deleteImage } from "@/lib/appwrite/storage";

async function resolveFileId(context: { params: any }) {
  const p = context.params;
  if (p && typeof p.then === "function") {
    const resolved = await p;
    return resolved.fileId;
  }
  return p.fileId;
}

export async function DELETE(_request: Request, context: { params: any }) {
  try {
    const fileId = await resolveFileId(context);
    const session = await auth0.getSession();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    await deleteImage(fileId);
    return new NextResponse(null, { status: 204 });
  } catch (err: any) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}


