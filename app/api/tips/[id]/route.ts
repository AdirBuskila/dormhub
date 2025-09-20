// app/api/tips/[id]/route.ts
import { NextResponse } from "next/server";
import { auth0 } from "@/lib/auth0";
import { getRepos } from "@/lib/repos";
import { UpdateTipInput } from "@/lib/validation/tips";

// Helper that resolves `context.params` whether it's provided as an object
// or a Promise (the runtime can vary across Next versions / tooling).
async function resolveIdFromContext(context: { params: any }) {
  const p = context.params;
  if (p && typeof p.then === "function") {
    const resolved = await p;
    return resolved.id;
  }
  return p.id;
}

// GET /api/tips/:id  -> returns a tip by id
export async function GET(_request: Request, context: { params: any }) {
  try {
    const id = await resolveIdFromContext(context);
    const repos = await getRepos();
    const tip = await repos.tips.get(id);
    if (!tip) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(tip, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// PUT /api/tips/:id  -> replace/update tip (requires auth)
export async function PUT(request: Request, context: { params: any }) {
  try {
    const id = await resolveIdFromContext(context);
    const session = await auth0.getSession();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const parsed = UpdateTipInput.safeParse(body);
    if (!parsed.success) {
      const { fieldErrors, formErrors } = parsed.error.flatten();
      return NextResponse.json({ error: "Validation failed", details: fieldErrors, form: formErrors }, { status: 400 });
    }

    const repos = await getRepos();
    const updated = await repos.tips.update(id, parsed.data, session.user.sub as string);
    return NextResponse.json(updated, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// DELETE /api/tips/:id  -> delete (requires auth)
export async function DELETE(_request: Request, context: { params: any }) {
  try {
    const id = await resolveIdFromContext(context);
    const session = await auth0.getSession();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const repos = await getRepos();
    await repos.tips.remove(id, session.user.sub as string);
    return new NextResponse(null, { status: 204 });
  } catch (err: any) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
