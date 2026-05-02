"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getApiBase } from "@/lib/api-config";

type Phase = "loading" | "success" | "error";

export function ActivateClient({
  uidb64,
  token,
}: {
  uidb64: string;
  token: string;
}) {
  const [phase, setPhase] = useState<Phase>("loading");
  const [detail, setDetail] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`${getApiBase()}/api/v1/auth/activate/`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ uid: uidb64, token }),
        });
        const data = (await res.json()) as { detail?: string };
        if (cancelled) return;
        setDetail(
          typeof data.detail === "string"
            ? data.detail
            : res.ok
              ? "Done."
              : "Activation failed.",
        );
        setPhase(res.ok ? "success" : "error");
      } catch {
        if (!cancelled) {
          const devHint =
            process.env.NODE_ENV === "development"
              ? ` Is the API running at ${getApiBase()}?`
              : "";
          setDetail(`Could not complete activation. Check your connection and try again.${devHint}`);
          setPhase("error");
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [uidb64, token]);

  if (phase === "loading") {
    return (
      <div className="card-elevated p-10 text-center">
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-brand border-t-transparent" />
        <p className="mt-4 text-sm font-medium text-zinc-600">Confirming your account…</p>
      </div>
    );
  }

  if (phase === "success") {
    return (
      <div className="card-elevated border-emerald-200/80 bg-gradient-to-br from-emerald-50/90 to-white p-10 text-center">
        <div
          className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100 text-2xl text-emerald-700 shadow-inner"
          aria-hidden
        >
          ✓
        </div>
        <h1 className="text-xl font-bold tracking-tight text-zinc-900">You&apos;re all set</h1>
        <p className="mt-2 text-sm leading-relaxed text-zinc-700">{detail}</p>
        <Link href="/login" className="btn-primary mt-8 inline-flex min-w-[140px]">
          Log in
        </Link>
      </div>
    );
  }

  return (
    <div className="card-elevated border-red-200/80 bg-gradient-to-br from-red-50/90 to-white p-10 text-center">
      <div
        className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-100 text-2xl font-light text-red-700 shadow-inner"
        aria-hidden
      >
        ×
      </div>
      <h1 className="text-xl font-bold tracking-tight text-zinc-900">This link isn&apos;t valid</h1>
      <p className="mt-2 text-sm leading-relaxed text-zinc-700">{detail}</p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link href="/signup" className="btn-primary">
          Sign up again
        </Link>
        <Link
          href="/login"
          className="inline-flex items-center justify-center rounded-xl border border-zinc-200 bg-white px-5 py-2.5 text-sm font-semibold text-zinc-800 shadow-sm hover:border-zinc-300"
        >
          Log in
        </Link>
      </div>
    </div>
  );
}
