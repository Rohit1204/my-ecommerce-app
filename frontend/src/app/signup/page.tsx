"use client";

import Link from "next/link";
import { useState } from "react";
import { PasswordField } from "@/components/PasswordField";
import { getApiBase } from "@/lib/api-config";
import type { RegisterResponse } from "@/lib/types";
import { isValidEmailFormat } from "@/lib/validation";

type FieldErrors = Record<string, string[] | string>;

export default function SignupPage() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password1, setPassword1] = useState("");
  const [password2, setPassword2] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors | null>(null);
  const [emailHint, setEmailHint] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState<RegisterResponse | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setFieldErrors(null);
    setEmailHint(null);

    const emailTrimmed = email.trim();
    if (!isValidEmailFormat(emailTrimmed)) {
      setEmailHint("Enter a valid email address (e.g. name@example.com).");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${getApiBase()}/api/v1/auth/register/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: username.trim(),
          email: emailTrimmed,
          password1,
          password2,
        }),
      });
      const data = (await res.json()) as RegisterResponse & FieldErrors;
      if (!res.ok) {
        if (res.status === 400 && typeof data === "object") {
          const fe: FieldErrors = {};
          for (const key of Object.keys(data)) {
            if (key === "detail") continue;
            const v = (data as unknown as FieldErrors)[key];
            if (v !== undefined) fe[key] = v;
          }
          if (Object.keys(fe).length > 0) {
            setFieldErrors(fe);
            return;
          }
        }
        setErr(
          typeof (data as { detail?: string }).detail === "string"
            ? (data as { detail: string }).detail
            : "Registration failed",
        );
        return;
      }
      setDone(data as RegisterResponse);
    } catch {
      setErr("Network error — is Django running on " + getApiBase() + "?");
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <div className="mx-auto w-full max-w-md">
        <div className="card-elevated p-8 sm:p-10">
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Check your email</h1>
          <p className="mt-3 text-sm leading-relaxed text-zinc-600">{done.detail}</p>
          <p className="mt-2 text-sm text-zinc-800">
            We sent a link to <strong>{done.email}</strong>.
          </p>
          {!done.mail_sent ? (
            <p className="mt-4 rounded-xl border border-amber-200/80 bg-amber-50 px-4 py-3 text-xs text-amber-950">
              Email may not have delivered. Configure SMTP in Django <code className="rounded bg-white/80 px-1">.env</code>{" "}
              or use the dev link below.
            </p>
          ) : null}
          {done.dev_activation_url ? (
            <div className="mt-5 rounded-2xl border border-sky-200/80 bg-gradient-to-br from-sky-50 to-white p-5 text-sm text-sky-950">
              <p className="font-semibold">Local dev — activate without inbox</p>
              <a href={done.dev_activation_url} className="btn-primary mt-3 w-full sm:w-auto">
                Activate account
              </a>
              <p className="mt-3 break-all text-xs text-sky-900/80">
                <code>{done.dev_activation_url}</code>
              </p>
            </div>
          ) : null}
          <p className="mt-8 text-center text-sm">
            <Link href="/login" className="font-semibold text-brand hover:underline">
              Back to log in
            </Link>
          </p>
        </div>
      </div>
    );
  }

  function showField(name: string) {
    if (!fieldErrors?.[name]) return null;
    const v = fieldErrors[name];
    const msg = Array.isArray(v) ? v.join(" ") : v;
    return (
      <p className="mt-1 text-xs text-red-600" role="alert">
        {msg}
      </p>
    );
  }

  return (
    <div className="mx-auto w-full max-w-md">
      <div className="card-elevated p-8 sm:p-10">
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Create account</h1>
        <p className="mt-2 text-sm leading-relaxed text-zinc-600">
          We&apos;ll email you a link. Opening it on this site activates your account via the API.
        </p>
        <form onSubmit={onSubmit} className="mt-8 space-y-5">
          <div>
            <label htmlFor="su-user" className="block text-sm font-semibold text-zinc-800">
              Username
            </label>
            <input
              id="su-user"
              autoComplete="username"
              className="input-field mt-1.5"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
            {showField("username")}
          </div>
          <div>
            <label htmlFor="su-email" className="block text-sm font-semibold text-zinc-800">
              Email
            </label>
            <input
              id="su-email"
              type="email"
              inputMode="email"
              autoComplete="email"
              maxLength={200}
              className="input-field mt-1.5"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (emailHint) setEmailHint(null);
              }}
              onBlur={() => {
                const t = email.trim();
                if (t.length === 0) {
                  setEmailHint(null);
                  return;
                }
                if (!isValidEmailFormat(t)) {
                  setEmailHint("That doesn’t look like a valid email.");
                } else {
                  setEmailHint(null);
                }
              }}
              aria-invalid={emailHint ? true : undefined}
              aria-describedby={emailHint ? "su-email-hint" : undefined}
              required
            />
            {emailHint ? (
              <p id="su-email-hint" className="mt-1 text-xs text-red-600" role="alert">
                {emailHint}
              </p>
            ) : null}
            {showField("email")}
          </div>
          <PasswordField
            id="su-p1"
            label="Password"
            value={password1}
            onChange={setPassword1}
            autoComplete="new-password"
            error={showField("password1")}
          />
          <PasswordField
            id="su-p2"
            label="Confirm password"
            value={password2}
            onChange={setPassword2}
            autoComplete="new-password"
            error={showField("password2")}
          />
          {showField("__all__")}
          {err ? (
            <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800" role="alert">
              {err}
            </p>
          ) : null}
          <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-base">
            {loading ? "Creating account…" : "Sign up"}
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-zinc-600">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-brand hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
