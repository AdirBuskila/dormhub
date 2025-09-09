// app/components/FeatureGrid.tsx
import { FeatureCard } from "./FeatureCard";

export const FeatureGrid = () => {
  return (<section className="mx-auto max-w-6xl px-6 py-8">
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
  </section>)
}
