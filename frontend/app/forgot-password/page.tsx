"use client";

import {
  FormEvent,
  useState,
} from "react";

import Link from "next/link";

import {
  ArrowLeft,
  CheckCircle2,
  Mail,
} from "lucide-react";

import AuthShell from "@/components/auth/AuthShell";

import {
  createClient,
} from "@/lib/supabase/client";

import {
  Button,
  Input,
  Spinner,
} from "@/components/ui";

export default function ForgotPasswordPage() {
  const supabase =
    createClient();

  const [
    email,
    setEmail,
  ] =
    useState("");

  const [
    loading,
    setLoading,
  ] =
    useState(false);

  const [
    error,
    setError,
  ] =
    useState("");

  const [
    success,
    setSuccess,
  ] =
    useState(false);

  // ==========================================================
  // SEND RESET EMAIL
  // ==========================================================

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (loading) {
      return;
    }

    const cleanEmail =
      email.trim();

    if (!cleanEmail) {
      setError(
        "Enter your email address."
      );

      return;
    }

    setError("");
    setLoading(true);

    try {
      const {
        error:
          resetError,
      } =
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

      setSuccess(
        true
      );

    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to send reset email."
      );

    } finally {
      setLoading(
        false
      );
    }
  }

  // ==========================================================
  // SUCCESS
  // ==========================================================

  if (success) {
    return (
      <AuthShell
        title="Check your email"
        subtitle="We sent you a password reset link."
      >
        <div className="text-center">
          <div
            className="
              mx-auto
              flex
              h-11
              w-11
              items-center
              justify-center
              rounded-full
              bg-emerald-400/[0.08]
              text-emerald-300
            "
          >
            <CheckCircle2
              size={20}
            />
          </div>

          <p
            className="
              mt-4
              text-sm
              leading-6
              text-white/40
            "
          >
            If an account exists for{" "}
            <span className="font-medium text-white/70">
              {email}
            </span>
            , you&apos;ll receive a link to reset your password.
          </p>

          <Link
            href="/login"
            className="
              mt-6
              inline-flex
              items-center
              gap-2
              text-sm
              font-medium
              text-white/55
              transition-colors
              duration-150
              hover:text-white
            "
          >
            <ArrowLeft
              size={15}
            />

            Back to login
          </Link>
        </div>
      </AuthShell>
    );
  }

  // ==========================================================
  // FORM
  // ==========================================================

  return (
    <AuthShell
      title="Reset your password"
      subtitle="Enter your email and we'll send you a reset link."
    >
      <form
        onSubmit={
          handleSubmit
        }
        className="space-y-4"
      >
        <div>
          <label
            htmlFor="reset-email"
            className="
              mb-1.5
              block
              text-xs
              font-medium
              text-white/45
            "
          >
            Email
          </label>

          <div className="relative">
            <Input
              id="reset-email"
              type="email"
              required
              autoComplete="email"
              value={
                email
              }
              onChange={(
                event
              ) =>
                setEmail(
                  event.target.value
                )
              }
              placeholder="you@example.com"
              disabled={
                loading
              }
              className="
                h-11
                pl-10
              "
            />

            <Mail
              size={15}
              className="
                pointer-events-none
                absolute
                left-3.5
                top-1/2
                -translate-y-1/2
                text-white/25
              "
            />
          </div>
        </div>

        {error && (
          <div
            role="alert"
            className="
              rounded-xl
              border
              border-red-400/[0.12]
              bg-red-400/[0.06]
              px-3
              py-2.5
              text-xs
              leading-5
              text-red-300
            "
          >
            {error}
          </div>
        )}

        <Button
          type="submit"
          variant="primary"
          size="lg"
          fullWidth
          disabled={
            loading
          }
          className="h-11"
        >
          {loading ? (
            <>
              <Spinner
                size={15}
              />

              Sending link...
            </>
          ) : (
            "Send reset link"
          )}
        </Button>
      </form>

      <Link
        href="/login"
        className="
          mt-6
          flex
          items-center
          justify-center
          gap-2
          text-sm
          text-white/35
          transition-colors
          duration-150
          hover:text-white/70
        "
      >
        <ArrowLeft
          size={15}
        />

        Back to login
      </Link>
    </AuthShell>
  );
}