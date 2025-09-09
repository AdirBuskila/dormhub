// app/components/ValueGrid.tsx
import { ValueCard } from "./ValueCard";

export default function ValueGrid({ items }: { items: { title: string; desc: string }[] }) {
  return (
    <section className="mx-auto max-w-6xl px-6 py-8 grid gap-4 md:grid-cols-3">
      {items.map((it) => (
        <ValueCard key={it.title} title={it.title} desc={it.desc} />
      ))}
    </section>
  );
}
