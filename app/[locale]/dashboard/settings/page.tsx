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
  Key,
  History,
  Monitor,
  Check,
} from "lucide-react";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = React.useState<"profile" | "security" | "notifications" | "preferences">("profile");

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
                  ? "bg-[#3b4078] text-white"
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
                <div className="w-24 h-24 bg-[#3b4078] rounded-full flex items-center justify-center text-white text-3xl font-bold">
                  NS
                </div>
                <button className="absolute bottom-0 right-0 w-8 h-8 bg-white border border-gray-200 rounded-full flex items-center justify-center shadow-sm hover:bg-gray-50">
                  <Camera className="h-4 w-4 text-gray-600" />
                </button>
              </div>
              <div>
                <p className="font-medium text-gray-900">Nordic Solutions OY</p>
                <p className="text-sm text-gray-500">Business Account</p>
                <button className="mt-2 text-sm text-[#3b4078] font-medium hover:underline">
                  Change photo
                </button>
              </div>
            </div>
          </div>

          {/* Personal Information */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Personal Information</h3>
              <button className="text-sm text-[#3b4078] font-medium hover:underline">Edit</button>
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
              <button className="text-sm text-[#3b4078] font-medium hover:underline">Edit</button>
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
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <Shield className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Two-Factor Authentication</h3>
                  <p className="text-sm text-gray-500">Add an extra layer of security to your account</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm text-green-600 font-medium flex items-center gap-1">
                  <Check className="h-4 w-4" />
                  Enabled
                </span>
                <button className="relative w-11 h-6 bg-green-500 rounded-full">
                  <span className="absolute top-1 left-6 w-4 h-4 bg-white rounded-full" />
                </button>
              </div>
            </div>
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
                      setting.enabled ? "bg-[#3b4078]" : "bg-gray-200"
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
                className="px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#3b4078]/20"
              />
              <button className="px-4 py-2 bg-[#3b4078] text-white rounded-lg text-sm font-medium hover:bg-[#2a2d5a]">
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
                <select className="w-full md:w-64 px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#3b4078]/20">
                  <option>English</option>
                  <option>Finnish</option>
                  <option>Swedish</option>
                  <option>French</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Currency Display</label>
                <select className="w-full md:w-64 px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#3b4078]/20">
                  <option>EUR (€)</option>
                  <option>USD ($)</option>
                  <option>GBP (£)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date Format</label>
                <select className="w-full md:w-64 px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#3b4078]/20">
                  <option>DD/MM/YYYY</option>
                  <option>MM/DD/YYYY</option>
                  <option>YYYY-MM-DD</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Time Zone</label>
                <select className="w-full md:w-64 px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#3b4078]/20">
                  <option>Europe/Helsinki (GMT+2)</option>
                  <option>Europe/London (GMT+0)</option>
                  <option>Europe/Paris (GMT+1)</option>
                </select>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button className="px-6 py-2.5 bg-[#3b4078] text-white rounded-lg font-medium hover:bg-[#2a2d5a]">
              Save Changes
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
