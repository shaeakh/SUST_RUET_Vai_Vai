"use client";

import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { Navbar } from "@/components/Navbar";
import Link from "next/link";
import { useRouter } from "next/navigation";
import * as React from "react";

interface LoginFormData {
  email: string;
  password: string;
}

interface FormErrors {
  [key: string]: string;
}

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = React.useState<LoginFormData>({
    email: "",
    password: "",
  });
  const [errors, setErrors] = React.useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [message, setMessage] = React.useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
    setMessage(null);
  };

  const validate = (): FormErrors => {
    const newErrors: FormErrors = {};

    if (!formData.email) {
      newErrors.email = "Email is required.";
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = "Please enter a valid email address.";
    }

    if (!formData.password) {
      newErrors.password = "Password is required.";
    }

    return newErrors;
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    const validationErrors = validate();

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);
    setMessage(null);

    // Mock login request
    // eslint-disable-next-line no-console
    console.log("Login submit:", formData);

    setTimeout(() => {
      if (typeof window !== "undefined") {
        const mockUser = {
          name: "Demo User",
          email: formData.email,
          role: "User",
        };
        window.localStorage.setItem("vai-vai-user", JSON.stringify(mockUser));
      }

      setMessage("Login successful. Redirecting to dashboard...");
      setIsSubmitting(false);

      setTimeout(() => {
        router.push("/dashboard");
      }, 1000);
    }, 800);
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

            <form className="mt-6 space-y-4" onSubmit={handleSubmit} noValidate>
              <div className="space-y-1">
                <label
                  htmlFor="email"
                  className="block text-xs font-medium text-foreground"
                >
                  Email
                </label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Enter your email"
                  autoComplete="email"
                  value={formData.email}
                  onChange={handleChange}
                  error={errors.email}
                  aria-describedby={errors.email ? "email-error" : undefined}
                />
              </div>

              <div className="space-y-1">
                <label
                  htmlFor="password"
                  className="block text-xs font-medium text-foreground"
                >
                  Password
                </label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  value={formData.password}
                  onChange={handleChange}
                  error={errors.password}
                  aria-describedby={
                    errors.password ? "password-error" : undefined
                  }
                />
              </div>

              <div className="flex items-center justify-between text-xs">
                <button
                  type="button"
                  className="font-medium text-primary hover:underline"
                >
                  Forgot password?
                </button>
              </div>

              <Button
                type="submit"
                className="mt-2 w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Logging in..." : "Login"}
              </Button>

              {message && (
                <p className="mt-2 text-xs text-green-600">{message}</p>
              )}
            </form>

            <div className="mt-6 border-t border-border/60 pt-4 text-center text-xs text-muted-foreground">
              <p className="mb-1">Don&apos;t have an account?</p>
              <Link
                href="/register"
                className="font-medium text-primary hover:underline"
              >
                Create Account
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
