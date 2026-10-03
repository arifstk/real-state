// app/login/page.tsx

"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { Mail, Lock, ShieldCheck, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await signIn("credentials", {
      identifier,
      password,
      remember: remember ? "true" : "false",
      redirect: false,
    });

    setLoading(false);

    if (res?.error) {
      setError("Invalid email/mobile or password");
      return;
    }

    router.push("/");
    router.refresh();
  };

  return (
    <div className="auth-page-bg flex items-center justify-center p-4">
      <div className="auth-card w-full max-w-sm p-4 md:p-8 mb-10">
        <div className="flex flex-col items-center mb-6">
          <div className="auth-icon-circle w-20 h-20 rounded-full flex items-center justify-center mb-4">
            <ShieldCheck className="text-white" size={36} />
          </div>
          <h1 className="text-2xl font-bold text-dark">Welcome Back</h1>
          <p className="text-gray-500 text-sm mt-1">Login to your account</p>
        </div>

        {error && <p className="text-red-500 text-sm text-center mb-4">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="auth-input flex items-center gap-3 px-4 py-3">
            <Mail size={18} className="text-primary" />
            <input
              type="text"
              placeholder="Email or Mobile"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              required
              className="flex-1 outline-none bg-transparent text-sm"
            />
          </div>

          {/* ─── PASSWORD INPUT WITH VIEW TOGGLE ─── */}
          <div className="auth-input flex items-center gap-3 px-4 py-3 relative">
            <Lock size={18} className="text-primary" />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="flex-1 outline-none bg-transparent text-sm pr-8"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 text-gray-400 hover:text-primary focus:outline-none transition-colors cursor-pointer"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2 text-gray-600">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                className="accent-primary"
              />
              Remember me
            </label>
            <Link href="/forgot-password" className="text-primary font-medium">
              Forgot password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full py-3 text-white font-semibold cursor-pointer disabled:opacity-60"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <div className="flex items-center gap-3 my-6">
          <div className="h-px bg-gray-200 flex-1" />
          <span className="text-xs text-gray-400">or continue with</span>
          <div className="h-px bg-gray-200 flex-1" />
        </div>

        <button
          type="button"
          onClick={() => signIn("google", { callbackUrl: "/" })}
          className="btn-oauth w-full py-3 flex items-center justify-center gap-2 font-medium text-dark cursor-pointer disabled:opacity-60"
        >
          <GoogleIcon />
          Google
        </button>

        <p className="text-center text-sm text-gray-500 mt-6">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="text-primary font-semibold">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 48 48">
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.9 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.5 6.1 29.5 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.2-.1-2.4-.4-3.5z" />
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 15.9 18.9 13 24 13c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.5 6.1 29.5 4 24 4c-7.5 0-14 4.1-17.7 10.2z" />
      <path fill="#4CAF50" d="M24 44c5.3 0 10.1-2 13.7-5.4l-6.3-5.3C29.4 34.8 26.8 36 24 36c-5.3 0-9.7-3.4-11.3-8.1l-6.5 5C9.9 39.8 16.4 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.4-2.3 4.4-4.2 5.9l6.3 5.3C39.5 37.1 44 31.2 44 24c0-1.2-.1-2.4-.4-3.5z" />
    </svg>
  );
}
