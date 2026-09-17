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
      <div className="min-h-screen bg-brand-off flex items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-brand-gold/30 border-t-brand-gold" />
          <p className="mt-4 text-sm text-brand-grayMed">{t("common.loading")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-off py-8">
      <div className="container mx-auto max-w-6xl px-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-brand-dark md:text-3xl tracking-tight">
            {t("spvInvestment.admin.settings.title")}
          </h1>
          <p className="mt-1 text-brand-grayMed">
            {t("spvInvestment.admin.profile.settingsSubtitle")}
          </p>
        </div>

        {/* Tabs */}
        <div className="mb-6 flex flex-wrap gap-2 border-b border-brand-grayLight/40">
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
                    ? "border-brand-gold text-brand-gold font-semibold"
                    : "border-transparent text-brand-grayMed hover:text-brand-dark hover:border-brand-grayLight/60"
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
            <Card className="border border-brand-grayLight/40 bg-white shadow-sm rounded-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-brand-dark">
                  <User className="h-5 w-5 text-brand-gold" />
                  {t("spvInvestment.admin.settings.profile.title")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-gold/15 text-brand-gold">
                    <User className="h-8 w-8" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-brand-dark">{currentAdmin.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      {currentAdmin.role === "primary" && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-brand-gold/10 px-2 py-0.5 text-xs font-medium text-brand-gold border border-brand-gold/20">
                          <Key className="h-3 w-3" />
                          {t("spvInvestment.admin.profile.primaryAdmin")}
                        </span>
                      )}
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700 border border-emerald-200">
                        {currentAdmin.status === "active" ? "Active" : "Inactive"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 pt-4 border-t border-brand-grayLight/30">
                  <div className="flex items-center gap-3 text-sm">
                    <Mail className="h-4 w-4 text-brand-grayMed" />
                    <span className="text-brand-dark">{currentAdmin.email}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Clock className="h-4 w-4 text-brand-grayMed" />
                    <span className="text-brand-grayMed">
                      {t("spvInvestment.admin.settings.profile.lastLogin")}: {formatDate(currentAdmin.last_login)}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Calendar className="h-4 w-4 text-brand-grayMed" />
                    <span className="text-brand-grayMed">
                      {t("spvInvestment.admin.settings.profile.memberSince")}: {formatDate(currentAdmin.created_at)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-brand-grayLight/40 bg-white shadow-sm rounded-xl">
              <CardHeader>
                <CardTitle className="text-brand-dark">{t("spvInvestment.admin.settings.profile.updateProfile")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-brand-dark font-medium">{t("spvInvestment.admin.settings.profile.name")}</Label>
                  <Input defaultValue={currentAdmin.name} className="border-brand-grayLight/60 focus:border-brand-gold" />
                </div>
                <div className="space-y-2">
                  <Label className="text-brand-dark font-medium">{t("spvInvestment.admin.settings.profile.email")}</Label>
                  <Input defaultValue={currentAdmin.email} type="email" className="border-brand-grayLight/60 focus:border-brand-gold" />
                </div>
                <Button className="w-full bg-brand-gold hover:bg-brand-goldDark text-white font-medium shadow-sm">
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
              <h2 className="text-lg font-bold text-brand-dark">
                {t("spvInvestment.admin.settings.admins.title")}
              </h2>
              <Button onClick={() => handleOpenAdminModal()} className="bg-brand-gold hover:bg-brand-goldDark text-white font-medium shadow-sm">
                <Plus className="mr-2 h-4 w-4" />
                {t("spvInvestment.admin.settings.admins.addAdmin")}
              </Button>
            </div>

            <Card className="border border-brand-grayLight/40 bg-white shadow-sm rounded-xl overflow-hidden">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="border-b border-brand-grayLight/40 bg-brand-off/60">
                      <tr>
                        <th className="px-4 py-3.5 text-left text-xs font-semibold text-brand-grayMed uppercase tracking-wide">
                          {t("spvInvestment.admin.settings.admins.columns.name")}
                        </th>
                        <th className="px-4 py-3.5 text-left text-xs font-semibold text-brand-grayMed uppercase tracking-wide">
                          {t("spvInvestment.admin.settings.admins.columns.email")}
                        </th>
                        <th className="px-4 py-3.5 text-left text-xs font-semibold text-brand-grayMed uppercase tracking-wide">
                          {t("spvInvestment.admin.settings.admins.columns.role")}
                        </th>
                        <th className="px-4 py-3.5 text-left text-xs font-semibold text-brand-grayMed uppercase tracking-wide">
                          {t("spvInvestment.admin.settings.admins.columns.status")}
                        </th>
                        <th className="px-4 py-3.5 text-left text-xs font-semibold text-brand-grayMed uppercase tracking-wide">
                          {t("spvInvestment.admin.settings.admins.columns.lastLogin")}
                        </th>
                        <th className="px-4 py-3.5 text-right text-xs font-semibold text-brand-grayMed uppercase tracking-wide">
                          {t("spvInvestment.admin.settings.admins.columns.actions")}
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-brand-grayLight/30">
                      {admins.map((admin) => (
                        <tr key={admin.id} className="hover:bg-brand-off/40 transition-colors">
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-gold/15 text-brand-gold">
                                {admin.role === "primary" ? (
                                  <Shield className="h-5 w-5" />
                                ) : (
                                  <User className="h-5 w-5" />
                                )}
                              </div>
                              <div>
                                <p className="font-medium text-brand-dark">{admin.name}</p>
                                {admin.id === currentAdmin?.id && (
                                  <span className="text-xs text-brand-grayMed">(You)</span>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-4 text-sm text-brand-grayMed">{admin.email}</td>
                          <td className="px-4 py-4">
                            {admin.role === "primary" ? (
                              <span className="inline-flex items-center gap-1 rounded-full bg-brand-gold/10 px-2.5 py-0.5 text-xs font-medium text-brand-gold border border-brand-gold/20">
                                <Key className="h-3 w-3" />
                                {t("spvInvestment.admin.settings.admins.form.roles.primary")}
                              </span>
                            ) : (
                              <span className="inline-flex items-center rounded-full bg-brand-off px-2.5 py-0.5 text-xs font-medium text-brand-grayMed border border-brand-grayLight/40">
                                {t("spvInvestment.admin.settings.admins.form.roles.admin")}
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-4">
                            <span
                              className={cn(
                                "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
                                admin.status === "active"
                                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                  : "bg-red-50 text-red-700 border border-red-200"
                              )}
                            >
                              {admin.status === "active"
                                ? t("spvInvestment.admin.settings.admins.form.statuses.active")
                                : t("spvInvestment.admin.settings.admins.form.statuses.inactive")}
                            </span>
                          </td>
                          <td className="px-4 py-4 text-sm text-brand-grayMed">
                            {formatDate(admin.last_login)}
                          </td>
                          <td className="px-4 py-4 text-right">
                            {admin.role !== "primary" && (
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() => setShowResetPassword(admin.id)}
                                  className="rounded-lg p-2 text-brand-grayMed hover:bg-brand-off hover:text-brand-gold transition-colors"
                                  title={t("spvInvestment.admin.settings.admins.resetPassword.title")}
                                >
                                  <RefreshCw className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => handleOpenAdminModal(admin)}
                                  className="rounded-lg p-2 text-brand-grayMed hover:bg-brand-off hover:text-brand-gold transition-colors"
                                >
                                  <Pencil className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => setShowDeleteConfirm(admin.id)}
                                  className="rounded-lg p-2 text-brand-grayMed hover:bg-red-50 hover:text-red-600 transition-colors"
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
              <h2 className="text-lg font-bold text-brand-dark">
                {t("spvInvestment.admin.settings.activity.title")}
              </h2>
              {currentAdmin?.role === "primary" && (
                <select
                  value={activityFilter}
                  onChange={(e) => setActivityFilter(e.target.value)}
                  className="rounded-lg border border-brand-grayLight/60 bg-white px-3 py-2 text-sm text-brand-dark focus:border-brand-gold"
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

            <Card className="border border-brand-grayLight/40 bg-white shadow-sm rounded-xl overflow-hidden">
              <CardContent className="p-0">
                {filteredLogs.length === 0 ? (
                  <div className="p-8 text-center text-brand-grayMed">
                    {t("spvInvestment.admin.settings.activity.noActivity")}
                  </div>
                ) : (
                  <div className="divide-y divide-brand-grayLight/30">
                    {filteredLogs.map((log) => (
                      <div key={log.id} className="flex items-start gap-4 p-4 hover:bg-brand-off/30 transition-colors">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-gold/15 text-brand-gold">
                          <Activity className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-brand-dark">{log.description}</p>
                          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-brand-grayMed">
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
                            "rounded-full px-2.5 py-0.5 text-xs font-medium",
                            log.log_type.includes("delete")
                              ? "bg-red-50 text-red-700 border border-red-200"
                              : log.log_type.includes("create")
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : log.log_type.includes("login")
                              ? "bg-brand-gold/10 text-brand-gold border border-brand-gold/20"
                              : "bg-brand-off text-brand-grayMed border border-brand-grayLight/40"
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
            <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-brand-grayLight/40">
              <h2 className="mb-4 text-lg font-bold text-brand-dark">
                {editingAdmin
                  ? t("spvInvestment.admin.settings.admins.editAdmin")
                  : t("spvInvestment.admin.settings.admins.addAdmin")}
              </h2>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-brand-dark font-medium">{t("spvInvestment.admin.settings.admins.form.name")}</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder={t("spvInvestment.admin.settings.admins.form.namePlaceholder")}
                    className="border-brand-grayLight/60 focus:border-brand-gold"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-brand-dark font-medium">{t("spvInvestment.admin.settings.admins.form.email")}</Label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder={t("spvInvestment.admin.settings.admins.form.emailPlaceholder")}
                    className="border-brand-grayLight/60 focus:border-brand-gold"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-brand-dark font-medium">Phone</Label>
                  <Input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+352 123 456 789"
                    className="border-brand-grayLight/60 focus:border-brand-gold"
                  />
                </div>
                {editingAdmin && (
                  <div className="space-y-2">
                    <Label className="text-brand-dark font-medium">{t("spvInvestment.admin.settings.admins.form.status")}</Label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as "active" | "inactive" })}
                      className="w-full rounded-lg border border-brand-grayLight/60 bg-white px-3 py-2 text-sm text-brand-dark focus:border-brand-gold"
                    >
                      <option value="active">{t("spvInvestment.admin.settings.admins.form.statuses.active")}</option>
                      <option value="inactive">{t("spvInvestment.admin.settings.admins.form.statuses.inactive")}</option>
                    </select>
                  </div>
                )}
                {!editingAdmin && (
                  <p className="text-sm text-brand-grayMed">
                    An access code will be automatically generated for the new admin.
                  </p>
                )}
              </div>
              <div className="mt-6 flex justify-end gap-3">
                <Button variant="outline" onClick={() => setShowAdminModal(false)} className="border-brand-grayLight/50 text-brand-dark hover:bg-brand-off">
                  {t("spvInvestment.admin.common.cancel")}
                </Button>
                <Button
                  onClick={handleSaveAdmin}
                  disabled={isSaving || !formData.name || !formData.email}
                  className="bg-brand-gold hover:bg-brand-goldDark text-white font-medium"
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
            <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl border border-brand-grayLight/40">
              <h2 className="mb-2 text-lg font-bold text-brand-dark">
                {t("spvInvestment.admin.settings.admins.deleteConfirm.title")}
              </h2>
              <p className="mb-6 text-sm text-brand-grayMed">
                {t("spvInvestment.admin.settings.admins.deleteConfirm.message")}
              </p>
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setShowDeleteConfirm(null)} className="border-brand-grayLight/50 text-brand-dark hover:bg-brand-off">
                  {t("spvInvestment.admin.common.cancel")}
                </Button>
                <Button
                  onClick={() => handleDeleteAdmin(showDeleteConfirm)}
                  className="bg-red-600 hover:bg-red-700 text-white font-medium"
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
            <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl border border-brand-grayLight/40">
              <h2 className="mb-2 text-lg font-bold text-brand-dark">
                {t("spvInvestment.admin.settings.admins.resetPassword.title")}
              </h2>
              <p className="mb-6 text-sm text-brand-grayMed">
                {t("spvInvestment.admin.settings.admins.resetPassword.message")}
              </p>
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setShowResetPassword(null)} className="border-brand-grayLight/50 text-brand-dark hover:bg-brand-off">
                  {t("spvInvestment.admin.common.cancel")}
                </Button>
                <Button
                  onClick={() => handleResetPassword(showResetPassword)}
                  className="bg-brand-gold hover:bg-brand-goldDark text-white font-medium"
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
            <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl border border-brand-grayLight/40">
              <h2 className="mb-2 text-lg font-bold text-brand-dark">
                Access Code Generated
              </h2>
              <p className="mb-4 text-sm text-brand-grayMed">
                Please save this access code - it will only be shown once.
              </p>
              <div className="mb-4 flex items-center gap-2 rounded-lg bg-brand-off p-3 border border-brand-grayLight/40">
                <code className="flex-1 font-mono text-lg font-semibold text-brand-dark">
                  {newAccessCode}
                </code>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyAccessCode(newAccessCode)}
                  className="border-brand-grayLight/50"
                >
                  {codeCopied ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
              {codeCopied && (
                <p className="mb-4 text-sm text-emerald-600 font-medium">
                  Copied to clipboard!
                </p>
              )}
              <div className="flex justify-end">
                <Button onClick={() => setNewAccessCode(null)} className="bg-brand-gold hover:bg-brand-goldDark text-white font-medium">
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
