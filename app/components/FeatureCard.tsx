import Link from "next/link";

export const FeatureCard = ({ href, title, blurb, cta, }: {
    href: string; title: string; blurb: string; cta: string;
}) => {
    return (
        <Link href={href} className="rounded-2xl border p-5 bg-base-100 hover:shadow-md transition">
            <div className="font-semibold mb-1">{title}</div>
            <p className="text-sm opacity-80 mb-3">{blurb}</p>
            <span className="btn btn-sm btn-ghost">{cta}</span>
        </Link>
    );
}
