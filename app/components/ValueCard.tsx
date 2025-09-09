
export const ValueCard = ({ title, desc }: { title: string; desc: string }) => {
    return (
        <div className="rounded-2xl border p-5 bg-base-200">
            <div className="font-semibold mb-1">{title}</div>
            <p className="text-sm opacity-80">{desc}</p>
        </div>
    );
}
