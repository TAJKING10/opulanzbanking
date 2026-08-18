"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  // Auto-redirect if already logged in
  React.useEffect(() => {
    if (typeof window !== "undefined" && localStorage.getItem("admin_token")) {
      router.replace("/admin/dashboard");
    }
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const res = await fetch(`${API}/api/admin/stats`, {
        headers: { "x-admin-token": password },
      });

      if (res.ok) {
        localStorage.setItem("admin_token", password);
        router.push("/admin/dashboard");
      } else if (res.status === 401) {
        setError("Incorrect password.");
      } else {
        setError("Authentication error. Please try again.");
      }
    } catch {
      setError("Cannot reach the authentication server. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f6f8f8]">
      <div className="w-full max-w-sm">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-br from-[#b59354] to-[#886844] p-8 text-center">
            <h1 className="text-2xl font-bold text-white tracking-widest">OPULANZ</h1>
            <p className="text-white/70 text-sm mt-1">Admin Panel</p>
          </div>
          <form onSubmit={handleLogin} className="p-8 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Admin Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#b59354] focus:border-transparent"
                autoFocus
              />
            </div>
            {error && (
              <p className="text-red-500 text-sm">{error}</p>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-[#b59354] to-[#886844] text-white font-semibold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-60"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>
        </div>
        <p className="text-center text-xs text-gray-400 mt-4">
          Opulanz Admin · Internal Use Only
        </p>
      </div>
    </div>
  );
}
