import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";

// ── Shared login card component ────────────────────────────────────────────
interface LoginCardProps {
  portal: "admin" | "client";
  title: string;
  subtitle: string;
  quickEmail: string;
  quickPassword: string;
}

function LoginCard({ portal, title, subtitle, quickEmail, quickPassword }: LoginCardProps) {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const isAdmin = portal === "admin";

  const headerBg = isAdmin ? "bg-gray-900" : "bg-slate-800";
  const badgeBg = isAdmin ? "bg-green-500" : "bg-blue-500";
  const badgeInitial = isAdmin ? "TV" : "C";
  const accentLabel = isAdmin ? "text-green-400" : "text-blue-400";
  const ringFocus = isAdmin ? "focus:ring-green-500" : "focus:ring-blue-500";
  const btnPrimary = isAdmin
    ? "bg-green-600 hover:bg-green-700 disabled:bg-green-400"
    : "bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400";
  const btnSecondary = isAdmin
    ? "border border-green-500 text-green-600 hover:bg-green-50"
    : "border border-blue-500 text-blue-600 hover:bg-blue-50";
  const tagStyle = isAdmin
    ? "bg-green-50 text-green-700 border border-green-200"
    : "bg-blue-50 text-blue-700 border border-blue-200";
  const dividerColor = isAdmin ? "border-gray-100" : "border-gray-100";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email.trim()) { setError("Email address is required."); return; }
    if (!password) { setError("Password is required."); return; }
    setLoading(true);
    setTimeout(() => {
      const result = login(email.trim(), password, portal);
      if (!result.success) setError(result.error ?? "Login failed.");
      setLoading(false);
    }, 400);
  };

  const handleQuickAccess = () => {
    setError("");
    setLoading(true);
    setTimeout(() => {
      const result = login(quickEmail, quickPassword, portal);
      if (!result.success) setError(result.error ?? "Quick access failed.");
      setLoading(false);
    }, 300);
  };

  return (
    <div className="bg-white rounded-2xl shadow-2xl overflow-hidden w-full flex flex-col">
      {/* Header */}
      <div className={`${headerBg} px-7 py-6 flex flex-col items-center gap-3`}>
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 ${badgeBg} rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-lg`}>
            {badgeInitial}
          </div>
          <div>
            <div className="text-white font-bold text-lg leading-tight">{title}</div>
            <div className={`${accentLabel} text-xs tracking-widest uppercase`}>{subtitle}</div>
          </div>
        </div>
        <span className={`text-xs px-3 py-1 rounded-full font-medium ${tagStyle}`}>
          {isAdmin ? "Platform Administration" : "Client Portal"}
        </span>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="px-7 py-6 flex flex-col gap-4 flex-1">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 flex items-start gap-2">
            <span className="text-red-500 text-sm mt-0.5">⚠</span>
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-gray-700">
            Email Address <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={isAdmin ? "admin@traceverified.com" : "admin@client.com"}
            className={`w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 ${ringFocus} focus:border-transparent transition`}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-gray-700">
            Password <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className={`w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 ${ringFocus} focus:border-transparent transition pr-14`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs"
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full ${btnPrimary} text-white font-semibold py-2.5 rounded-lg text-sm transition-all duration-150 shadow-sm mt-1`}
        >
          {loading ? "Signing in…" : "Sign In"}
        </button>

        <div className={`border-t ${dividerColor} pt-4 flex flex-col gap-2`}>
          <p className="text-xs text-gray-400 text-center">Development shortcut</p>
          <button
            type="button"
            onClick={handleQuickAccess}
            disabled={loading}
            className={`w-full ${btnSecondary} font-medium py-2.5 rounded-lg text-sm transition-all duration-150`}
          >
            🚀 Access without credentials
          </button>
        </div>
      </form>

      <div className="px-7 pb-5 text-center">
        <p className="text-xs text-gray-400">
          © {new Date().getFullYear()} Traceverified · TraceChain Platform
        </p>
      </div>
    </div>
  );
}

// ── Main Login Page ────────────────────────────────────────────────────────
export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-slate-900 flex flex-col items-center justify-center p-6 gap-10">
      {/* Page heading */}
      <div className="text-center">
        <div className="flex items-center justify-center gap-3 mb-3">
          <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-blue-500 rounded-2xl flex items-center justify-center shadow-xl">
            <span className="text-white font-black text-base">TV</span>
          </div>
          <div className="text-left">
            <h1 className="text-white text-2xl font-extrabold tracking-tight leading-tight">
              TraceVerified
            </h1>
            <p className="text-gray-400 text-xs tracking-widest uppercase">TraceChain Platform</p>
          </div>
        </div>
        <p className="text-gray-500 text-sm max-w-sm">
          Choose your portal to sign in. Two separate portals serve different roles.
        </p>
      </div>

      {/* Two login cards side by side */}
      <div className="w-full max-w-3xl grid grid-cols-1 md:grid-cols-2 gap-6">
        <LoginCard
          portal="admin"
          title="TraceChain Admin Portal"
          subtitle="Administration Portal"
          quickEmail="admin@traceverified.com"
          quickPassword="TCpassword"
        />
        <LoginCard
          portal="client"
          title="TraceChain Client Portal"
          subtitle="Client Portal"
          quickEmail="superadmin@client.com"
          quickPassword="TCpassword"
        />
      </div>
    </div>
  );
}
