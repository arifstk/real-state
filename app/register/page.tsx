// app/register/page.tsx

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Mail, Lock, ShieldCheck, User, Phone, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error("Passwords do not match!");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, mobile, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || "Something went wrong");
        setLoading(false);
        return;
      }

      toast.success("Account created successfully!");

      // Registration এর পর অটো লগইন করে homepage এ রিডাইরেক্ট
      const loginRes = await signIn("credentials", {
        identifier: email,
        password,
        redirect: false,
      });

      setLoading(false);

      if (loginRes?.ok) {
        router.push("/");
        router.refresh();
      } else {
        router.push("/login");
      }
    } catch (err) {
      setLoading(false);
      toast.error("Failed to connect to the server.");
    }
  };

  return (
    <div className="auth-page-bg flex items-center justify-center p-4">
      <div className="auth-card w-full max-w-sm p-4 md:p-8 mb-10">
        <div className="flex flex-col items-center mb-6">
          <div className="auth-icon-circle w-20 h-20 rounded-full flex items-center justify-center mb-4">
            <ShieldCheck className="text-white" size={36} />
          </div>
          <h1 className="text-2xl font-bold text-dark">Create Account</h1>
          <p className="text-gray-500 text-sm mt-1">Sign up for a new account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name Input */}
          <div className="auth-input flex items-center gap-3 px-4 py-3">
            <User size={18} className="text-primary" />
            <input
              type="text"
              placeholder="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="flex-1 outline-none bg-transparent text-sm"
            />
          </div>

          {/* Email Input */}
          <div className="auth-input flex items-center gap-3 px-4 py-3">
            <Mail size={18} className="text-primary" />
            <input
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value.toLowerCase())}
              required
              className="flex-1 outline-none bg-transparent text-sm"
            />
          </div>

          {/* Mobile Input */}
          <div className="auth-input flex items-center gap-3 px-4 py-3">
            <Phone size={18} className="text-primary" />
            <input
              type="tel"
              placeholder="Mobile Number"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              required
              className="flex-1 outline-none bg-transparent text-sm"
            />
          </div>

          {/* Password Input with Show/Hide Toggle */}
          <div className="auth-input flex items-center gap-3 px-4 py-3 relative">
            <Lock size={18} className="text-primary" />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
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

          {/* Confirm Password Input with Show/Hide Toggle */}
          <div className="auth-input flex items-center gap-3 px-4 py-3 relative">
            <Lock size={18} className="text-primary" />
            <input
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={6}
              className="flex-1 outline-none bg-transparent text-sm pr-8"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-4 text-gray-400 hover:text-primary focus:outline-none transition-colors cursor-pointer"
            >
              {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full py-3 text-white font-semibold cursor-pointer disabled:opacity-60"
          >
            {loading ? "Creating Account..." : "Register"}
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
          Already have an account?{" "}
          <Link href="/login" className="text-primary font-semibold">
            Login
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
