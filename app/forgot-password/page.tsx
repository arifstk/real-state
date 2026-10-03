// app/forgot-password/page.tsx

"use client";
import { useState } from "react";
import Link from "next/link";
import { Mail, ShieldCheck, ArrowLeft, CheckCircle2 } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Something went wrong");
        setLoading(false);
        return;
      }

      setSubmitted(true);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="auth-card w-full max-w-sm p-4 md:p-8 text-center">
          <div className="auth-icon-circle w-20 h-20 rounded-full flex items-center justify-center mb-4 mx-auto">
            <CheckCircle2 className="text-white" size={36} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Check your email</h1>
          <p className="text-gray-500 text-sm mt-2">
            If an account exists for <span className="font-medium">{email}</span>,
            we&apos;ve sent a password reset link. It expires in 15 minutes.
          </p>
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 mt-6 text-indigo-600 font-semibold text-sm"
          >
            <ArrowLeft size={16} />
            Back to login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="auth-card w-full max-w-sm p-4 md:p-8">
        <div className="flex flex-col items-center mb-6">
          <div className="auth-icon-circle w-20 h-20 rounded-full flex items-center justify-center mb-4">
            <ShieldCheck className="text-white" size={36} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Forgot Password?</h1>
          <p className="text-gray-500 text-sm mt-1 text-center">
            Enter your email and we&apos;ll send you a reset link
          </p>
        </div>

        {error && (
          <p className="text-red-500 text-sm text-center mb-4">{error}</p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="auth-input flex items-center gap-3 px-4 py-3">
            <Mail size={18} className="text-gray-400" />
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="flex-1 outline-none bg-transparent text-sm"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full py-3 text-white font-semibold cursor-pointer disabled:opacity-60"
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>

        <Link
          href="/login"
          className="flex items-center justify-center gap-1.5 mt-6 text-indigo-600 font-semibold text-sm"
        >
          <ArrowLeft size={16} />
          Back to login
        </Link>
      </div>
    </div>
  );
}
