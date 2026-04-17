"use client";

import * as React from "react";
import {
  User,
  Shield,
  Bell,
  Palette,
  Camera,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Lock,
  Smartphone,
  History,
  Monitor,
  Check,
  Loader2,
} from "lucide-react";
import { getAuthToken } from "@/lib/auth";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

type TotpStep = "idle" | "qr" | "verify" | "done" | "disable";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = React.useState<"profile" | "security" | "notifications" | "preferences">("profile");

  // 2FA state
  const [totpEnabled, setTotpEnabled] = React.useState<boolean | null>(null);
  const [totpStep, setTotpStep] = React.useState<TotpStep>("idle");
  const [totpQrCode, setTotpQrCode] = React.useState("");
  const [totpSecret, setTotpSecret] = React.useState("");
  const [tempToken, setTempToken] = React.useState("");
  const [totpCode, setTotpCode] = React.useState("");
  const [totpLoading, setTotpLoading] = React.useState(false);
  const [totpError, setTotpError] = React.useState("");
  const [totpSuccess, setTotpSuccess] = React.useState("");

  // Fetch current 2FA status
  React.useEffect(() => {
    const token = getAuthToken();
    if (!token) return;
    fetch(`${API}/api/auth/me`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((d) => setTotpEnabled(!!d.totp_enabled))
      .catch(() => setTotpEnabled(false));
  }, []);

  async function handleSetupTotp() {
    setTotpError("");
    setTotpLoading(true);
    try {
      const token = getAuthToken();
      const res = await fetch(`${API}/api/auth/setup-totp`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setTotpQrCode(data.totpQrCode);
      setTotpSecret(data.totpSecret);
      setTempToken(data.tempToken);
      setTotpCode("");
      setTotpStep("qr");
    } catch (err: any) {
      setTotpError(err.message || "Failed to start 2FA setup");
    } finally {
      setTotpLoading(false);
    }
  }

  async function handleConfirmTotp(e: React.FormEvent) {
    e.preventDefault();
    setTotpError("");
    setTotpLoading(true);
    try {
      const res = await fetch(`${API}/api/auth/confirm-totp-enable`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tempToken, code: totpCode }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setTotpEnabled(true);
      setTotpSuccess("Google Authenticator enabled! You will need it every time you sign in.");
      setTotpStep("done");
    } catch (err: any) {
      setTotpError(err.message || "Invalid code. Try again.");
    } finally {
      setTotpLoading(false);
    }
  }

  async function handleDisableTotp(e: React.FormEvent) {
    e.preventDefault();
    setTotpError("");
    setTotpLoading(true);
    try {
      const token = getAuthToken();
      const res = await fetch(`${API}/api/auth/disable-totp`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ code: totpCode }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setTotpEnabled(false);
      setTotpSuccess("2FA has been disabled.");
      setTotpStep("idle");
      setTotpCode("");
    } catch (err: any) {
      setTotpError(err.message || "Invalid code.");
    } finally {
      setTotpLoading(false);
    }
  }

  const tabs = [
    { id: "profile", name: "Profile", icon: User },
    { id: "security", name: "Security", icon: Shield },
    { id: "notifications", name: "Notifications", icon: Bell },
    { id: "preferences", name: "Preferences", icon: Palette },
  ] as const;

  const trustedDevices = [
    { name: "MacBook Pro", location: "Helsinki, Finland", lastUsed: "Active now", icon: Monitor },
    { name: "iPhone 14 Pro", location: "Helsinki, Finland", lastUsed: "2 hours ago", icon: Smartphone },
  ];

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500 mt-1">Manage your account settings and preferences</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? "bg-[#b59354] text-white"
                  : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.name}
            </button>
          );
        })}
      </div>

      {/* Profile Tab */}
      {activeTab === "profile" && (
        <div className="space-y-6">
          {/* Profile Photo */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h3 className="font-semibold text-gray-900 mb-4">Profile Photo</h3>
            <div className="flex items-center gap-6">
              <div className="relative">
                <div className="w-24 h-24 bg-[#b59354] rounded-full flex items-center justify-center text-white text-3xl font-bold">
                  NS
                </div>
                <button className="absolute bottom-0 right-0 w-8 h-8 bg-white border border-gray-200 rounded-full flex items-center justify-center shadow-sm hover:bg-gray-50">
                  <Camera className="h-4 w-4 text-gray-600" />
                </button>
              </div>
              <div>
                <p className="font-medium text-gray-900">Nordic Solutions OY</p>
                <p className="text-sm text-gray-500">Business Account</p>
                <button className="mt-2 text-sm text-[#b59354] font-medium hover:underline">
                  Change photo
                </button>
              </div>
            </div>
          </div>

          {/* Personal Information */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Personal Information</h3>
              <button className="text-sm text-[#b59354] font-medium hover:underline">Edit</button>
            </div>
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <label className="block text-sm text-gray-500 mb-1">Full Name</label>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-900">Nordic Solutions OY</span>
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-500 mb-1">Email Address</label>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-900">admin@nordicsolutions.fi</span>
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-500 mb-1">Phone Number</label>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-900">+358 40 123 4567</span>
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-500 mb-1">Date of Incorporation</label>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-900">January 15, 2020</span>
                </div>
              </div>
            </div>
          </div>

          {/* Address */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Registered Address</h3>
              <button className="text-sm text-[#b59354] font-medium hover:underline">Edit</button>
            </div>
            <div className="flex items-start gap-2">
              <MapPin className="h-4 w-4 text-gray-400 mt-1" />
              <div>
                <p className="text-gray-900">Mannerheimintie 12 A</p>
                <p className="text-gray-900">00100 Helsinki</p>
                <p className="text-gray-900">Finland</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Security Tab */}
      {activeTab === "security" && (
        <div className="space-y-6">
          {/* Two-Factor Authentication */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${totpEnabled ? "bg-green-100" : "bg-gray-100"}`}>
                  <Shield className={`h-6 w-6 ${totpEnabled ? "text-green-600" : "text-gray-400"}`} />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Two-Factor Authentication</h3>
                  <p className="text-sm text-gray-500">
                    {totpEnabled === null ? "Loading..." : totpEnabled ? "Google Authenticator is active" : "Add an extra layer of security"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {totpEnabled === null ? (
                  <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
                ) : totpEnabled ? (
                  <>
                    <span className="text-sm text-green-600 font-medium flex items-center gap-1">
                      <Check className="h-4 w-4" /> Enabled
                    </span>
                    <button
                      onClick={() => { setTotpStep("disable"); setTotpCode(""); setTotpError(""); setTotpSuccess(""); }}
                      className="px-3 py-1.5 text-xs border border-red-200 text-red-600 rounded-lg hover:bg-red-50"
                    >
                      Disable
                    </button>
                  </>
                ) : (
                  <button
                    onClick={handleSetupTotp}
                    disabled={totpLoading}
                    className="px-4 py-2 bg-[#b59354] text-white rounded-lg text-sm font-medium hover:bg-[#886844] disabled:opacity-50 flex items-center gap-2"
                  >
                    {totpLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                    Set Up Google Authenticator
                  </button>
                )}
              </div>
            </div>

            {/* Error / Success banners */}
            {totpError && (
              <div className="mt-3 bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">{totpError}</div>
            )}
            {totpSuccess && (
              <div className="mt-3 bg-green-50 border border-green-200 rounded-lg px-4 py-3 text-sm text-green-700">{totpSuccess}</div>
            )}

            {/* QR Code step */}
            {totpStep === "qr" && (
              <div className="mt-5 border-t border-gray-100 pt-5 space-y-4">
                <p className="text-sm font-semibold text-gray-800">1. Scan this QR code with Google Authenticator</p>
                <div className="flex justify-center">
                  {totpQrCode && <img src={totpQrCode} alt="TOTP QR Code" className="h-48 w-48 rounded-xl border border-gray-200 p-2" />}
                </div>
                <details className="rounded-lg border border-gray-200 p-3">
                  <summary className="cursor-pointer text-xs text-gray-500 select-none">Can't scan? Enter the key manually</summary>
                  <p className="mt-2 break-all rounded bg-gray-50 px-3 py-2 font-mono text-xs text-gray-800">{totpSecret}</p>
                </details>
                <p className="text-sm font-semibold text-gray-800">2. Enter the 6-digit code from the app</p>
                <form onSubmit={handleConfirmTotp} className="flex gap-3">
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    autoFocus
                    value={totpCode}
                    onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, ""))}
                    placeholder="000000"
                    className="w-40 px-4 py-2.5 border border-gray-200 rounded-lg text-center text-xl font-mono tracking-widest focus:outline-none focus:ring-2 focus:ring-[#b59354]"
                  />
                  <button
                    type="submit"
                    disabled={totpLoading || totpCode.length < 6}
                    className="px-5 py-2.5 bg-[#b59354] text-white rounded-lg text-sm font-semibold hover:bg-[#886844] disabled:opacity-50 flex items-center gap-2"
                  >
                    {totpLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                    Verify & Enable
                  </button>
                  <button type="button" onClick={() => { setTotpStep("idle"); setTotpError(""); }} className="text-sm text-gray-500 hover:text-gray-700">
                    Cancel
                  </button>
                </form>
              </div>
            )}

            {/* Disable step */}
            {totpStep === "disable" && (
              <div className="mt-5 border-t border-gray-100 pt-5 space-y-3">
                <p className="text-sm text-gray-700">Enter your current Google Authenticator code to disable 2FA:</p>
                <form onSubmit={handleDisableTotp} className="flex gap-3">
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    autoFocus
                    value={totpCode}
                    onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, ""))}
                    placeholder="000000"
                    className="w-40 px-4 py-2.5 border border-gray-200 rounded-lg text-center text-xl font-mono tracking-widest focus:outline-none focus:ring-2 focus:ring-red-400"
                  />
                  <button
                    type="submit"
                    disabled={totpLoading || totpCode.length < 6}
                    className="px-5 py-2.5 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700 disabled:opacity-50 flex items-center gap-2"
                  >
                    {totpLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                    Disable 2FA
                  </button>
                  <button type="button" onClick={() => { setTotpStep("idle"); setTotpError(""); }} className="text-sm text-gray-500 hover:text-gray-700">
                    Cancel
                  </button>
                </form>
              </div>
            )}
          </div>

          {/* Change Password */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                  <Lock className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Password</h3>
                  <p className="text-sm text-gray-500">Last changed 30 days ago</p>
                </div>
              </div>
              <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">
                Change Password
              </button>
            </div>
          </div>

          {/* Login History */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <History className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Login History</h3>
                  <p className="text-sm text-gray-500">View recent login activity</p>
                </div>
              </div>
              <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">
                View History
              </button>
            </div>
          </div>

          {/* Trusted Devices */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h3 className="font-semibold text-gray-900 mb-4">Trusted Devices</h3>
            <div className="space-y-4">
              {trustedDevices.map((device, index) => {
                const Icon = device.icon;
                return (
                  <div key={index} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                        <Icon className="h-5 w-5 text-gray-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{device.name}</p>
                        <p className="text-xs text-gray-500">{device.location}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">{device.lastUsed}</p>
                      <button className="text-xs text-red-600 hover:underline">Remove</button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Notifications Tab */}
      {activeTab === "notifications" && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h3 className="font-semibold text-gray-900 mb-6">Notification Preferences</h3>
            <div className="space-y-6">
              {[
                { name: "Email Notifications", description: "Receive updates via email", enabled: true },
                { name: "Push Notifications", description: "Receive notifications on your device", enabled: true },
                { name: "SMS Alerts", description: "Receive important alerts via SMS", enabled: false },
                { name: "Transaction Alerts", description: "Get notified for every transaction", enabled: true },
                { name: "Marketing Emails", description: "Receive news and promotional offers", enabled: false },
              ].map((setting, index) => (
                <div key={index} className="flex items-center justify-between py-2">
                  <div>
                    <p className="font-medium text-gray-900">{setting.name}</p>
                    <p className="text-sm text-gray-500">{setting.description}</p>
                  </div>
                  <button
                    className={`relative w-11 h-6 rounded-full transition-colors ${
                      setting.enabled ? "bg-[#b59354]" : "bg-gray-200"
                    }`}
                  >
                    <span
                      className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                        setting.enabled ? "left-6" : "left-1"
                      }`}
                    />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Alert Threshold */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h3 className="font-semibold text-gray-900 mb-4">Transaction Alert Threshold</h3>
            <p className="text-sm text-gray-500 mb-4">
              Get notified when a transaction exceeds this amount
            </p>
            <div className="flex items-center gap-4">
              <input
                type="text"
                defaultValue="€500.00"
                className="px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#b59354]/20"
              />
              <button className="px-4 py-2 bg-[#b59354] text-white rounded-lg text-sm font-medium hover:bg-[#886844]">
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Preferences Tab */}
      {activeTab === "preferences" && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h3 className="font-semibold text-gray-900 mb-6">Display Preferences</h3>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
                <select className="w-full md:w-64 px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#b59354]/20">
                  <option>English</option>
                  <option>Finnish</option>
                  <option>Swedish</option>
                  <option>French</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Currency Display</label>
                <select className="w-full md:w-64 px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#b59354]/20">
                  <option>EUR (€)</option>
                  <option>USD ($)</option>
                  <option>GBP (£)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date Format</label>
                <select className="w-full md:w-64 px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#b59354]/20">
                  <option>DD/MM/YYYY</option>
                  <option>MM/DD/YYYY</option>
                  <option>YYYY-MM-DD</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Time Zone</label>
                <select className="w-full md:w-64 px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#b59354]/20">
                  <option>Europe/Helsinki (GMT+2)</option>
                  <option>Europe/London (GMT+0)</option>
                  <option>Europe/Paris (GMT+1)</option>
                </select>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button className="px-6 py-2.5 bg-[#b59354] text-white rounded-lg font-medium hover:bg-[#886844]">
              Save Changes
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
