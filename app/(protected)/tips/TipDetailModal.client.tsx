"use client";

import { omit } from "@/lib/url/qs";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import type { Tip } from "@/lib/types";
import { deleteTipAction, toggleHelpfulAction, reportTipAction } from "./tipActions.server";

export default function TipDetailModal() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const id = searchParams.get("view");
  const isOpen = Boolean(id);
  const ref = useRef<HTMLDialogElement>(null);
  const [tip, setTip] = useState<Tip | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [pendingDelete, startDelete] = useTransition();
  const [pendingHelpful, startHelpful] = useTransition();
  const [pendingReport, startReport] = useTransition();

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (isOpen && !dialog.open) dialog.showModal();
    if (!isOpen && dialog.open) dialog.close();
  }, [isOpen]);

  useEffect(() => {
    if (!id) { setTip(null); setError(null); return; }
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/tips/${id}`);
        if (!res.ok) throw new Error(`Failed ${res.status}`);
        const data = (await res.json()) as Tip;
        if (!cancelled) setTip(data);
      } catch (e: any) {
        if (!cancelled) setError(e.message ?? "Failed to load");
      }
    })();
    return () => { cancelled = true };
  }, [id]);

  // Fetch current user id for owner check
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/me');
        const data = await res.json();
        if (!cancelled) setUserId(data.userId ?? null);
      } catch { }
    })();
    return () => { cancelled = true };
  }, []);

  const closeUrl = omit(pathname, searchParams, ["view"]);
  const handleClose = () => router.replace(closeUrl);

  return (
    <dialog ref={ref} className="modal" onClose={handleClose}>
      <div className="modal-box max-w-2xl">
        <div className="mb-3 flex justify-between items-center">
          <h3 className="text-xl font-semibold">Tip details</h3>
          <button className="btn btn-sm btn-ghost" onClick={handleClose}>✕</button>
        </div>
        {error && <div className="alert alert-error"><span>{error}</span></div>}
        {!tip && !error && <p className="opacity-70">Loading…</p>}
        {tip && (
          <div className="space-y-4">
            <header className="space-y-1">
              <h4 className="text-xl font-semibold">{tip.title}</h4>
              <p className="text-xs opacity-70">{new Date(tip.createdAt).toLocaleString()}</p>
              {!!(tip.tags && tip.tags.length) && (
                <div className="flex flex-wrap gap-1">
                  {tip.tags.map((t) => (
                    <span key={t} className="badge badge-ghost badge-sm">{t}</span>
                  ))}
                </div>
              )}
            </header>

            <p className="text-sm leading-6">{tip.text}</p>

            {tip.type === 'product' && (
              <div className="rounded border p-3 grid grid-cols-1 sm:grid-cols-2 gap-3 bg-base-200/30">
                <a href={(tip as any).productUrl} target="_blank" rel="noopener noreferrer" className="link">
                  Open product ↗
                </a>
                <div className="text-sm space-x-3">
                  {typeof (tip as any).approxPriceIls === 'number' && (
                    <span>~₪{(tip as any).approxPriceIls}</span>
                  )}
                  {(tip as any).store && <span>Store: {(tip as any).store}</span>}
                  {(tip as any).apartmentFit && <span>Fit: {(tip as any).apartmentFit}</span>}
                </div>
              </div>
            )}

            {!!tip.images?.length && (
              <div className="grid grid-cols-3 gap-2">
                {tip.images.map((src) => (
                  <img key={src} src={src} alt="" className="aspect-square w-full rounded object-cover" />
                ))}
              </div>
            )}

            <div className="flex items-center gap-2">
              <button
                className={`btn btn-sm ${pendingHelpful ? 'loading' : ''}`}
                onClick={() => startHelpful(async () => { await toggleHelpfulAction(tip.id); router.refresh(); })}
                disabled={pendingHelpful}
              >
                👍 Helpful ({tip.helpfulCount})
              </button>
              <button
                className={`btn btn-sm btn-ghost ${pendingReport ? 'loading' : ''}`}
                onClick={() => startReport(async () => { await reportTipAction(tip.id); router.refresh(); })}
                disabled={pendingReport}
              >
                ⚑ Report
              </button>
            </div>

            {userId && userId === tip.ownerId && (
              <div className="flex gap-2 pt-1">
                <a className="btn btn-sm" href={`/tips?edit=${tip.id}`}>Edit</a>
                <button
                  className={`btn btn-sm btn-error ${pendingDelete ? 'loading' : ''}`}
                  onClick={() => startDelete(async () => { await deleteTipAction(tip.id); router.replace('/tips'); router.refresh(); })}
                  disabled={pendingDelete}
                >
                  Delete
                </button>
              </div>
            )}
          </div>
        )}
      </div>
      <form method="dialog" className="modal-backdrop"><button aria-label="Close" /></form>
    </dialog>
  );
}


