"use client";

import axios from "axios";
import {
  AlertCircle,
  CheckCircle,
  Eye,
  EyeOff,
  Lock,
  Mail,
  User,
} from "lucide-react";
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
import { registerUser } from "@/lib/api/authApi";

interface FormErrors {
  full_name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  role?: string;
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

export default function RegisterPage() {
  const router = useRouter();
  const { loading, isAuthenticated } = useAuth();

  const [full_name, setFullName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [role, setRole] = React.useState<"user" | "admin">("user");
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirm, setShowConfirm] = React.useState(false);

  const [errors, setErrors] = React.useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState(false);

  React.useEffect(() => {
    if (loading) return;
    if (isAuthenticated) router.replace("/dashboard");
  }, [isAuthenticated, loading, router]);

  const validate = (): FormErrors => {
    const next: FormErrors = {};
    if (!full_name.trim()) next.full_name = "Full name is required.";
    if (!email) next.email = "Email is required.";
    else if (!emailRegex.test(email))
      next.email = "Please enter a valid email.";
    if (!password) next.password = "Password is required.";
    else if (password.length < 6)
      next.password = "Password must be at least 6 characters.";
    if (!confirmPassword)
      next.confirmPassword = "Please confirm your password.";
    else if (confirmPassword !== password)
      next.confirmPassword = "Passwords do not match.";
    if (!role) next.role = "Please select a role.";
    return next;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMsg(null);
    const v = validate();
    setErrors(v);
    if (Object.keys(v).length > 0) return;

    setIsSubmitting(true);
    try {
      const response = await registerUser({
        email,
        password,
        full_name: full_name.trim(),
        role,
      });
      if (response.success) {
        setSuccess(true);
        setTimeout(() => router.replace("/login"), 2000);
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
            {success ? (
              <div className="py-6 text-center">
                <div className="mx-auto mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-700">
                  <CheckCircle className="size-6" />
                </div>
                <h1 className="text-xl font-semibold tracking-tight">
                  Account created
                </h1>
                <p className="mt-2 text-sm text-muted-foreground">
                  Your account was created successfully. Redirecting to login…
                </p>
              </div>
            ) : (
              <>
                <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
                  Create Your Account
                </h1>
                <p className="mt-1 text-sm text-muted-foreground">
                  Join the platform and start learning.
                </p>

                {errorMsg ? (
                  <div className="mt-4 flex items-start gap-2 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                    <AlertCircle className="mt-0.5 size-4" />
                    <p>{errorMsg}</p>
                  </div>
                ) : null}

                <form
                  className="mt-6 space-y-4"
                  onSubmit={handleSubmit}
                  noValidate
                >
                  <div className="space-y-1">
                    <label
                      htmlFor="full_name"
                      className="block text-xs font-medium text-foreground"
                    >
                      Full Name
                    </label>
                    <InputGroup>
                      <InputGroupAddon>
                        <User className="size-4" />
                      </InputGroupAddon>
                      <InputGroupInput
                        id="full_name"
                        name="full_name"
                        type="text"
                        placeholder="Enter your full name"
                        autoComplete="name"
                        value={full_name}
                        onChange={(e) => {
                          setFullName(e.target.value);
                          setErrors((p) => ({ ...p, full_name: undefined }));
                          setErrorMsg(null);
                        }}
                        aria-invalid={!!errors.full_name}
                        disabled={isSubmitting}
                      />
                    </InputGroup>
                    {errors.full_name ? (
                      <p className="text-xs font-medium text-red-600">
                        {errors.full_name}
                      </p>
                    ) : null}
                  </div>

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
                        placeholder="Create a password"
                        autoComplete="new-password"
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

                  <div className="space-y-1">
                    <label
                      htmlFor="confirmPassword"
                      className="block text-xs font-medium text-foreground"
                    >
                      Confirm Password
                    </label>
                    <InputGroup>
                      <InputGroupAddon>
                        <Lock className="size-4" />
                      </InputGroupAddon>
                      <InputGroupInput
                        id="confirmPassword"
                        name="confirmPassword"
                        type={showConfirm ? "text" : "password"}
                        placeholder="Confirm your password"
                        autoComplete="new-password"
                        value={confirmPassword}
                        onChange={(e) => {
                          setConfirmPassword(e.target.value);
                          setErrors((p) => ({
                            ...p,
                            confirmPassword: undefined,
                          }));
                          setErrorMsg(null);
                        }}
                        aria-invalid={!!errors.confirmPassword}
                        disabled={isSubmitting}
                      />
                      <InputGroupAddon align="inline-end">
                        <InputGroupButton
                          aria-label={
                            showConfirm ? "Hide password" : "Show password"
                          }
                          onClick={() => setShowConfirm((v) => !v)}
                        >
                          {showConfirm ? (
                            <EyeOff className="size-4" />
                          ) : (
                            <Eye className="size-4" />
                          )}
                        </InputGroupButton>
                      </InputGroupAddon>
                    </InputGroup>
                    {errors.confirmPassword ? (
                      <p className="text-xs font-medium text-red-600">
                        {errors.confirmPassword}
                      </p>
                    ) : null}
                  </div>

                  <div className="space-y-2">
                    <p className="block text-xs font-medium text-foreground">
                      Role
                    </p>
                    <div className="flex items-center gap-4 text-sm">
                      <label className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="role"
                          value="user"
                          checked={role === "user"}
                          onChange={() => setRole("user")}
                          className="accent-primary"
                        />
                        Student
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="role"
                          value="admin"
                          checked={role === "admin"}
                          onChange={() => setRole("admin")}
                          className="accent-primary"
                        />
                        Instructor
                      </label>
                    </div>
                    {errors.role ? (
                      <p className="text-xs font-medium text-red-600">
                        {errors.role}
                      </p>
                    ) : null}
                  </div>

                  <Button
                    type="submit"
                    className="mt-2 w-full"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <span className="inline-flex items-center gap-2">
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground" />
                        Creating…
                      </span>
                    ) : (
                      "Create Account"
                    )}
                  </Button>
                </form>
              </>
            )}

            <div className="mt-6 border-t border-border/60 pt-4 text-center text-xs text-muted-foreground">
              <p className="mb-1">Already have an account?</p>
              <Link
                href="/login"
                className="font-medium text-primary hover:underline"
              >
                Sign in
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
