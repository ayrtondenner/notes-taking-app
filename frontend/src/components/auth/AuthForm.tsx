"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { signup, login } from "@/lib/api";
import { setToken } from "@/lib/auth";

interface AuthFormProps {
  mode: "signup" | "login";
}

export default function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const isSignup = mode === "signup";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const authFn = isSignup ? signup : login;
      const data = await authFn(email, password);
      setToken(data.token);
      router.push("/dashboard");
    } catch (err: unknown) {
      if (
        err &&
        typeof err === "object" &&
        "response" in err &&
        err.response &&
        typeof err.response === "object" &&
        "data" in err.response
      ) {
        const responseData = err.response.data as Record<string, string[]>;
        const messages = Object.values(responseData).flat();
        setError(messages.join(" "));
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-cream px-4">
      <div className="w-full max-w-md space-y-8 text-center">
        {/* Illustration */}
        <div className="flex justify-center">
          <div className="text-6xl">
            {isSignup ? "\u{1F63A}" : "\u{1F335}"}
          </div>
        </div>

        {/* Heading */}
        <h1 className="font-serif text-3xl font-bold text-dark">
          {isSignup ? "Yay, New Friend!" : "Yay, You're Back!"}
        </h1>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          <Input
            label="Email address"
            type="email"
            value={email}
            onChange={setEmail}
            placeholder="hello@example.com"
          />
          <Input
            label="Password"
            type="password"
            value={password}
            onChange={setPassword}
            placeholder="Enter your password"
          />

          {error && (
            <p className="text-sm text-red-600">{error}</p>
          )}

          <div className="flex justify-center pt-2">
            <Button type="submit" disabled={loading}>
              {loading
                ? "Please wait..."
                : isSignup
                  ? "Sign Up"
                  : "Login"}
            </Button>
          </div>
        </form>

        {/* Toggle link */}
        <p className="text-sm text-accent">
          {isSignup ? (
            <Link href="/login" className="underline hover:text-accent/80">
              We&apos;re already friends!
            </Link>
          ) : (
            <Link href="/signup" className="underline hover:text-accent/80">
              Oops! I&apos;ve never been here before
            </Link>
          )}
        </p>
      </div>
    </div>
  );
}
