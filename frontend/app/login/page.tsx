"use client";

import {
  FormEvent,
  useState,
} from "react";

import Link from "next/link";
import { useRouter } from "next/navigation";

import AuthShell from "@/components/auth/AuthShell";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();

  const supabase = createClient();

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  async function handleLogin(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      const {
        error: loginError,
      } =
        await supabase.auth.signInWithPassword(
          {
            email: email.trim(),
            password,
          }
        );

      if (loginError) {
        throw loginError;
      }

      router.push("/conversation");
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to sign in."
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleLogin() {
    setError("");
    setLoading(true);

    try {
      const {
        error: oauthError,
      } =
        await supabase.auth.signInWithOAuth(
          {
            provider: "google",
            options: {
              redirectTo:
                `${window.location.origin}/auth/callback`,
            },
          }
        );

      if (oauthError) {
        throw oauthError;
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to continue with Google."
      );

      setLoading(false);
    }
  }

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to continue your research."
    >
      <button
        type="button"
        onClick={handleGoogleLogin}
        disabled={loading}
        className="
          flex h-11 w-full items-center
          justify-center gap-3 rounded-xl
          border border-white/[0.09]
          bg-white/[0.035]
          text-sm font-medium
          text-slate-200
          transition
          hover:bg-white/[0.07]
          disabled:cursor-not-allowed
          disabled:opacity-50
        "
      >
        <span className="text-sm font-bold">
          G
        </span>

        Continue with Google
      </button>

      <div className="my-6 flex items-center gap-3">
        <div className="h-px flex-1 bg-white/[0.07]" />

        <span className="text-[11px] uppercase tracking-wider text-slate-600">
          or
        </span>

        <div className="h-px flex-1 bg-white/[0.07]" />
      </div>

      <form
        onSubmit={handleLogin}
        className="space-y-4"
      >
        <div>
          <label className="mb-2 block text-xs font-medium text-slate-400">
            Email
          </label>

          <input
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(event) =>
              setEmail(event.target.value)
            }
            placeholder="you@example.com"
            className="
              h-11 w-full rounded-xl
              border border-white/[0.08]
              bg-white/[0.025]
              px-3.5 text-sm text-white
              outline-none
              transition
              placeholder:text-slate-700
              focus:border-cyan-400/40
              focus:bg-white/[0.04]
            "
          />
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <label className="text-xs font-medium text-slate-400">
              Password
            </label>

            <Link
              href="/forgot-password"
              className="text-xs text-cyan-400 hover:text-cyan-300"
            >
              Forgot password?
            </Link>
          </div>

          <div className="relative">
            <input
              type={
                showPassword
                  ? "text"
                  : "password"
              }
              required
              autoComplete="current-password"
              value={password}
              onChange={(event) =>
                setPassword(
                  event.target.value
                )
              }
              placeholder="Your password"
              className="
                h-11 w-full rounded-xl
                border border-white/[0.08]
                bg-white/[0.025]
                px-3.5 pr-20
                text-sm text-white
                outline-none
                transition
                placeholder:text-slate-700
                focus:border-cyan-400/40
                focus:bg-white/[0.04]
              "
            />

            <button
              type="button"
              onClick={() =>
                setShowPassword(
                  (value) => !value
                )
              }
              className="
                absolute right-3
                top-1/2 -translate-y-1/2
                text-xs text-slate-500
                hover:text-slate-200
              "
            >
              {showPassword
                ? "Hide"
                : "Show"}
            </button>
          </div>
        </div>

        {error && (
          <div className="rounded-xl border border-red-400/10 bg-red-400/[0.06] px-3 py-2.5 text-xs leading-5 text-red-300">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="
            h-11 w-full rounded-xl
            bg-white text-sm font-semibold
            text-black
            transition
            hover:bg-slate-200
            disabled:cursor-not-allowed
            disabled:opacity-50
          "
        >
          {loading
            ? "Signing in..."
            : "Continue"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-500">
        Don't have an account?{" "}
        <Link
          href="/signup"
          className="font-medium text-white hover:text-cyan-300"
        >
          Sign up
        </Link>
      </p>
    </AuthShell>
  );
}