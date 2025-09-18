"use client";

import { useTransition } from "react";
import type { Tip } from "@/lib/types";
import { toggleHelpfulAction, reportTipAction } from "./tipActions.server"

export default function TipCard({ tip }: { tip: Tip }) {
  const [pendingHelpful, startHelpful] = useTransition();
  const [pendingReport, startReport] = useTransition();

  const isProduct = tip.type === "product";

  return (
    <article className="rounded-2xl border p-4 space-y-2">
      <header className="flex items-baseline justify-between">
        <a href={`/tips?view=${tip.id}`} className="text-lg font-semibold underline-offset-2 hover:underline">{tip.title}</a>
        <span className="text-xs opacity-70">
          {new Date(tip.createdAt).toLocaleDateString()}
        </span>
      </header>

      <p className="text-sm">{tip.text}</p>

      {isProduct && (
        <div className="text-sm">
          <a
            href={tip.productUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
          >
            Open product
          </a>
          {" • "}
          {typeof tip.approxPriceIls === "number" && (
            <span>~₪{tip.approxPriceIls}</span>
          )}
        </div>
      )}

      {!!tip.images?.length && (
        <div className="flex gap-2 pt-2">
          {tip.images.slice(0, 3).map((src) => (
            <img key={src} src={src} alt="" className="h-16 w-16 rounded object-cover" />
          ))}
        </div>
      )}

      <footer className="flex gap-3 pt-2 text-sm">
        <button
          className="btn btn-sm"
          disabled={pendingHelpful}
          onClick={() => startHelpful(async () => { await toggleHelpfulAction(tip.id); })}
        >
          👍 Helpful ({tip.helpfulCount})
        </button>

        <button
          className="btn btn-sm btn-ghost"
          disabled={pendingReport}
          onClick={() => startReport(async () => { await reportTipAction(tip.id); })}
        >
          ⚑ Report
        </button>

        {tip.status !== "active" && (
          <span className="text-xs px-2 py-1 rounded bg-yellow-100">
            {tip.status}
          </span>
        )}
      </footer>
    </article>
  );
}
