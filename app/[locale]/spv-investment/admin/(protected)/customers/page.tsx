"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  Search, Plus, Edit2, Trash2, Copy, Check, X,
  RefreshCw, User, Mail, Phone, Calendar
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import {
  getCustomers,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  generateAccessCode,
  type Customer,
} from "@/lib/spv-data";

type FormData = {
  name: string;
  email: string;
  phone: string;
  investorType: "institutional" | "professional" | "private";
  profile: "existing" | "new";
  status: "active" | "inactive";
  accessCode: string;
};

const defaultFormData: FormData = {
  name: "",
  email: "",
  phone: "",
  investorType: "private",
  profile: "new",
  status: "active",
  accessCode: "",
};

export default function CustomersPage() {
  const t = useTranslations();
  const searchParams = useSearchParams();

  const [customers, setCustomers] = React.useState<Customer[]>([]);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<"all" | "active" | "inactive">("all");
  const [showModal, setShowModal] = React.useState(false);
  const [editingCustomer, setEditingCustomer] = React.useState<Customer | null>(null);
  const [formData, setFormData] = React.useState<FormData>(defaultFormData);
  const [copiedCode, setCopiedCode] = React.useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = React.useState<string | null>(null);

  // Load customers
  React.useEffect(() => {
    setCustomers(getCustomers());
  }, []);

  // Check for ?action=new in URL
  React.useEffect(() => {
    if (searchParams.get("action") === "new") {
      handleOpenNew();
    }
  }, [searchParams]);

  const filtered = customers.filter((c) => {
    const matchesSearch =
      searchTerm === "" ||
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.accessCode.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleOpenNew = () => {
    setEditingCustomer(null);
    setFormData({ ...defaultFormData, accessCode: generateAccessCode() });
    setShowModal(true);
  };

  const handleOpenEdit = (customer: Customer) => {
    setEditingCustomer(customer);
    setFormData({
      name: customer.name,
      email: customer.email,
      phone: customer.phone || "",
      investorType: customer.investorType,
      profile: customer.profile,
      status: customer.status,
      accessCode: customer.accessCode,
    });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingCustomer(null);
    setFormData(defaultFormData);
  };

  const handleRegenerateCode = () => {
    setFormData({ ...formData, accessCode: generateAccessCode() });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingCustomer) {
      // Update existing
      updateCustomer(editingCustomer.id, formData);
    } else {
      // Create new
      createCustomer(formData);
    }

    setCustomers(getCustomers());
    handleCloseModal();
  };

  const handleDelete = (id: string) => {
    deleteCustomer(id);
    setCustomers(getCustomers());
    setDeleteConfirm(null);
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-100">
      {/* Page Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="container mx-auto max-w-7xl px-6 py-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 md:text-3xl">
                {t("spvInvestment.admin.customers.title")}
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                {t("spvInvestment.admin.customers.subtitle")}
              </p>
            </div>
            <Button onClick={handleOpenNew} className="bg-indigo-600 hover:bg-indigo-700">
              <Plus className="mr-2 h-4 w-4" />
              {t("spvInvestment.admin.customers.addCustomer")}
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto max-w-7xl px-6 py-8">
        {/* Filters */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              type="text"
              placeholder={t("spvInvestment.admin.customers.searchPlaceholder")}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            {(["all", "active", "inactive"] as const).map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={cn(
                  "rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
                  statusFilter === status
                    ? "bg-indigo-600 text-white"
                    : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
                )}
              >
                {t(`spvInvestment.admin.customers.filter.${status}`)}
              </button>
            ))}
          </div>
        </div>

        {/* Customers Table */}
        <Card className="border-none shadow-sm overflow-hidden">
          {/* Desktop Header */}
          <div className="hidden lg:grid lg:grid-cols-12 gap-4 px-6 py-3 bg-slate-50 text-xs font-semibold text-slate-500 uppercase tracking-wide border-b border-slate-200">
            <div className="col-span-3">{t("spvInvestment.admin.customers.columns.name")}</div>
            <div className="col-span-2">{t("spvInvestment.admin.customers.columns.accessCode")}</div>
            <div className="col-span-2">{t("spvInvestment.admin.customers.columns.type")}</div>
            <div className="col-span-2">{t("spvInvestment.admin.customers.columns.lastAccess")}</div>
            <div className="col-span-1">{t("spvInvestment.admin.customers.columns.status")}</div>
            <div className="col-span-2 text-right">{t("spvInvestment.admin.customers.columns.actions")}</div>
          </div>

          <CardContent className="p-0">
            {filtered.length === 0 ? (
              <div className="py-12 text-center">
                <User className="mx-auto h-12 w-12 text-slate-300" />
                <p className="mt-4 text-slate-500">{t("spvInvestment.admin.customers.noCustomers")}</p>
              </div>
            ) : (
              filtered.map((customer) => (
                <div
                  key={customer.id}
                  className="grid grid-cols-1 lg:grid-cols-12 gap-2 lg:gap-4 items-center px-6 py-4 border-b border-slate-100 last:border-0 hover:bg-slate-50/50 transition-colors"
                >
                  {/* Name + Email */}
                  <div className="lg:col-span-3">
                    <p className="font-medium text-slate-900">{customer.name}</p>
                    <p className="text-sm text-slate-500">{customer.email}</p>
                  </div>

                  {/* Access Code */}
                  <div className="lg:col-span-2">
                    <div className="flex items-center gap-2">
                      <code className="text-xs font-mono bg-slate-100 px-2 py-1 rounded">
                        {customer.accessCode}
                      </code>
                      <button
                        onClick={() => handleCopyCode(customer.accessCode)}
                        className="text-slate-400 hover:text-indigo-600 transition-colors"
                      >
                        {copiedCode === customer.accessCode ? (
                          <Check className="h-4 w-4 text-green-500" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Type */}
                  <div className="lg:col-span-2">
                    <span className="text-sm text-slate-600 capitalize">{customer.investorType}</span>
                    <span className="text-slate-300 mx-2">•</span>
                    <span className="text-sm text-slate-500 capitalize">{customer.profile}</span>
                  </div>

                  {/* Last Access */}
                  <div className="lg:col-span-2">
                    <p className="text-sm text-slate-500">{formatDate(customer.lastAccess)}</p>
                  </div>

                  {/* Status */}
                  <div className="lg:col-span-1">
                    <span
                      className={cn(
                        "inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium",
                        customer.status === "active"
                          ? "bg-green-100 text-green-800"
                          : "bg-slate-100 text-slate-600"
                      )}
                    >
                      {customer.status}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="lg:col-span-2 flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleOpenEdit(customer)}
                      className="text-slate-500 hover:text-indigo-600"
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    {deleteConfirm === customer.id ? (
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(customer.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeleteConfirm(null)}
                          className="text-slate-500"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeleteConfirm(customer.id)}
                        className="text-slate-500 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <Card className="w-full max-w-lg border-none shadow-2xl">
            <CardHeader className="border-b border-slate-200">
              <div className="flex items-center justify-between">
                <CardTitle>
                  {editingCustomer
                    ? t("spvInvestment.admin.customers.editCustomer")
                    : t("spvInvestment.admin.customers.addCustomer")}
                </CardTitle>
                <button onClick={handleCloseModal} className="text-slate-400 hover:text-slate-600">
                  <X className="h-5 w-5" />
                </button>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Name */}
                <div className="space-y-2">
                  <Label htmlFor="name">{t("spvInvestment.admin.customers.form.name")} *</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email">{t("spvInvestment.admin.customers.form.email")} *</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                {/* Phone */}
                <div className="space-y-2">
                  <Label htmlFor="phone">{t("spvInvestment.admin.customers.form.phone")}</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="pl-10"
                    />
                  </div>
                </div>

                {/* Type + Profile */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="investorType">{t("spvInvestment.admin.customers.form.investorType")}</Label>
                    <select
                      id="investorType"
                      value={formData.investorType}
                      onChange={(e) => setFormData({ ...formData, investorType: e.target.value as FormData["investorType"] })}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    >
                      <option value="institutional">Institutional</option>
                      <option value="professional">Professional</option>
                      <option value="private">Private</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="profile">{t("spvInvestment.admin.customers.form.profile")}</Label>
                    <select
                      id="profile"
                      value={formData.profile}
                      onChange={(e) => setFormData({ ...formData, profile: e.target.value as FormData["profile"] })}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    >
                      <option value="new">New Investor</option>
                      <option value="existing">Existing Investor</option>
                    </select>
                  </div>
                </div>

                {/* Status */}
                <div className="space-y-2">
                  <Label htmlFor="status">{t("spvInvestment.admin.customers.form.status")}</Label>
                  <select
                    id="status"
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as FormData["status"] })}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>

                {/* Access Code */}
                <div className="space-y-2">
                  <Label htmlFor="accessCode">{t("spvInvestment.admin.customers.form.accessCode")}</Label>
                  <div className="flex gap-2">
                    <Input
                      id="accessCode"
                      value={formData.accessCode}
                      onChange={(e) => setFormData({ ...formData, accessCode: e.target.value })}
                      className="font-mono"
                      required
                    />
                    <Button type="button" variant="outline" onClick={handleRegenerateCode}>
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
                  <Button type="button" variant="outline" onClick={handleCloseModal}>
                    {t("spvInvestment.admin.common.cancel")}
                  </Button>
                  <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700">
                    {editingCustomer
                      ? t("spvInvestment.admin.common.save")
                      : t("spvInvestment.admin.common.create")}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
