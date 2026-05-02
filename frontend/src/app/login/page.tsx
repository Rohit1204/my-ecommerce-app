"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { PasswordField } from "@/components/PasswordField";
import { useAuth } from "@/context/AuthContext";
import { getApiBase } from "@/lib/api-config";
import { safeInternalPath } from "@/lib/auth-redirect";
import type { TokenResponse } from "@/lib/types";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setSession } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    try {
      const res = await fetch(`${getApiBase()}/api/v1/auth/token/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = (await res.json()) as TokenResponse & { detail?: string };
      if (!res.ok) {
        setErr(data.detail ?? "Invalid credentials");
        return;
      }
      setSession(data.access, data.refresh, data.username);
      const next = safeInternalPath(searchParams.get("next"));
      router.push(next ?? "/");
      router.refresh();
    } catch {
      setErr("Network error — is Django running on " + getApiBase() + "?");
    } finally {
      setLoading(false);
    }
  }

  const next = safeInternalPath(searchParams.get("next"));

  return (
    <div className="mx-auto w-full max-w-md">
      <div className="card-elevated p-8 sm:p-10">
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Welcome back</h1>
        <p className="mt-2 text-sm leading-relaxed text-zinc-600">
          Sign in to continue — checkout and order placement require an account on this demo store.
        </p>
        {next ? (
          <p className="mt-3 rounded-xl border border-brand/20 bg-brand/5 px-3 py-2 text-xs text-zinc-700">
            After you sign in, we&apos;ll take you to <span className="font-semibold text-brand">{next}</span>.
          </p>
        ) : null}
        <form onSubmit={onSubmit} className="mt-8 space-y-5">
          <div>
            <label htmlFor="u" className="block text-sm font-semibold text-zinc-800">
              Username
            </label>
            <input
              id="u"
              autoComplete="username"
              className="input-field mt-1.5"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <PasswordField
            id="p"
            label="Password"
            value={password}
            onChange={setPassword}
            autoComplete="current-password"
          />
          {err ? (
            <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800" role="alert">
              {err}
            </p>
          ) : null}
          <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-base">
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-zinc-600">
          New here?{" "}
          <Link href="/signup" className="font-semibold text-brand hover:text-brand-dark hover:underline">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}

function LoginFallback() {
  return (
    <div className="mx-auto w-full max-w-md">
      <div className="card-elevated h-72 animate-pulse bg-zinc-100/80 p-8" aria-hidden />
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginFallback />}>
      <LoginForm />
    </Suspense>
  );
}
