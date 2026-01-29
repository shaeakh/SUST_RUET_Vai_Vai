"use client";

import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { Navbar } from "@/components/Navbar";
import Link from "next/link";
import { useRouter } from "next/navigation";
import * as React from "react";

interface RegisterFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: string;
}

interface FormErrors {
  [key: string]: string;
}

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = React.useState<RegisterFormData>({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "",
  });
  const [errors, setErrors] = React.useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [message, setMessage] = React.useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ): void => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
    setMessage(null);
  };

  const validate = (): FormErrors => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required.";
    }

    if (!formData.email) {
      newErrors.email = "Email is required.";
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = "Please enter a valid email address.";
    }

    if (!formData.password) {
      newErrors.password = "Password is required.";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters.";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password.";
    } else if (formData.confirmPassword !== formData.password) {
      newErrors.confirmPassword = "Passwords do not match.";
    }

    if (!formData.role) {
      newErrors.role = "Please select a role.";
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

    const submission = {
      name: formData.name.trim(),
      email: formData.email,
      password: formData.password,
      role: formData.role,
    };

    // eslint-disable-next-line no-console
    console.log("Register submit:", submission);

    setTimeout(() => {
      if (typeof window !== "undefined") {
        const user = {
          name: submission.name,
          email: submission.email,
          role: submission.role,
        };
        window.localStorage.setItem("vai-vai-user", JSON.stringify(user));
      }

      setMessage("Account created successfully. Redirecting to dashboard...");
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
              Create Your Account
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Join the platform and start monitoring your dashboard.
            </p>

            <form className="mt-6 space-y-4" onSubmit={handleSubmit} noValidate>
              <div className="space-y-1">
                <label
                  htmlFor="name"
                  className="block text-xs font-medium text-foreground"
                >
                  Full Name
                </label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="Enter your full name"
                  autoComplete="name"
                  value={formData.name}
                  onChange={handleChange}
                  error={errors.name}
                  aria-describedby={errors.name ? "name-error" : undefined}
                />
              </div>

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
                  placeholder="Create a password"
                  autoComplete="new-password"
                  value={formData.password}
                  onChange={handleChange}
                  error={errors.password}
                  aria-describedby={
                    errors.password ? "password-error" : undefined
                  }
                />
              </div>

              <div className="space-y-1">
                <label
                  htmlFor="confirmPassword"
                  className="block text-xs font-medium text-foreground"
                >
                  Confirm Password
                </label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  placeholder="Confirm your password"
                  autoComplete="new-password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  error={errors.confirmPassword}
                  aria-describedby={
                    errors.confirmPassword
                      ? "confirm-password-error"
                      : undefined
                  }
                />
              </div>

              <div className="space-y-1">
                <label
                  htmlFor="role"
                  className="block text-xs font-medium text-foreground"
                >
                  Role
                </label>
                <div className="space-y-1">
                  <select
                    id="role"
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    className={`flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 transition-all ${
                      errors.role
                        ? "border-red-500 focus-visible:ring-red-500"
                        : "border-input"
                    }`}
                    aria-invalid={!!errors.role}
                    aria-describedby={errors.role ? "role-error" : undefined}
                  >
                    <option value="">Select a role</option>
                    <option value="User">User</option>
                    <option value="Admin">Admin</option>
                  </select>
                  {errors.role && (
                    <p
                      id="role-error"
                      className="text-xs font-medium text-red-600"
                    >
                      {errors.role}
                    </p>
                  )}
                </div>
              </div>

              <Button
                type="submit"
                className="mt-2 w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Creating account..." : "Create Account"}
              </Button>

              {message && (
                <p className="mt-2 text-xs text-green-600">{message}</p>
              )}
            </form>

            <div className="mt-6 border-t border-border/60 pt-4 text-center text-xs text-muted-foreground">
              <p className="mb-1">Already have an account?</p>
              <Link
                href="/login"
                className="font-medium text-primary hover:underline"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
