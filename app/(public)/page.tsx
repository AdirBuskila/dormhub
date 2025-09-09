// app/(public)/page.tsx
import Auth0Provider from "../components/Auth0Provider";
import Profile from "../components/Profile";
import Logo from "../components/Logo";
import Nav from "../components/Nav";
import Links from "../components/Links";
import Link from "next/link";
import { FeatureChip } from "../components/FeatureChip";
import { StatRow } from "../components/StatRow";
import { ValueCard } from "../components/ValueCard";
import { FeatureCard } from "../components/FeatureCard";

export default function Landing() {
  return (
    <Auth0Provider>
      <main className="min-h-screen bg-base-100">
        {/* Top bar */}
        <header className="mx-auto max-w-6xl px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Logo />
            <span className="font-semibold tracking-tight">DormHub</span>
          </div>
          <Nav />
        </header>

        {/* Hero */}
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

        {/* Value props */}
        <section className="mx-auto max-w-6xl px-6 py-8 grid gap-4 md:grid-cols-3">
          <ValueCard
            title="Save time"
            desc="Answers to common dorm questions in one place — laundry, internet, maintenance."
          />
          <ValueCard
            title="Save money"
            desc="Tried-and-true products that fit our dorm dimensions, plus second-hand deals."
          />
          <ValueCard
            title="Meet people"
            desc="Study partners and shared rides with neighbors on your schedule."
          />
        </section>

        {/* Features grid */}
        <section className="mx-auto max-w-6xl px-6 py-8">
          <h2 className="text-xl font-semibold mb-4">Jump in</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <FeatureCard
              href="/marketplace"
              title="Swap & Sell"
              blurb="List what you don’t need; find what you do. Photos and quick pricing."
              cta="Open Marketplace"
            />
            <FeatureCard
              href="/studybuddy"
              title="Study Buddy"
              blurb="Post your course and availability. Connect fast with classmates."
              cta="Find a Buddy"
            />
            <FeatureCard
              href="/rideshare"
              title="Ride Share"
              blurb="Offer or request seats. Safer, cheaper, friendlier trips."
              cta="Share a Ride"
            />
            <FeatureCard
              href="/tips"
              title="Tips & Recos"
              blurb="Dorm-specific advice and product recommendations that actually fit."
              cta="Browse Tips"
            />
          </div>
        </section>

        {/* Social proof-ish bar */}
        <section className="mx-auto max-w-6xl px-6 py-6">
          <div className="rounded-2xl border bg-base-200 px-5 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <p className="text-sm md:text-base">
              Students are already sharing tips and saving money. Join in.
            </p>
            <div className="flex gap-2">
              <a href="/auth/login?screen_hint=signup" className="btn btn-primary btn-sm">Create account</a>
              <a href="/auth/login" className="btn btn-ghost btn-sm">Log in</a>
            </div>
          </div>
        </section>

        {/* Profile strip */}
        <section className="mx-auto max-w-6xl px-6 pb-10">
          <div className="rounded-2xl border p-4">
            <Profile />
          </div>
        </section>

        {/* Footer */}
        <footer className="mx-auto max-w-6xl px-6 pb-10 text-sm opacity-70">
          <p>Built by residents, for residents. Be kind. Share useful stuff. 🌿</p>
        </footer>
      </main>
    </Auth0Provider>
  );
}

/* --- Local tiny components (kept in this file for now for clarity) --- */



