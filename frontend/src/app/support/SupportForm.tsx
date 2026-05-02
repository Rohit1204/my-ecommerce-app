"use client";

import { useState } from "react";
import { getApiBase } from "@/lib/api-config";

export function SupportForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [desc, setDesc] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    setLoading(true);
    try {
      const res = await fetch(`${getApiBase()}/api/v1/contact/`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ name, email, phone, desc }),
      });
      const data = (await res.json()) as { detail?: string };
      if (!res.ok) {
        setMessage({
          type: "err",
          text: typeof data.detail === "string" ? data.detail : "Could not send message.",
        });
        return;
      }
      setMessage({
        type: "ok",
        text: data.detail ?? "Thanks — we received your message.",
      });
      setDesc("");
    } catch {
      setMessage({
        type: "err",
        text: "Network error — is Django running on " + getApiBase() + "?",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div>
        <p className="mb-3 text-xs font-bold uppercase tracking-wider text-zinc-400">Your details</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="sup-name" className="mb-1.5 block text-xs font-semibold text-zinc-700">
              Name
            </label>
            <input
              id="sup-name"
              type="text"
              required
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input-field"
              placeholder="Full name"
            />
          </div>
          <div>
            <label htmlFor="sup-email" className="mb-1.5 block text-xs font-semibold text-zinc-700">
              Email
            </label>
            <input
              id="sup-email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-field"
              placeholder="you@example.com"
            />
          </div>
        </div>
        <div className="mt-4">
          <label htmlFor="sup-phone" className="mb-1.5 block text-xs font-semibold text-zinc-700">
            Phone <span className="font-normal text-zinc-400">(optional)</span>
          </label>
          <input
            id="sup-phone"
            type="tel"
            autoComplete="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="input-field"
            placeholder="+91 …"
          />
        </div>
      </div>

      <div>
        <label htmlFor="sup-desc" className="mb-1.5 block text-xs font-semibold text-zinc-700">
          How can we help?
        </label>
        <textarea
          id="sup-desc"
          required
          rows={5}
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
          placeholder="Order id (if any), what happened, and what you’d like us to do."
          className="textarea-field"
        />
        <p className="mt-1.5 text-[11px] text-zinc-400">Minimize back-and-forth: include dates, product names, or screenshots you mention in text.</p>
      </div>

      {message ? (
        <div
          className={
            message.type === "ok"
              ? "rounded-2xl border border-emerald-200/90 bg-emerald-50/95 px-4 py-3 text-sm text-emerald-950 shadow-sm"
              : "rounded-2xl border border-red-200/90 bg-red-50/95 px-4 py-3 text-sm text-red-900 shadow-sm"
          }
          role="status"
        >
          <p className="font-semibold">{message.type === "ok" ? "Sent" : "Couldn’t send"}</p>
          <p className={`mt-1 ${message.type === "ok" ? "text-emerald-900/90" : "text-red-800/90"}`}>{message.text}</p>
        </div>
      ) : null}

      <button
        type="submit"
        disabled={loading}
        className="btn-primary px-8 py-3 text-sm font-bold shadow-lg shadow-brand/20 disabled:opacity-50"
      >
        {loading ? (
          <span className="inline-flex items-center gap-2">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" aria-hidden />
            Sending…
          </span>
        ) : (
          "Send message"
        )}
      </button>
    </form>
  );
}
