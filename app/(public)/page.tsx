// app/(public)/page.tsx
import Auth0Provider from "../components/Auth0Provider";
import Profile from "../components/Profile";
import Logo from "../components/Logo";
import Nav from "../components/Nav";
import { ValueCard } from "../components/ValueCard";
import { Hero } from "../components/Hero";
import { FeatureGrid } from "../components/FeatureGrid";
import { HeaderBar } from "../components/Headerbar";

export default function Landing() {
  return (
    <Auth0Provider>
      <main className="min-h-screen bg-base-100">
        {/* Top bar */}
        <HeaderBar />

        {/* Hero */}
        <Hero />

        {/* Features grid */}
        <FeatureGrid />

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



