"use client";

import { omit } from "@/lib/url/qs";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";
import TipForm from "./TipForm.client";

export const TipModal = () => {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const isOpen = searchParams.get("new") === "1";
  const ref = useRef<HTMLDialogElement>(null);

  // Keep native <dialog> state in sync with URL (?new=1)
  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (isOpen && !dialog.open) dialog.showModal();
    if (!isOpen && dialog.open) dialog.close();
  }, [isOpen]);

  const closeUrl = omit(pathname, searchParams, ["new"]);
  const handleClose = () => router.replace(closeUrl);

  return (
    <dialog
      ref={ref}
      className="modal items-center justify-center"
      onClose={handleClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-tip-title"
    >
      <div className="modal-box max-w-2xl">
        <div className="mb-4">
          <h3 id="add-tip-title" className="text-xl font-semibold">
            Add a tip
          </h3>
          <p className="text-sm opacity-70">
            Share a dorm hack or a product recommendation with the community.
          </p>
        </div>

        <TipForm
          onCancel={handleClose}
          onSuccess={() => {
            // Close modal + refresh list to show the new tip
            handleClose();
            router.refresh();
          }}
        />

      </div>

      {/* Backdrop closes the modal too */}
      <form method="dialog" className="modal-backdrop">
        <button aria-label="Close" />
      </form>
    </dialog>
  );
};

export default TipModal;
