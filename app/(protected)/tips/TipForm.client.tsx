"use client";

import { useState } from "react";
// TODO 2: import your real server action
import { createTipAction } from "./tipActions.server";

type TipType = "text" | "product";
const MAX_IMAGES = 5;

type Props = {
  onCancel: () => void;
  onSuccess: () => void;
};

export default function TipForm({ onCancel, onSuccess }: Props) {
  const [type, setType] = useState<TipType>("text");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [tagsInput, setTagsInput] = useState(""); // comma-separated
  const [images, setImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // product-only
  const [productUrl, setProductUrl] = useState("");
  const [approxPriceIls, setApproxPriceIls] = useState<string>("");
  const [store, setStore] = useState("");
  const [apartmentFit, setApartmentFit] = useState("");

  const cleanTags = (raw: string) =>
    raw
      .split(",")
      .map((t) => t.trim().toLowerCase())
      .filter(Boolean)
      .map((t) => t.replace(/[^a-z0-9\- ]/gi, "").replace(/\s+/g, "-"))
      .slice(0, 5);

  const validate = () => {
    const e: Record<string, string> = {};
    if (title.trim().length < 4 || title.trim().length > 80) e.title = "4–80 chars";
    if (body.trim().length < 20 || body.trim().length > 1000) e.body = "20–1000 chars";
    if (cleanTags(tagsInput).length > 5) e.tags = "Up to 5 tags";
    if (type === "product") {
      if (!/^https?:\/\//i.test(productUrl.trim())) e.productUrl = "Valid http(s) URL";
      const price = Number(approxPriceIls);
      if (isNaN(price) || price < 0 || price > 2000) e.approxPriceIls = "0–2000 ₪";
      if (store.trim().length < 1 || store.trim().length > 60) e.store = "1–60 chars";
    }
    if (images.length > MAX_IMAGES) e.images = `Up to ${MAX_IMAGES} images`;
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // --- DaisyUI File Input + thumbnails ---
  const handlePickImages: React.ChangeEventHandler<HTMLInputElement> = async (ev) => {
    const files = Array.from(ev.target.files || []);
    if (!files.length) return;
    const remaining = MAX_IMAGES - images.length;
    const selected = files.slice(0, remaining);

    setUploading(true);
    try {
      const uploaded = await Promise.all(
        selected.map(async (file) => {
          const fd = new FormData();
          fd.append("file", file);
          const res = await fetch("/api/uploads", { method: "POST", body: fd });
          if (!res.ok) throw new Error("Upload failed");
          const data = (await res.json()) as { fileId: string; url: string };
          return data.url; // store preview URL; you can store fileId alongside if needed
        })
      );
      setImages((prev) => [...prev, ...uploaded]);
    } finally {
      setUploading(false);
      ev.target.value = "";
    }
  };

  const removeImage = (idx: number) => {
    setImages((prev) => prev.filter((_, i) => i !== idx));
  };

  const onSubmit: React.FormEventHandler<HTMLFormElement> = async (ev) => {
    ev.preventDefault();
    if (!validate() || uploading) return;

    setSubmitting(true);
    try {
      const payload: any = {
        type,
        title: title.trim(),
        text: body.trim(),
        tags: cleanTags(tagsInput),
        images, // should be Appwrite preview URLs in real impl
      };
      if (type === "product") {
        payload.productUrl = productUrl.trim();
        payload.approxPriceIls = Number(approxPriceIls);
        payload.store = store.trim();
        payload.apartmentFit = apartmentFit.trim();
      }

      const res = await createTipAction(payload)
      if (!res?.ok) {
        setErrors({ form: res?.error || "Failed to post" });
        return
      }

      onSuccess();
    } catch {
      setErrors({ form: "Something went wrong. Please try again." });
    } finally {
      setSubmitting(false);
    }
  };

  const tags = cleanTags(tagsInput);

  return (
    <form className="space-y-5" onSubmit={onSubmit}>
      {errors.form && (
        <div className="alert alert-error">
          <span>{errors.form}</span>
        </div>
      )}

      {/* TYPE (DaisyUI fieldset + radio) */}
      <fieldset className="fieldset">
        <legend className="fieldset-legend">Type</legend>
        <div className="flex items-center gap-6">
          <label className="label cursor-pointer">
            <input
              type="radio"
              name="tip-type"
              className="radio radio-primary"
              checked={type === "text"}
              onChange={() => setType("text")}
            />
            <span className="label-text">Text</span>
          </label>
          <label className="label cursor-pointer">
            <input
              type="radio"
              name="tip-type"
              className="radio radio-primary"
              checked={type === "product"}
              onChange={() => setType("product")}
            />
            <span className="label-text">Product</span>
          </label>
        </div>
        <p className="text-xs opacity-70 mt-1">Choose “Product” to add URL, price & store.</p>
      </fieldset>

      {/* TITLE */}
      <div className="form-control">
        <label className="label">
          <span className="label-text mr-2">Title</span>
        </label>
        <input
          className={`input input-bordered ${errors.title ? "input-error" : ""}`}
          placeholder="Router placement that actually works"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        {errors.title && <span className="text-xs text-error mt-1">{errors.title}</span>}
      </div>

      {/* BODY */}
      <div className="form-control">
        <label className="label">
          <span className="label-text mr-2">Text</span>
        </label>
        <textarea
          className={`textarea textarea-bordered min-h-[120px] ${errors.body ? "textarea-error" : ""}`}
          placeholder="Share the details that will help others…"
          value={body}
          onChange={(e) => setBody(e.target.value)}
        />
        {errors.body && <span className="text-xs text-error mt-1">{errors.body}</span>}
      </div>

      {/* TAGS (input + live badges) */}
      <div className="form-control">
        <label className="label">
          <span className="label-text mr-2">Tags</span>
        </label>
        <input
          className={`input input-bordered ${errors.tags ? "input-error" : ""}`}
          placeholder="Comma-separated (e.g., wifi, curtains, study)"
          value={tagsInput}
          onChange={(e) => setTagsInput(e.target.value)}
        />
        <div className="flex flex-wrap mt-2">
          {tags.map((t) => (
            <span key={t} className="badge badge-ghost">{t}</span>
          ))}
        </div>
        {errors.tags && <span className="text-xs text-error mt-1">{errors.tags}</span>}
        <p className="text-xs opacity-70 mt-1">Up to 5 tags. We normalize to lowercase slugs.</p>
      </div>

      {/* PRODUCT-ONLY GRID */}
      {type === "product" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="form-control">
            <label className="label"><span className="label-text mr-2">Product URL</span></label>
            <input
              className={`input input-bordered ${errors.productUrl ? "input-error" : ""}`}
              placeholder="https://…"
              value={productUrl}
              onChange={(e) => setProductUrl(e.target.value)}
            />
            {errors.productUrl && <span className="text-xs text-error mt-1">{errors.productUrl}</span>}
          </div>

          <div className="form-control">
            <label className="label"><span className="label-text mr-2">Approx price (₪)</span></label>
            <input
              inputMode="numeric"
              className={`input input-bordered ${errors.approxPriceIls ? "input-error" : ""}`}
              placeholder="e.g., 65"
              value={approxPriceIls}
              onChange={(e) => setApproxPriceIls(e.target.value)}
            />
            {errors.approxPriceIls && <span className="text-xs text-error mt-1">{errors.approxPriceIls}</span>}
          </div>

          <div className="form-control">
            <label className="label"><span className="label-text mr-2">Store</span></label>
            <input
              className={`input input-bordered ${errors.store ? "input-error" : ""}`}
              placeholder="IKEA, AliExpress"
              value={store}
              onChange={(e) => setStore(e.target.value)}
            />
            {errors.store && <span className="text-xs text-error mt-1">{errors.store}</span>}
          </div>

          <div className="form-control">
            <label className="label"><span className="label-text mr-2">Apartment fit</span></label>
            <input
              className="input input-bordered"
              placeholder="Dorm C studio"
              value={apartmentFit}
              onChange={(e) => setApartmentFit(e.target.value)}
            />
          </div>
        </div>
      )}

      {/* IMAGES: DaisyUI file input + preview grid */}
      <div className="form-control">
        <label className="label"><span className="label-text">Images (optional)</span></label>

        <div className="grid grid-cols-3 mb-2">
          {images.map((src, i) => (
            <div key={i} className="relative aspect-square overflow-hidden rounded-lg border">
              <img src={src} alt={`tip-${i}`} className="w-full h-full object-cover" />
              <button
                type="button"
                className="btn btn-xs btn-circle absolute top-1 right-1"
                onClick={() => removeImage(i)}
                aria-label="Remove image"
              >
                ✕
              </button>
            </div>
          ))}
        </div>

        <input
          type="file"
          accept="image/png,image/jpeg,image/webp"
          multiple
          className="file-input file-input-bordered w-full max-w-xs"
          onChange={handlePickImages}
        />

        {errors.images && <span className="text-xs text-error mt-1">{errors.images}</span>}
        <p className="text-xs opacity-70 mt-1">
          Up to {MAX_IMAGES} images. JPG/PNG/WebP recommended. {uploading ? "Uploading…" : ""}
        </p>
      </div>

      {/* ACTIONS */}
      <div className="flex items-center justify-end pt-1">
        <button type="button" className="btn btn-ghost" onClick={onCancel}>
          Cancel
        </button>
        <button
          type="submit"
          className={`btn btn-primary ${submitting || uploading ? "loading" : ""}`}
          disabled={submitting || uploading}
        >
          Post tip
        </button>
      </div>
    </form>
  );
}
