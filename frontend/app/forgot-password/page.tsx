"use client";

import {
  FormEvent,
  useState,
} from "react";

import Link from "next/link";

import AuthShell from "@/components/auth/AuthShell";
import { createClient } from "@/lib/supabase/client";

export default function ForgotPasswordPage() {
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");
    setMessage("");
    setLoading(true);

    try {
      const cleanEmail = email.trim();

      if (!cleanEmail) {
        setError("Please enter your email address.");
        return;
      }

      const { error: resetError } =
        await supabase.auth.resetPasswordForEmail(
          cleanEmail,
          {
            redirectTo:
              `${window.location.origin}/reset-password`,
          }
        );

      if (resetError) {
        throw resetError;
      }

      setMessage(
        "If an account exists for that email, we've sent you a password reset link."
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to send the password reset email."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      title="Reset your password"
      subtitle="Enter your email and we'll send you a secure reset link."
    >
      <form
        onSubmit={handleSubmit}
        className="space-y-5"
      >
        {/* EMAIL */}

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
              px-3.5
              text-sm text-white
              outline-none
              transition
              placeholder:text-slate-700
              focus:border-cyan-400/40
              focus:bg-white/[0.04]
            "
          />
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
              border border-cyan-400/10
              bg-cyan-400/[0.06]
              px-3 py-3
              text-xs leading-5
              text-cyan-300
            "
          >
            {message}
          </div>
        )}

        {/* SUBMIT */}

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
            ? "Sending reset link..."
            : "Send reset link"}
        </button>
      </form>

      {/* BACK TO LOGIN */}

      <p className="mt-6 text-center text-sm text-slate-500">
        Remember your password?{" "}

        <Link
          href="/login"
          className="
            font-medium
            text-white
            transition
            hover:text-cyan-300
          "
        >
          Log in
        </Link>
      </p>
    </AuthShell>
  );
}