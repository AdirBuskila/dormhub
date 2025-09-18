import { NextResponse } from "next/server";
import { auth0 } from "@/lib/auth0";
import { getRepos } from "@/lib/repos";
import { UpdateTipInput } from "@/lib/validation/tips";

type Params = { params: { id: string } };

export async function GET(_request: Request, { params }: Params) {
  try {
    const repos = await getRepos();
    const tip = await repos.tips.get(params.id);
    if (!tip) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(tip, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: Params) {
  try {
    const session = await auth0.getSession();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const parsed = UpdateTipInput.safeParse(body);
    if (!parsed.success) {
      const { fieldErrors, formErrors } = parsed.error.flatten();
      return NextResponse.json({ error: "Validation failed", details: fieldErrors, form: formErrors }, { status: 400 });
    }

    const repos = await getRepos();
    const updated = await repos.tips.update(params.id, parsed.data, session.user.sub as string);
    return NextResponse.json(updated, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  try {
    const session = await auth0.getSession();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const repos = await getRepos();
    await repos.tips.remove(params.id, session.user.sub as string);
    return new NextResponse(null, { status: 204 });
  } catch (err: any) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}


