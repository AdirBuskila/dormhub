import { NextResponse } from "next/server";
import { getRepos } from "@/lib/repos";
import { auth0 } from "@/lib/auth0";
import { ListTipsFilter } from "@/lib/validation/tips";

// GET /api/tips -> list tips with optional q/tag filters and pagination
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const filter = {
      tag: searchParams.get("tag") ?? undefined,
      q: searchParams.get("q") ?? undefined,
    };
    const page = Number(searchParams.get("page") ?? "1");
    const pageSize = Number(searchParams.get("pageSize") ?? "20");

    const filterParse = ListTipsFilter.safeParse(filter);
    if (!filterParse.success) {
      return NextResponse.json({ error: "Invalid query" }, { status: 400 });
    }

    const repos = await getRepos();
    const result = await repos.tips.list(filterParse.data, { page, pageSize });
    return NextResponse.json(result, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// POST /api/tips -> create a new tip (requires auth)
export async function POST(request: Request) {
  try {
    const session = await auth0.getSession();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    let body: any;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    if (!body?.title || !body?.type) {
      return NextResponse.json({ error: "Missing required fields: title, type" }, { status: 400 });
    }

    const repos = await getRepos();
    const created = await repos.tips.create(
      { ...body, ownerId: session.user.sub },
      session.user.sub as string
    );

    return NextResponse.json(created, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
