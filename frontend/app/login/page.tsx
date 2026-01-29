"use client";

import axios from "axios";
import { AlertCircle, Eye, EyeOff, Lock, Mail } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import * as React from "react";

import { Button } from "@/components/Button";
import { Navbar } from "@/components/Navbar";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import { useAuth } from "@/hooks/useAuth";
import { loginUser } from "@/lib/api/authApi";

interface FormErrors {
  email?: string;
  password?: string;
}

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function getErrorMessage(error: unknown): string {
  const pickString = (data: unknown, key: string): string | undefined => {
    if (!data || typeof data !== "object") return undefined;
    const rec = data as Record<string, unknown>;
    const v = rec[key];
    return typeof v === "string" ? v : undefined;
  };

  if (axios.isAxiosError(error)) {
    if (error.response) {
      // Prefer backend message if present
      const data: unknown = error.response.data;
      return (
        pickString(data, "message") ||
        pickString(data, "error") ||
        `Request failed (${error.response.status})`
      );
    }
    if (error.request) return "Network error. Please check your connection.";
    return error.message || "An unexpected error occurred.";
  }
  if (error instanceof Error) return error.message;
  return "An unexpected error occurred.";
}

export default function LoginPage() {
  const router = useRouter();
  const { login, loading, isAuthenticated } = useAuth();

  const [from, setFrom] = React.useState("");
  const [bannerMessage, setBannerMessage] = React.useState("");

  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [remember, setRemember] = React.useState(true);

  const [errors, setErrors] = React.useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    const sp = new URLSearchParams(window.location.search);
    setFrom(sp.get("from") || "");
    setBannerMessage(sp.get("message") || "");
  }, []);

  React.useEffect(() => {
    if (loading) return;
    if (isAuthenticated) {
      router.replace(from || "/dashboard");
    }
  }, [from, isAuthenticated, loading, router]);

  const validate = (): FormErrors => {
    const next: FormErrors = {};
    if (!email) next.email = "Email is required.";
    else if (!emailRegex.test(email))
      next.email = "Please enter a valid email.";
    if (!password) next.password = "Password is required.";
    return next;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    const v = validate();
    setErrors(v);
    if (Object.keys(v).length > 0) return;

    setIsSubmitting(true);
    try {
      const response = await loginUser({ email, password });
      if (response.success) {
        login({
          user_id: response.data.user_id,
          email: response.data.email,
          full_name: response.data.full_name,
          role: response.data.role,
        });
        // "Remember me" is UI-only for now (storage is localStorage per spec)
        void remember;
        router.replace(from || "/dashboard");
      }
    } catch (err) {
      setErrorMsg(getErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar showAuthLinks />

      <main className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-8 sm:px-6 lg:px-8">
        <div className="w-full max-w-md">
          <div className="rounded-lg border border-border bg-card px-6 py-6 shadow-md sm:px-8 sm:py-8">
            <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
              Welcome Back
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Sign in to access your dashboard.
            </p>

            {bannerMessage ? (
              <div className="mt-4 flex items-start gap-2 rounded-md border border-border bg-muted px-3 py-2 text-sm">
                <AlertCircle className="mt-0.5 size-4 text-primary" />
                <p className="text-muted-foreground">{bannerMessage}</p>
              </div>
            ) : null}

            {errorMsg ? (
              <div className="mt-4 flex items-start gap-2 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                <AlertCircle className="mt-0.5 size-4" />
                <p>{errorMsg}</p>
              </div>
            ) : null}

            <form className="mt-6 space-y-4" onSubmit={handleSubmit} noValidate>
              <div className="space-y-1">
                <label
                  htmlFor="email"
                  className="block text-xs font-medium text-foreground"
                >
                  Email
                </label>
                <InputGroup>
                  <InputGroupAddon>
                    <Mail className="size-4" />
                  </InputGroupAddon>
                  <InputGroupInput
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Enter your email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setErrors((p) => ({ ...p, email: undefined }));
                      setErrorMsg(null);
                    }}
                    aria-invalid={!!errors.email}
                    disabled={isSubmitting}
                  />
                </InputGroup>
                {errors.email ? (
                  <p className="text-xs font-medium text-red-600">
                    {errors.email}
                  </p>
                ) : null}
              </div>

              <div className="space-y-1">
                <label
                  htmlFor="password"
                  className="block text-xs font-medium text-foreground"
                >
                  Password
                </label>
                <InputGroup>
                  <InputGroupAddon>
                    <Lock className="size-4" />
                  </InputGroupAddon>
                  <InputGroupInput
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setErrors((p) => ({ ...p, password: undefined }));
                      setErrorMsg(null);
                    }}
                    aria-invalid={!!errors.password}
                    disabled={isSubmitting}
                  />
                  <InputGroupAddon align="inline-end">
                    <InputGroupButton
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                      onClick={() => setShowPassword((v) => !v)}
                    >
                      {showPassword ? (
                        <EyeOff className="size-4" />
                      ) : (
                        <Eye className="size-4" />
                      )}
                    </InputGroupButton>
                  </InputGroupAddon>
                </InputGroup>
                {errors.password ? (
                  <p className="text-xs font-medium text-red-600">
                    {errors.password}
                  </p>
                ) : null}
              </div>

              <div className="flex items-center justify-between text-xs">
                <label className="flex items-center gap-2 text-muted-foreground">
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                    className="accent-primary"
                  />
                  Remember me
                </label>
                <Link
                  href="#"
                  className="font-medium text-primary hover:underline"
                >
                  Forgot password?
                </Link>
              </div>

              <Button
                type="submit"
                className="mt-2 w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <span className="inline-flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground" />
                    Signing in…
                  </span>
                ) : (
                  "Sign In"
                )}
              </Button>
            </form>

            <div className="mt-6 border-t border-border/60 pt-4 text-center text-xs text-muted-foreground">
              <p className="mb-1">Don&apos;t have an account?</p>
              <Link
                href="/register"
                className="font-medium text-primary hover:underline"
              >
                Sign up
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
