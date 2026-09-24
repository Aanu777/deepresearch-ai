"use client";

import {
  FormEvent,
  useState,
} from "react";

import Link from "next/link";
import { useRouter } from "next/navigation";

import {
  CheckCircle2,
  Eye,
  EyeOff,
} from "lucide-react";

import AuthShell from "@/components/auth/AuthShell";
import { createClient } from "@/lib/supabase/client";
import {
  Button,
  IconButton,
  Input,
  Spinner,
} from "@/components/ui";

export default function SignupPage() {
  const router = useRouter();
  const supabase = createClient();

  const [username, setUsername] =
    useState("");

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [
    confirmPassword,
    setConfirmPassword,
  ] = useState("");

  const [
    showPassword,
    setShowPassword,
  ] = useState(false);

  const [
    showConfirmPassword,
    setShowConfirmPassword,
  ] = useState(false);

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

    if (loading) {
      return;
    }

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

    if (
      !/^[a-zA-Z0-9_]+$/.test(
        cleanUsername
      )
    ) {
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

    if (
      password !== confirmPassword
    ) {
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
          options: {
            data: {
              username:
                cleanUsername,
            },
            emailRedirectTo: `${window.location.origin}/auth/callback`,
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
        className="space-y-3.5"
      >
        <div>
          <label
            htmlFor="signup-username"
            className="mb-1.5 block text-xs font-medium text-white/45"
          >
            Username
          </label>

          <Input
            id="signup-username"
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
            disabled={loading}
            className="h-11"
          />

          <p className="mt-1 text-[11px] leading-5 text-white/20">
            Letters, numbers, and underscores only.
          </p>
        </div>

        <div>
          <label
            htmlFor="signup-email"
            className="mb-1.5 block text-xs font-medium text-white/45"
          >
            Email
          </label>

          <Input
            id="signup-email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(event) =>
              setEmail(
                event.target.value
              )
            }
            placeholder="you@example.com"
            disabled={loading}
            className="h-11"
          />
        </div>

        <div>
          <label
            htmlFor="signup-password"
            className="mb-1.5 block text-xs font-medium text-white/45"
          >
            Password
          </label>

          <div className="relative">
            <Input
              id="signup-password"
              type={
                showPassword
                  ? "text"
                  : "password"
              }
              required
              autoComplete="new-password"
              value={password}
              onChange={(event) =>
                setPassword(
                  event.target.value
                )
              }
              placeholder="At least 8 characters"
              disabled={loading}
              className="h-11 pr-12"
            />

            <IconButton
              type="button"
              size="sm"
              onClick={() =>
                setShowPassword(
                  (value) => !value
                )
              }
              aria-label={
                showPassword
                  ? "Hide password"
                  : "Show password"
              }
              title={
                showPassword
                  ? "Hide password"
                  : "Show password"
              }
              className="absolute right-1.5 top-1/2 h-8 w-8 -translate-y-1/2"
            >
              {showPassword ? (
                <EyeOff size={15} />
              ) : (
                <Eye size={15} />
              )}
            </IconButton>
          </div>
        </div>

        <div>
          <label
            htmlFor="signup-confirm-password"
            className="mb-1.5 block text-xs font-medium text-white/45"
          >
            Confirm password
          </label>

          <div className="relative">
            <Input
              id="signup-confirm-password"
              type={
                showConfirmPassword
                  ? "text"
                  : "password"
              }
              required
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(event) =>
                setConfirmPassword(
                  event.target.value
                )
              }
              placeholder="Repeat your password"
              disabled={loading}
              className="h-11 pr-12"
            />

            <IconButton
              type="button"
              size="sm"
              onClick={() =>
                setShowConfirmPassword(
                  (value) => !value
                )
              }
              aria-label={
                showConfirmPassword
                  ? "Hide confirmation password"
                  : "Show confirmation password"
              }
              title={
                showConfirmPassword
                  ? "Hide password"
                  : "Show password"
              }
              className="absolute right-1.5 top-1/2 h-8 w-8 -translate-y-1/2"
            >
              {showConfirmPassword ? (
                <EyeOff size={15} />
              ) : (
                <Eye size={15} />
              )}
            </IconButton>
          </div>
        </div>

        {error && (
          <div
            role="alert"
            className="rounded-xl border border-red-400/[0.12] bg-red-400/[0.06] px-3 py-2.5 text-xs leading-5 text-red-300"
          >
            {error}
          </div>
        )}

        {message && (
          <div
            role="status"
            className="flex items-start gap-2 rounded-xl border border-emerald-400/[0.12] bg-emerald-400/[0.06] px-3 py-2.5 text-xs leading-5 text-emerald-300"
          >
            <CheckCircle2
              size={15}
              className="mt-0.5 shrink-0"
            />

            <span>{message}</span>
          </div>
        )}

        <Button
          type="submit"
          variant="primary"
          size="lg"
          fullWidth
          disabled={loading}
          className="mt-1 h-11 font-semibold text-slate-950"
        >
          {loading ? (
            <>
              <Spinner size={15} />
              Creating account...
            </>
          ) : (
            "Create account"
          )}
        </Button>

        <p className="pt-1 text-center text-sm text-white/30">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-medium text-white/75 transition-colors duration-150 hover:text-cyan-300"
          >
            Log in
          </Link>
        </p>
      </form>
    </AuthShell>
  );
}