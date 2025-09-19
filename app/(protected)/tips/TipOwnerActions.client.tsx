"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteTipAction } from "./tipActions.server";

export default function TipOwnerActions({ id }: { id: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();

  return (
    <div className="flex gap-2">
      <a className="btn btn-sm" href={`/tips?edit=${id}`}>Edit</a>
      <button
        className={`btn btn-sm btn-error ${pending ? "loading" : ""}`}
        onClick={() =>
          start(async () => {
            await deleteTipAction(id);
            router.push("/tips");
            router.refresh();
          })
        }
        disabled={pending}
      >
        Delete
      </button>
    </div>
  );
}


