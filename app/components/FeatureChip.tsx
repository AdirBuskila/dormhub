export const  FeatureChip =({ title, desc }: { title: string; desc: string }) => {
  return (
    <div className="rounded-xl bg-base-100 border p-4">
      <div className="font-semibold">{title}</div>
      <div className="text-sm opacity-70">{desc}</div>
    </div>
  );
}