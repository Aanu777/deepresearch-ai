"use client";

import {
  FormEvent,
  useState,
} from "react";

import Link from "next/link";
import { useRouter } from "next/navigation";

import {
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

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [
    showPassword,
    setShowPassword,
  ] = useState(false);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  async function handleLogin(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (loading) {
      return;
    }

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
    if (loading) {
      return;
    }

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
              redirectTo: `${window.location.origin}/auth/callback`,
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
      <div className="space-y-5">
        <Button
          type="button"
          variant="secondary"
          size="lg"
          fullWidth
          onClick={handleGoogleLogin}
          disabled={loading}
          className="h-11 text-white"
        >
          <span
            className="
              flex
              h-5
              w-5
              items-center
              justify-center
              rounded-full
              bg-white
              text-[11px]
              font-bold
              text-black
            "
          >
            G
          </span>

          Continue with Google
        </Button>

        <div className="flex items-center gap-3">
          <div className="h-px flex-1 bg-white/[0.06]" />

          <span
            className="
              text-[10px]
              font-medium
              uppercase
              tracking-[0.14em]
              text-white/20
            "
          >
            or
          </span>

          <div className="h-px flex-1 bg-white/[0.06]" />
        </div>

        <form
          onSubmit={handleLogin}
          className="space-y-3.5"
        >
          <div>
            <label
              htmlFor="login-email"
              className="mb-1.5 block text-xs font-medium text-white/45"
            >
              Email
            </label>

            <Input
              id="login-email"
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
            <div className="mb-1.5 flex items-center justify-between gap-3">
              <label
                htmlFor="login-password"
                className="text-xs font-medium text-white/45"
              >
                Password
              </label>

              <Link
                href="/forgot-password"
                className="text-xs text-white/35 transition-colors duration-150 hover:text-cyan-300"
              >
                Forgot password?
              </Link>
            </div>

            <div className="relative">
              <Input
                id="login-password"
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

          {error && (
            <div
              role="alert"
              className="rounded-xl border border-red-400/[0.12] bg-red-400/[0.06] px-3 py-2.5 text-xs leading-5 text-red-300"
            >
              {error}
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
                Signing in...
              </>
            ) : (
              "Continue"
            )}
          </Button>
        </form>

        <p className="text-center text-sm text-white/30">
          Don&apos;t have an account?{" "}
          <Link
            href="/signup"
            className="font-medium text-white/75 transition-colors duration-150 hover:text-cyan-300"
          >
            Sign up
          </Link>
        </p>
      </div>
    </AuthShell>
  );
}