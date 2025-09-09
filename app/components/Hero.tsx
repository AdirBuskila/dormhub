// app/components/Hero.tsx
import Link from "next/link";
import { FeatureChip } from "./FeatureChip";
import { StatRow } from "./StatRow";

export const Hero = () => {
  return (
    <section className="mx-auto max-w-6xl px-6 py-10 md:py-16 grid gap-8 md:grid-cols-2 items-center">
      <div className="space-y-5">
        <h1 className="text-3xl md:text-5xl font-extrabold leading-tight">
          Your dorm’s <span className="text-primary">one-stop hub</span> for tips,
          swaps, rides & study buddies.
        </h1>
        <p className="text-base md:text-lg opacity-80">
          DormHub pulls together what’s usually scattered across chats and spreadsheets:
          real student tips, deals that actually fit your apartment, rides that leave on time,
          and fast study matches by course.
        </p>

        <div className="flex flex-wrap gap-3 pt-2">
          <Link href="/tips" className="btn btn-primary">Explore Tips & Recos</Link>
          <Link href="/studybuddy" className="btn btn-ghost">Find a Study Buddy</Link>
        </div>

        <p className="text-sm opacity-70">
          No spam. Just useful stuff from people living in the same dorms as you.
        </p>
      </div>

      {/* Visual / Accent card */}
      <div className="order-first md:order-last">
        <div className="rounded-3xl border shadow-sm p-5 bg-base-200">
          <div className="grid grid-cols-2 gap-3">
            <FeatureChip title="Swap & Sell" desc="Furniture, appliances, books" />
            <FeatureChip title="Study Buddy" desc="Match by course & time" />
            <FeatureChip title="Ride Share" desc="Split costs, arrive together" />
            <FeatureChip title="Tips & Recos" desc="Products that actually fit" />
          </div>
          <div className="mt-5 rounded-2xl p-4 bg-base-100 border">
            <StatRow label="Active tips this week" value="42" />
            <StatRow label="Items listed today" value="9" />
            <StatRow label="Rides this weekend" value="7" />
          </div>
        </div>
      </div>
    </section>
  )
}