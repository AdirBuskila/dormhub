import { NextResponse } from "next/server";
import { auth0 } from "@/lib/auth0";
import { uploadWebFile, makeImagePublic } from "@/lib/appwrite/storage";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    const session = await auth0.getSession();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const contentType = request.headers.get("content-type") || "";
    if (!contentType.startsWith("multipart/form-data")) {
      return NextResponse.json({ error: "Expected multipart/form-data" }, { status: 400 });
    }

    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Missing file" }, { status: 400 });
    }

    // Basic validation: size/type (adjust as needed)
    const maxBytes = 5 * 1024 * 1024;
    if (file.size > maxBytes) return NextResponse.json({ error: "Max 5MB" }, { status: 413 });
    const allowed = ["image/jpeg", "image/png", "image/webp"];
    if (!allowed.includes(file.type)) return NextResponse.json({ error: "Invalid type" }, { status: 415 });

    const uploaded = await uploadWebFile(file);
    // Ensure file has public read permissions (defense in depth if bucket defaults differ)
    await makeImagePublic(uploaded.fileId);
    return NextResponse.json(uploaded, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}


