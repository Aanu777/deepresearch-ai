"use client";

import {
  FormEvent,
  useEffect,
  useState,
} from "react";

import Link from "next/link";
import { useRouter } from "next/navigation";

import AuthShell from "@/components/auth/AuthShell";
import { createClient } from "@/lib/supabase/client";

export default function ResetPasswordPage() {
  const router = useRouter();

  const supabase = createClient();

  const [password, setPassword] =
    useState("");

  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  const [checkingSession, setCheckingSession] =
    useState(true);

  const [error, setError] =
    useState("");

  const [message, setMessage] =
    useState("");

  const [recoveryReady, setRecoveryReady] =
    useState(false);

  useEffect(() => {
    let mounted = true;

    async function checkRecoverySession() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!mounted) {
        return;
      }

      if (session) {
        setRecoveryReady(true);
      }

      setCheckingSession(false);
    }

    checkRecoverySession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!mounted) {
          return;
        }

        if (
          event === "PASSWORD_RECOVERY" &&
          session
        ) {
          setRecoveryReady(true);
          setCheckingSession(false);
        }

        if (
          event === "SIGNED_IN" &&
          session
        ) {
          setRecoveryReady(true);
          setCheckingSession(false);
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");
    setMessage("");

    if (!recoveryReady) {
      setError(
        "This password reset link is invalid or has expired. Please request a new one."
      );
      return;
    }

    if (password.length < 8) {
      setError(
        "Password must be at least 8 characters."
      );
      return;
    }

    if (password !== confirmPassword) {
      setError(
        "Passwords do not match."
      );
      return;
    }

    setLoading(true);

    try {
      const {
        error: updateError,
      } = await supabase.auth.updateUser({
        password,
      });

      if (updateError) {
        throw updateError;
      }

      setMessage(
        "Your password has been updated successfully."
      );

      setPassword("");
      setConfirmPassword("");

      /*
       * Give the user a moment to see the
       * success state before returning to login.
       */
      setTimeout(() => {
        router.push("/login");
        router.refresh();
      }, 1400);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to update your password."
      );
    } finally {
      setLoading(false);
    }
  }

  if (checkingSession) {
    return (
      <AuthShell
        title="Reset your password"
        subtitle="Verifying your secure reset link..."
      >
        <div className="flex flex-col items-center py-8">
          <div
            className="
              h-8 w-8
              animate-spin
              rounded-full
              border-2
              border-white/[0.08]
              border-t-cyan-400
            "
          />

          <p className="mt-4 text-xs text-slate-500">
            Please wait a moment.
          </p>
        </div>
      </AuthShell>
    );
  }

  if (!recoveryReady) {
    return (
      <AuthShell
        title="Reset link expired"
        subtitle="This password reset link is invalid or has already been used."
      >
        <div
          className="
            rounded-xl
            border border-red-400/10
            bg-red-400/[0.06]
            px-4 py-3
            text-xs leading-5
            text-red-300
          "
        >
          Please request a new password reset link
          and try again.
        </div>

        <Link
          href="/forgot-password"
          className="
            mt-5
            flex h-11 w-full
            items-center justify-center
            rounded-xl
            bg-white
            text-sm font-semibold
            text-black
            transition
            hover:bg-slate-200
          "
        >
          Request a new link
        </Link>

        <p className="mt-6 text-center text-sm text-slate-500">
          <Link
            href="/login"
            className="
              font-medium
              text-white
              transition
              hover:text-cyan-300
            "
          >
            Back to login
          </Link>
        </p>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Choose a new password"
      subtitle="Create a new password for your DeepResearch account."
    >
      <form
        onSubmit={handleSubmit}
        className="space-y-4"
      >
        {/* NEW PASSWORD */}

        <div>
          <label className="mb-2 block text-xs font-medium text-slate-400">
            New password
          </label>

          <div className="relative">
            <input
              type={
                showPassword
                  ? "text"
                  : "password"
              }
              required
              autoComplete="new-password"
              minLength={8}
              value={password}
              onChange={(event) =>
                setPassword(
                  event.target.value
                )
              }
              placeholder="At least 8 characters"
              className="
                h-11 w-full rounded-xl
                border border-white/[0.08]
                bg-white/[0.025]
                px-3.5 pr-16
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
                top-1/2
                -translate-y-1/2
                text-xs
                text-slate-500
                transition
                hover:text-slate-200
              "
            >
              {showPassword
                ? "Hide"
                : "Show"}
            </button>
          </div>

          <p className="mt-1.5 text-[11px] text-slate-600">
            Use at least 8 characters.
          </p>
        </div>

        {/* CONFIRM PASSWORD */}

        <div>
          <label className="mb-2 block text-xs font-medium text-slate-400">
            Confirm new password
          </label>

          <div className="relative">
            <input
              type={
                showConfirmPassword
                  ? "text"
                  : "password"
              }
              required
              autoComplete="new-password"
              minLength={8}
              value={confirmPassword}
              onChange={(event) =>
                setConfirmPassword(
                  event.target.value
                )
              }
              placeholder="Repeat your new password"
              className="
                h-11 w-full rounded-xl
                border border-white/[0.08]
                bg-white/[0.025]
                px-3.5 pr-16
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
                setShowConfirmPassword(
                  (value) => !value
                )
              }
              className="
                absolute right-3
                top-1/2
                -translate-y-1/2
                text-xs
                text-slate-500
                transition
                hover:text-slate-200
              "
            >
              {showConfirmPassword
                ? "Hide"
                : "Show"}
            </button>
          </div>
        </div>

        {/* ERROR */}

        {error && (
          <div
            role="alert"
            className="
              rounded-xl
              border border-red-400/10
              bg-red-400/[0.06]
              px-3 py-2.5
              text-xs leading-5
              text-red-300
            "
          >
            {error}
          </div>
        )}

        {/* SUCCESS */}

        {message && (
          <div
            role="status"
            className="
              rounded-xl
              border border-emerald-400/10
              bg-emerald-400/[0.06]
              px-3 py-2.5
              text-xs leading-5
              text-emerald-300
            "
          >
            {message}
          </div>
        )}

        {/* UPDATE */}

        <button
          type="submit"
          disabled={loading}
          className="
            h-11 w-full rounded-xl
            bg-white
            text-sm font-semibold
            text-black
            transition
            hover:bg-slate-200
            disabled:cursor-not-allowed
            disabled:opacity-50
          "
        >
          {loading
            ? "Updating password..."
            : "Update password"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-500">
        <Link
          href="/login"
          className="
            font-medium
            text-white
            transition
            hover:text-cyan-300
          "
        >
          Back to login
        </Link>
      </p>
    </AuthShell>
  );
}