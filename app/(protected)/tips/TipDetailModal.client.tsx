"use client";

import { omit } from "@/lib/url/qs";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type { Tip } from "@/lib/types";

export default function TipDetailModal() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const id = searchParams.get("view");
  const isOpen = Boolean(id);
  const ref = useRef<HTMLDialogElement>(null);
  const [tip, setTip] = useState<Tip | null>(null);
  const [error, setError] = useState<string | null>(null);

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
          <div className="space-y-3">
            <h4 className="text-lg font-semibold">{tip.title}</h4>
            <p className="text-sm">{tip.text}</p>
            {!!tip.images?.length && (
              <div className="flex gap-2 flex-wrap">
                {tip.images.map((src) => (
                  <img key={src} src={src} alt="" className="h-20 w-20 rounded object-cover" />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
      <form method="dialog" className="modal-backdrop"><button aria-label="Close" /></form>
    </dialog>
  );
}


