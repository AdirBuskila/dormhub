export const  StatRow = ({ label, value }: { label: string; value: string }) => {
  return (
    <div className="flex items-center justify-between py-1">
      <span className="text-sm opacity-70">{label}</span>
      <span className="font-semibold">{value}</span>
    </div>
  );
}
