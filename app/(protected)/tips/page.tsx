// app/(protected)/tips/page.tsx
import { getRepos } from "@/lib/repos";
import TipCard from "./TipCard";
import { AddButton } from "@/app/(protected)/tips/AddButton";
import { TipModal } from "./TipModal.client";
import TipDetailModal from "./TipDetailModal.client";

type Props = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function TipsPage({ searchParams }: Props) {
  const sp = (await searchParams) ?? {};

  const page = Math.max(1, Number(sp.page ?? "1"));
  const pageSize = 20;

  const filter = {
    type: (sp.type as "text" | "product" | undefined) ?? undefined,
    q: (sp.q as string | undefined) ?? undefined,
    sort: ((sp.sort as "top" | "new" | undefined) ?? "top"),
    tag: (sp.tag as string | undefined) ?? undefined,
    hasImage: sp.img === "1",
    sinceDays: sp.days ? Number(sp.days) : undefined,
  } as const;

  const repos = await getRepos();
  const data = await repos.tips.list(filter, { page, pageSize });

  // helper: rebuild the querystring
  const buildQS = (overrides: Record<string, string>) => {
    const qs = new URLSearchParams();
    for (const [k, v] of Object.entries(sp)) {
      if (typeof v === "string") qs.set(k, v);
    }
    for (const [k, v] of Object.entries(overrides)) {
      if (v === "") qs.delete(k);
      else qs.set(k, v);
    }
    return qs.toString();
  };

  return (
    <main className="p-6 space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Tips & Recommendations</h1>

        <form className="flex gap-2" action="/tips" method="GET">
          <input
            name="q"
            defaultValue={(sp.q as string) ?? ""}
            placeholder="Search tips..."
            className="input input-sm input-bordered"
          />
          <select
            name="type"
            defaultValue={(sp.type as string) ?? ""}
            className="select select-sm select-bordered"
          >
            <option value="">All</option>
            <option value="text">Text</option>
            <option value="product">Product</option>
          </select>
          <select
            name="sort"
            defaultValue={(sp.sort as string) ?? "new"}
            className="select select-sm select-bordered"
          >
            <option value="new">Newest</option>
            <option value="top">Top</option>
          </select>
          <button className="btn btn-sm" type="submit">Apply</button>
        </form>
      </header>

      {data.items.length === 0 ? (
        <p className="opacity-70">No tips yet. Be the first to add one!</p>
      ) : (
        <section className="grid gap-4">
          {data.items.map((tip) => (
            <TipCard key={tip.id} tip={tip} />
          ))}
        </section>
      )}

      <nav className="flex justify-between pt-2">
        {page > 1 ? (
          <a className="btn btn-sm btn-ghost" href={`/tips?${buildQS({ page: String(page - 1) })}`}>
            ← Prev
          </a>
        ) : <span />}
        {data.items.length === pageSize ? (
          <a className="btn btn-sm btn-ghost" href={`/tips?${buildQS({ page: String(page + 1) })}`}>
            Next →
          </a>
        ) : <span />}
      </nav>
      <AddButton/>
      <TipModal />
      <TipDetailModal />
    </main>
  );
}
