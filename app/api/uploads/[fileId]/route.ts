import { NextResponse } from "next/server";
import { auth0 } from "@/lib/auth0";
import { deleteImage } from "@/lib/appwrite/storage";

type Params = { params: { fileId: string } };

export async function DELETE(_request: Request, { params }: Params) {
  try {
    const session = await auth0.getSession();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    await deleteImage(params.fileId);
    return new NextResponse(null, { status: 204 });
  } catch (err: any) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}


