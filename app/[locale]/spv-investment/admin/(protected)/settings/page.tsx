"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import {
  User,
  Users,
  Activity,
  Shield,
  Key,
  Plus,
  Pencil,
  Trash2,
  RefreshCw,
  Copy,
  Check,
  Clock,
  Mail,
  Calendar,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import {
  getCurrentAdmin,
  getAdmins,
  createAdmin,
  updateAdmin,
  deleteAdmin,
  resetAdminPassword,
  getActivityLog,
  type AdminProfile,
  type ActivityLog,
} from "@/lib/investment-api";

type TabType = "profile" | "admins" | "activity";

export default function AdminSettingsPage() {
  const searchParams = useSearchParams();
  const locale = useLocale();
  const t = useTranslations();

  const [activeTab, setActiveTab] = React.useState<TabType>("profile");
  const [currentAdmin, setCurrentAdmin] = React.useState<AdminProfile | null>(null);
  const [admins, setAdmins] = React.useState<AdminProfile[]>([]);
  const [activityLogs, setActivityLogs] = React.useState<ActivityLog[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  // Modal states
  const [showAdminModal, setShowAdminModal] = React.useState(false);
  const [editingAdmin, setEditingAdmin] = React.useState<AdminProfile | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = React.useState<number | null>(null);
  const [showResetPassword, setShowResetPassword] = React.useState<number | null>(null);
  const [newAccessCode, setNewAccessCode] = React.useState<string | null>(null);
  const [codeCopied, setCodeCopied] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);

  // Form state
  const [formData, setFormData] = React.useState({
    name: "",
    email: "",
    phone: "",
    status: "active" as "active" | "inactive",
  });

  // Activity filter
  const [activityFilter, setActivityFilter] = React.useState<string>("all");

  React.useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab === "admins" || tab === "activity") {
      setActiveTab(tab);
    }
    loadData();
  }, [searchParams]);

  const loadData = async () => {
    try {
      const admin = getCurrentAdmin();
      setCurrentAdmin(admin);

      const adminsData = await getAdmins();
      setAdmins(adminsData);

      const activityData = await getActivityLog({ limit: 100 });
      setActivityLogs(activityData.data);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const tabs = [
    { id: "profile" as TabType, label: t("spvInvestment.admin.settings.tabs.profile"), icon: User },
    { id: "admins" as TabType, label: t("spvInvestment.admin.settings.tabs.admins"), icon: Users },
    { id: "activity" as TabType, label: t("spvInvestment.admin.settings.tabs.activity"), icon: Activity },
  ];

  const handleOpenAdminModal = (admin?: AdminProfile) => {
    if (admin) {
      setEditingAdmin(admin);
      setFormData({
        name: admin.name,
        email: admin.email,
        phone: admin.phone || "",
        status: admin.status,
      });
    } else {
      setEditingAdmin(null);
      setFormData({
        name: "",
        email: "",
        phone: "",
        status: "active",
      });
    }
    setShowAdminModal(true);
  };

  const handleSaveAdmin = async () => {
    setIsSaving(true);
    try {
      if (editingAdmin) {
        await updateAdmin(editingAdmin.id, {
          name: formData.name,
          email: formData.email,
          phone: formData.phone || undefined,
          status: formData.status,
          updatedBy: currentAdmin?.id,
        });
      } else {
        const result = await createAdmin({
          name: formData.name,
          email: formData.email,
          phone: formData.phone || undefined,
          createdBy: currentAdmin?.id,
        });

        if (result.success && result.accessCode) {
          setNewAccessCode(result.accessCode);
        }
      }
      setShowAdminModal(false);
      await loadData();
    } catch (error) {
      console.error("Error saving admin:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAdmin = async (id: number) => {
    try {
      await deleteAdmin(id, currentAdmin?.id);
      setShowDeleteConfirm(null);
      await loadData();
    } catch (error) {
      console.error("Error deleting admin:", error);
    }
  };

  const handleResetPassword = async (id: number) => {
    try {
      const result = await resetAdminPassword(id, currentAdmin?.id);
      if (result.success && result.accessCode) {
        setNewAccessCode(result.accessCode);
      }
      setShowResetPassword(null);
      await loadData();
    } catch (error) {
      console.error("Error resetting password:", error);
    }
  };

  const copyAccessCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCodeCopied(true);
    setTimeout(() => setCodeCopied(false), 2000);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return t("spvInvestment.admin.common.never");
    return new Date(dateString).toLocaleDateString(locale, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const filteredLogs = activityFilter === "all"
    ? activityLogs
    : activityLogs.filter((log) => log.admin_id?.toString() === activityFilter);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-indigo-500/30 border-t-indigo-500" />
          <p className="mt-4 text-sm text-slate-600">{t("common.loading")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 py-8">
      <div className="container mx-auto max-w-6xl px-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900 md:text-3xl">
            {t("spvInvestment.admin.settings.title")}
          </h1>
          <p className="mt-1 text-slate-600">
            {t("spvInvestment.admin.profile.settingsSubtitle")}
          </p>
        </div>

        {/* Tabs */}
        <div className="mb-6 flex flex-wrap gap-2 border-b border-slate-200">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            // Hide admins tab for non-primary admins
            if (tab.id === "admins" && currentAdmin?.role !== "primary") return null;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors",
                  isActive
                    ? "border-indigo-600 text-indigo-600"
                    : "border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300"
                )}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Profile Tab */}
        {activeTab === "profile" && currentAdmin && (
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5 text-indigo-600" />
                  {t("spvInvestment.admin.settings.profile.title")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-indigo-100">
                    <User className="h-8 w-8 text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">{currentAdmin.name}</h3>
                    <div className="flex items-center gap-2">
                      {currentAdmin.role === "primary" && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
                          <Key className="h-3 w-3" />
                          {t("spvInvestment.admin.profile.primaryAdmin")}
                        </span>
                      )}
                      <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                        {currentAdmin.status === "active" ? "Active" : "Inactive"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 pt-4">
                  <div className="flex items-center gap-3 text-sm">
                    <Mail className="h-4 w-4 text-slate-400" />
                    <span className="text-slate-600">{currentAdmin.email}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Clock className="h-4 w-4 text-slate-400" />
                    <span className="text-slate-600">
                      {t("spvInvestment.admin.settings.profile.lastLogin")}: {formatDate(currentAdmin.last_login)}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Calendar className="h-4 w-4 text-slate-400" />
                    <span className="text-slate-600">
                      {t("spvInvestment.admin.settings.profile.memberSince")}: {formatDate(currentAdmin.created_at)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t("spvInvestment.admin.settings.profile.updateProfile")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>{t("spvInvestment.admin.settings.profile.name")}</Label>
                  <Input defaultValue={currentAdmin.name} />
                </div>
                <div className="space-y-2">
                  <Label>{t("spvInvestment.admin.settings.profile.email")}</Label>
                  <Input defaultValue={currentAdmin.email} type="email" />
                </div>
                <Button className="w-full bg-indigo-600 hover:bg-indigo-700">
                  {t("spvInvestment.admin.settings.profile.updateProfile")}
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Admins Tab */}
        {activeTab === "admins" && currentAdmin?.role === "primary" && (
          <div>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">
                {t("spvInvestment.admin.settings.admins.title")}
              </h2>
              <Button onClick={() => handleOpenAdminModal()} className="bg-indigo-600 hover:bg-indigo-700">
                <Plus className="mr-2 h-4 w-4" />
                {t("spvInvestment.admin.settings.admins.addAdmin")}
              </Button>
            </div>

            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="border-b bg-slate-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">
                          {t("spvInvestment.admin.settings.admins.columns.name")}
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">
                          {t("spvInvestment.admin.settings.admins.columns.email")}
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">
                          {t("spvInvestment.admin.settings.admins.columns.role")}
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">
                          {t("spvInvestment.admin.settings.admins.columns.status")}
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">
                          {t("spvInvestment.admin.settings.admins.columns.lastLogin")}
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 uppercase">
                          {t("spvInvestment.admin.settings.admins.columns.actions")}
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {admins.map((admin) => (
                        <tr key={admin.id} className="hover:bg-slate-50">
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100">
                                {admin.role === "primary" ? (
                                  <Shield className="h-5 w-5 text-indigo-600" />
                                ) : (
                                  <User className="h-5 w-5 text-indigo-600" />
                                )}
                              </div>
                              <div>
                                <p className="font-medium text-slate-900">{admin.name}</p>
                                {admin.id === currentAdmin?.id && (
                                  <span className="text-xs text-slate-500">(You)</span>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-4 text-sm text-slate-600">{admin.email}</td>
                          <td className="px-4 py-4">
                            {admin.role === "primary" ? (
                              <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-1 text-xs font-medium text-amber-700">
                                <Key className="h-3 w-3" />
                                {t("spvInvestment.admin.settings.admins.form.roles.primary")}
                              </span>
                            ) : (
                              <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700">
                                {t("spvInvestment.admin.settings.admins.form.roles.admin")}
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-4">
                            <span
                              className={cn(
                                "inline-flex items-center rounded-full px-2 py-1 text-xs font-medium",
                                admin.status === "active"
                                  ? "bg-green-100 text-green-700"
                                  : "bg-red-100 text-red-700"
                              )}
                            >
                              {admin.status === "active"
                                ? t("spvInvestment.admin.settings.admins.form.statuses.active")
                                : t("spvInvestment.admin.settings.admins.form.statuses.inactive")}
                            </span>
                          </td>
                          <td className="px-4 py-4 text-sm text-slate-600">
                            {formatDate(admin.last_login)}
                          </td>
                          <td className="px-4 py-4 text-right">
                            {admin.role !== "primary" && (
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() => setShowResetPassword(admin.id)}
                                  className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-indigo-600"
                                  title={t("spvInvestment.admin.settings.admins.resetPassword.title")}
                                >
                                  <RefreshCw className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => handleOpenAdminModal(admin)}
                                  className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-indigo-600"
                                >
                                  <Pencil className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => setShowDeleteConfirm(admin.id)}
                                  className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-red-600"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Activity Tab */}
        {activeTab === "activity" && (
          <div>
            <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
              <h2 className="text-lg font-semibold text-slate-900">
                {t("spvInvestment.admin.settings.activity.title")}
              </h2>
              {currentAdmin?.role === "primary" && (
                <select
                  value={activityFilter}
                  onChange={(e) => setActivityFilter(e.target.value)}
                  className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
                >
                  <option value="all">{t("spvInvestment.admin.settings.activity.allAdmins")}</option>
                  {admins.map((admin) => (
                    <option key={admin.id} value={admin.id.toString()}>
                      {admin.name}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <Card>
              <CardContent className="p-0">
                {filteredLogs.length === 0 ? (
                  <div className="p-8 text-center text-slate-500">
                    {t("spvInvestment.admin.settings.activity.noActivity")}
                  </div>
                ) : (
                  <div className="divide-y">
                    {filteredLogs.map((log) => (
                      <div key={log.id} className="flex items-start gap-4 p-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100">
                          <Activity className="h-5 w-5 text-slate-600" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-slate-900">{log.description}</p>
                          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                            <span>{formatDate(log.created_at)}</span>
                            {log.admin_name && (
                              <>
                                <span>•</span>
                                <span>by {log.admin_name}</span>
                              </>
                            )}
                          </div>
                        </div>
                        <span
                          className={cn(
                            "rounded-full px-2 py-1 text-xs font-medium",
                            log.log_type.includes("delete")
                              ? "bg-red-100 text-red-700"
                              : log.log_type.includes("create")
                              ? "bg-green-100 text-green-700"
                              : log.log_type.includes("login")
                              ? "bg-blue-100 text-blue-700"
                              : "bg-slate-100 text-slate-700"
                          )}
                        >
                          {log.log_type}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Admin Modal */}
        {showAdminModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
              <h2 className="mb-4 text-lg font-semibold text-slate-900">
                {editingAdmin
                  ? t("spvInvestment.admin.settings.admins.editAdmin")
                  : t("spvInvestment.admin.settings.admins.addAdmin")}
              </h2>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>{t("spvInvestment.admin.settings.admins.form.name")}</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder={t("spvInvestment.admin.settings.admins.form.namePlaceholder")}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t("spvInvestment.admin.settings.admins.form.email")}</Label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder={t("spvInvestment.admin.settings.admins.form.emailPlaceholder")}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Phone</Label>
                  <Input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+352 123 456 789"
                  />
                </div>
                {editingAdmin && (
                  <div className="space-y-2">
                    <Label>{t("spvInvestment.admin.settings.admins.form.status")}</Label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as "active" | "inactive" })}
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
                    >
                      <option value="active">{t("spvInvestment.admin.settings.admins.form.statuses.active")}</option>
                      <option value="inactive">{t("spvInvestment.admin.settings.admins.form.statuses.inactive")}</option>
                    </select>
                  </div>
                )}
                {!editingAdmin && (
                  <p className="text-sm text-slate-500">
                    An access code will be automatically generated for the new admin.
                  </p>
                )}
              </div>
              <div className="mt-6 flex justify-end gap-3">
                <Button variant="outline" onClick={() => setShowAdminModal(false)}>
                  {t("spvInvestment.admin.common.cancel")}
                </Button>
                <Button
                  onClick={handleSaveAdmin}
                  disabled={isSaving || !formData.name || !formData.email}
                  className="bg-indigo-600 hover:bg-indigo-700"
                >
                  {isSaving ? (
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      Saving...
                    </div>
                  ) : (
                    t("spvInvestment.admin.common.save")
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="w-full max-w-sm rounded-lg bg-white p-6 shadow-xl">
              <h2 className="mb-2 text-lg font-semibold text-slate-900">
                {t("spvInvestment.admin.settings.admins.deleteConfirm.title")}
              </h2>
              <p className="mb-6 text-sm text-slate-600">
                {t("spvInvestment.admin.settings.admins.deleteConfirm.message")}
              </p>
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setShowDeleteConfirm(null)}>
                  {t("spvInvestment.admin.common.cancel")}
                </Button>
                <Button
                  onClick={() => handleDeleteAdmin(showDeleteConfirm)}
                  className="bg-red-600 hover:bg-red-700"
                >
                  {t("spvInvestment.admin.common.delete")}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Reset Password Confirmation Modal */}
        {showResetPassword && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="w-full max-w-sm rounded-lg bg-white p-6 shadow-xl">
              <h2 className="mb-2 text-lg font-semibold text-slate-900">
                {t("spvInvestment.admin.settings.admins.resetPassword.title")}
              </h2>
              <p className="mb-6 text-sm text-slate-600">
                {t("spvInvestment.admin.settings.admins.resetPassword.message")}
              </p>
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setShowResetPassword(null)}>
                  {t("spvInvestment.admin.common.cancel")}
                </Button>
                <Button
                  onClick={() => handleResetPassword(showResetPassword)}
                  className="bg-indigo-600 hover:bg-indigo-700"
                >
                  {t("spvInvestment.admin.common.confirm")}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* New Access Code Modal */}
        {newAccessCode && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="w-full max-w-sm rounded-lg bg-white p-6 shadow-xl">
              <h2 className="mb-2 text-lg font-semibold text-slate-900">
                Access Code Generated
              </h2>
              <p className="mb-4 text-sm text-slate-600">
                Please save this access code - it will only be shown once.
              </p>
              <div className="mb-4 flex items-center gap-2 rounded-lg bg-slate-100 p-3">
                <code className="flex-1 font-mono text-lg font-semibold text-slate-900">
                  {newAccessCode}
                </code>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyAccessCode(newAccessCode)}
                >
                  {codeCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
              {codeCopied && (
                <p className="mb-4 text-sm text-green-600">
                  Copied to clipboard!
                </p>
              )}
              <div className="flex justify-end">
                <Button onClick={() => setNewAccessCode(null)} className="bg-indigo-600 hover:bg-indigo-700">
                  {t("spvInvestment.admin.common.close")}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
