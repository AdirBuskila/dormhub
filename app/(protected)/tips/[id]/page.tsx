import { getRepos } from "@/lib/repos";
import { auth0 } from "@/lib/auth0";

type Props = { params: { id: string } };

export default async function TipDetailPage({ params }: Props) {
  const repos = await getRepos();
  const tip = await repos.tips.get(params.id);
  const session = await auth0.getSession();
  if (!tip) {
    return (
      <main className="p-6">
        <h1 className="text-xl font-semibold">Tip not found</h1>
        <a href="/tips" className="link">Back to tips</a>
      </main>
    );
  }
  return (
    <main className="p-6 space-y-4">
      <a href="/tips" className="link">← Back to tips</a>
      <h1 className="text-2xl font-semibold">{tip.title}</h1>
      <p className="text-sm opacity-70">{new Date(tip.createdAt).toLocaleString()}</p>
      <p className="text-base">{tip.text}</p>
      {!!tip.images?.length && (
        <div className="flex gap-2 flex-wrap pt-2">
          {tip.images.map((src) => (
            <img key={src} src={src} alt="" className="h-28 w-28 rounded object-cover" />
          ))}
        </div>
      )}
    </main>
  );
}