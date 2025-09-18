import { NextResponse } from "next/server";
import { auth0 } from "@/lib/auth0";
import { getRepos } from "@/lib/repos";
import { ListTipsFilter, CreateTipInput } from "@/lib/validation/tips";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const searchParams = Object.fromEntries(url.searchParams.entries());
  try {
    const filterParse = ListTipsFilter.safeParse(searchParams as any);
    if (!filterParse.success) {
      return NextResponse.json({ error: "Invalid query" }, { status: 400 });
    }

    const page = Number(searchParams.page ?? 1);
    const pageSize = Math.min(Number(searchParams.pageSize ?? 20), 50);

    const repos = await getRepos();
    const data = await repos.tips.list(filterParse.data, { page, pageSize });
    return NextResponse.json(data, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth0.getSession();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const parsed = CreateTipInput.safeParse(body);
    if (!parsed.success) {
      const { fieldErrors, formErrors } = parsed.error.flatten();
      return NextResponse.json({ error: "Validation failed", details: fieldErrors, form: formErrors }, { status: 400 });
    }

    const repos = await getRepos();
    const created = await repos.tips.create(parsed.data as any, session.user.sub as string);
    return NextResponse.json(created, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}


