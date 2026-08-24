"use client";

import {
  FormEvent,
  useState,
} from "react";

import Link from "next/link";
import { useRouter } from "next/navigation";

import AuthShell from "@/components/auth/AuthShell";
import { createClient } from "@/lib/supabase/client";

export default function SignupPage() {
  const router = useRouter();

  const supabase = createClient();

  const [username, setUsername] =
    useState("");

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [message, setMessage] =
    useState("");

  async function handleSignup(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");
    setMessage("");

    const cleanUsername =
      username.trim();

    if (!cleanUsername) {
      setError(
        "Please choose a username."
      );
      return;
    }

    if (cleanUsername.length < 3) {
      setError(
        "Username must be at least 3 characters."
      );
      return;
    }

    if (cleanUsername.length > 30) {
      setError(
        "Username must be 30 characters or less."
      );
      return;
    }

    if (!/^[a-zA-Z0-9_]+$/.test(cleanUsername)) {
      setError(
        "Username can only contain letters, numbers, and underscores."
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
        data,
        error: signupError,
      } =
        await supabase.auth.signUp({
          email: email.trim(),
          password,

          // IMPORTANT:
          // Username is stored inside the
          // authenticated user's Supabase metadata.
          options: {
            data: {
              username: cleanUsername,
            },

            emailRedirectTo:
              `${window.location.origin}/auth/callback`,
          },
        });

      if (signupError) {
        throw signupError;
      }

      if (data.session) {
        router.push("/conversation");
        router.refresh();
        return;
      }

      setMessage(
        "Account created. Check your email to confirm your account."
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to create your account."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      title="Create your account"
      subtitle="Start building smarter research."
    >
      <form
        onSubmit={handleSignup}
        className="space-y-4"
      >

        {/* ================================================== */}
        {/* USERNAME */}
        {/* ================================================== */}

        <div>
          <label className="mb-2 block text-xs font-medium text-slate-400">
            Username
          </label>

          <input
            type="text"
            required
            autoComplete="username"
            value={username}
            onChange={(event) =>
              setUsername(
                event.target.value
              )
            }
            placeholder="Choose a username"
            maxLength={30}
            className="
              h-11 w-full rounded-xl
              border border-white/[0.08]
              bg-white/[0.025]
              px-3.5 text-sm text-white
              outline-none
              placeholder:text-slate-700
              focus:border-cyan-400/40
            "
          />

          <p className="mt-1.5 text-[11px] text-slate-600">
            Letters, numbers, and underscores only.
          </p>
        </div>

        {/* ================================================== */}
        {/* EMAIL */}
        {/* ================================================== */}

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
              placeholder:text-slate-700
              focus:border-cyan-400/40
            "
          />
        </div>

        {/* ================================================== */}
        {/* PASSWORD */}
        {/* ================================================== */}

        <div>
          <label className="mb-2 block text-xs font-medium text-slate-400">
            Password
          </label>

          <input
            type="password"
            required
            autoComplete="new-password"
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
              px-3.5 text-sm text-white
              outline-none
              placeholder:text-slate-700
              focus:border-cyan-400/40
            "
          />
        </div>

        {/* ================================================== */}
        {/* CONFIRM PASSWORD */}
        {/* ================================================== */}

        <div>
          <label className="mb-2 block text-xs font-medium text-slate-400">
            Confirm password
          </label>

          <input
            type="password"
            required
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(event) =>
              setConfirmPassword(
                event.target.value
              )
            }
            placeholder="Repeat your password"
            className="
              h-11 w-full rounded-xl
              border border-white/[0.08]
              bg-white/[0.025]
              px-3.5 text-sm text-white
              outline-none
              placeholder:text-slate-700
              focus:border-cyan-400/40
            "
          />
        </div>

        {/* ================================================== */}
        {/* ERRORS */}
        {/* ================================================== */}

        {error && (
          <div className="rounded-xl border border-red-400/10 bg-red-400/[0.06] px-3 py-2.5 text-xs leading-5 text-red-300">
            {error}
          </div>
        )}

        {/* ================================================== */}
        {/* SUCCESS */}
        {/* ================================================== */}

        {message && (
          <div className="rounded-xl border border-cyan-400/10 bg-cyan-400/[0.06] px-3 py-2.5 text-xs leading-5 text-cyan-300">
            {message}
          </div>
        )}

        {/* ================================================== */}
        {/* SUBMIT */}
        {/* ================================================== */}

        <button
          type="submit"
          disabled={loading}
          className="
            h-11 w-full rounded-xl
            bg-white text-sm font-semibold
            text-black
            transition hover:bg-slate-200
            disabled:cursor-not-allowed
            disabled:opacity-50
          "
        >
          {loading
            ? "Creating account..."
            : "Create account"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-500">
        Already have an account?{" "}

        <Link
          href="/login"
          className="font-medium text-white hover:text-cyan-300"
        >
          Log in
        </Link>
      </p>
    </AuthShell>
  );
}