"use client";

import {
  FormEvent,
  Suspense,
  useEffect,
  useState,
} from "react";

import {
  useRouter,
  useSearchParams,
} from "next/navigation";

import {
  CheckCircle2,
  Eye,
  EyeOff,
  LockKeyhole,
} from "lucide-react";

import AuthShell from "@/components/auth/AuthShell";

import {
  createClient,
} from "@/lib/supabase/client";

import {
  Button,
  IconButton,
  Input,
  Spinner,
} from "@/components/ui";

function ResetPasswordContent() {
  const router =
    useRouter();

  const searchParams =
    useSearchParams();

  const supabase =
    createClient();

  const [
    password,
    setPassword,
  ] =
    useState("");

  const [
    confirmPassword,
    setConfirmPassword,
  ] =
    useState("");

  const [
    showPassword,
    setShowPassword,
  ] =
    useState(false);

  const [
    showConfirmPassword,
    setShowConfirmPassword,
  ] =
    useState(false);

  const [
    loading,
    setLoading,
  ] =
    useState(false);

  const [
    sessionLoading,
    setSessionLoading,
  ] =
    useState(true);

  const [
    validSession,
    setValidSession,
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
  // LOAD RECOVERY SESSION
  // ==========================================================

  useEffect(() => {
    let mounted =
      true;

    async function loadSession() {
      try {
        const code =
          searchParams.get(
            "code"
          );

        if (code) {
          const {
            error:
              exchangeError,
          } =
            await supabase.auth.exchangeCodeForSession(
              code
            );

          if (
            exchangeError
          ) {
            throw exchangeError;
          }
        }

        const {
          data: {
            session,
          },
        } =
          await supabase.auth.getSession();

        if (!mounted) {
          return;
        }

        setValidSession(
          Boolean(
            session
          )
        );

        if (!session) {
          setError(
            "This password reset link is invalid or has expired."
          );
        }

      } catch (err) {
        if (!mounted) {
          return;
        }

        setValidSession(
          false
        );

        setError(
          err instanceof Error
            ? err.message
            : "Unable to verify the reset link."
        );

      } finally {
        if (mounted) {
          setSessionLoading(
            false
          );
        }
      }
    }

    loadSession();

    return () => {
      mounted = false;
    };
  }, [
    searchParams,
    supabase.auth,
  ]);

  // ==========================================================
  // RESET PASSWORD
  // ==========================================================

  async function handleReset(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (
      loading ||
      !validSession
    ) {
      return;
    }

    setError("");

    if (
      password.length <
      8
    ) {
      setError(
        "Password must be at least 8 characters."
      );

      return;
    }

    if (
      password !==
      confirmPassword
    ) {
      setError(
        "Passwords do not match."
      );

      return;
    }

    setLoading(
      true
    );

    try {
      const {
        error:
          updateError,
      } =
        await supabase.auth.updateUser(
          {
            password,
          }
        );

      if (
        updateError
      ) {
        throw updateError;
      }

      setSuccess(
        true
      );

    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to update your password."
      );

    } finally {
      setLoading(
        false
      );
    }
  }

  // ==========================================================
  // VERIFYING
  // ==========================================================

  if (
    sessionLoading
  ) {
    return (
      <AuthShell
        title="Reset password"
        subtitle="Verifying your reset link."
      >
        <div
          className="
            flex
            items-center
            justify-center
            gap-2
            py-8
            text-sm
            text-white/35
          "
        >
          <Spinner
            size={16}
          />

          Verifying...
        </div>
      </AuthShell>
    );
  }

  // ==========================================================
  // SUCCESS
  // ==========================================================

  if (success) {
    return (
      <AuthShell
        title="Password updated"
        subtitle="Your new password is ready to use."
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
            Your password has been changed successfully.
          </p>

          <Button
            type="button"
            variant="primary"
            size="lg"
            fullWidth
            onClick={() => {
              router.replace(
                "/conversation"
              );

              router.refresh();
            }}
            className="mt-6 h-11"
          >
            Continue to DeepResearch
          </Button>
        </div>
      </AuthShell>
    );
  }

  // ==========================================================
  // INVALID LINK
  // ==========================================================

  if (
    !validSession
  ) {
    return (
      <AuthShell
        title="Reset link expired"
        subtitle="This password reset link can no longer be used."
      >
        {error && (
          <div
            role="alert"
            className="
              rounded-xl
              border
              border-red-400/[0.12]
              bg-red-400/[0.06]
              px-3
              py-3
              text-xs
              leading-5
              text-red-300
            "
          >
            {error}
          </div>
        )}

        <Button
          type="button"
          variant="secondary"
          size="lg"
          fullWidth
          onClick={() =>
            router.push(
              "/forgot-password"
            )
          }
          className="mt-4 h-11"
        >
          Request another link
        </Button>
      </AuthShell>
    );
  }

  // ==========================================================
  // FORM
  // ==========================================================

  return (
    <AuthShell
      title="Choose a new password"
      subtitle="Use at least 8 characters for your new password."
    >
      <form
        onSubmit={
          handleReset
        }
        className="space-y-4"
      >
        {/* PASSWORD */}

        <div>
          <label
            htmlFor="new-password"
            className="
              mb-1.5
              block
              text-xs
              font-medium
              text-white/45
            "
          >
            New password
          </label>

          <div className="relative">
            <LockKeyhole
              size={15}
              className="
                pointer-events-none
                absolute
                left-3.5
                top-1/2
                z-10
                -translate-y-1/2
                text-white/25
              "
            />

            <Input
              id="new-password"
              type={
                showPassword
                  ? "text"
                  : "password"
              }
              required
              autoComplete="new-password"
              value={
                password
              }
              onChange={(
                event
              ) =>
                setPassword(
                  event.target.value
                )
              }
              placeholder="At least 8 characters"
              disabled={
                loading
              }
              className="
                h-11
                pl-10
                pr-12
              "
            />

            <IconButton
              type="button"
              size="sm"
              onClick={() =>
                setShowPassword(
                  (
                    value
                  ) =>
                    !value
                )
              }
              aria-label={
                showPassword
                  ? "Hide password"
                  : "Show password"
              }
              className="
                absolute
                right-1.5
                top-1/2
                h-8
                w-8
                -translate-y-1/2
              "
            >
              {showPassword ? (
                <EyeOff
                  size={15}
                />
              ) : (
                <Eye
                  size={15}
                />
              )}
            </IconButton>
          </div>
        </div>

        {/* CONFIRM */}

        <div>
          <label
            htmlFor="confirm-new-password"
            className="
              mb-1.5
              block
              text-xs
              font-medium
              text-white/45
            "
          >
            Confirm new password
          </label>

          <div className="relative">
            <LockKeyhole
              size={15}
              className="
                pointer-events-none
                absolute
                left-3.5
                top-1/2
                z-10
                -translate-y-1/2
                text-white/25
              "
            />

            <Input
              id="confirm-new-password"
              type={
                showConfirmPassword
                  ? "text"
                  : "password"
              }
              required
              autoComplete="new-password"
              value={
                confirmPassword
              }
              onChange={(
                event
              ) =>
                setConfirmPassword(
                  event.target.value
                )
              }
              placeholder="Repeat your password"
              disabled={
                loading
              }
              className="
                h-11
                pl-10
                pr-12
              "
            />

            <IconButton
              type="button"
              size="sm"
              onClick={() =>
                setShowConfirmPassword(
                  (
                    value
                  ) =>
                    !value
                )
              }
              aria-label={
                showConfirmPassword
                  ? "Hide password"
                  : "Show password"
              }
              className="
                absolute
                right-1.5
                top-1/2
                h-8
                w-8
                -translate-y-1/2
              "
            >
              {showConfirmPassword ? (
                <EyeOff
                  size={15}
                />
              ) : (
                <Eye
                  size={15}
                />
              )}
            </IconButton>
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

              Updating password...
            </>
          ) : (
            "Update password"
          )}
        </Button>
      </form>
    </AuthShell>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <AuthShell
          title="Reset password"
          subtitle="Loading your reset session."
        >
          <div
            className="
              flex
              items-center
              justify-center
              gap-2
              py-8
              text-sm
              text-white/35
            "
          >
            <Spinner
              size={16}
            />

            Loading...
          </div>
        </AuthShell>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  );
}
