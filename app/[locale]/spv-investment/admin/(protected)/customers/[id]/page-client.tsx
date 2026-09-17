"use client";

import * as React from "react";
import { useRouter, useParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import {
  ArrowLeft, Save, Trash2, User, Mail, Phone, Key, RefreshCw, Check, Building,
  Plus, DollarSign, TrendingUp, Calendar, X
} from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  getInvestorById,
  createInvestor,
  updateInvestor,
  deleteInvestor,
  resetInvestorAccessCode,
  getCurrentAdmin,
  getProperties,
  getInvestorInvestments,
  createInvestment,
  deleteInvestment,
  type Investor,
  type Property,
  type Investment,
} from "@/lib/investment-api";

type FormData = {
  name: string;
  email: string;
  phone: string;
  investor_type: "institutional" | "professional" | "private";
  profile_type: "existing" | "new";
  status: "active" | "inactive";
  company_name: string;
  notes: string;
};

const defaultFormData: FormData = {
  name: "",
  email: "",
  phone: "",
  investor_type: "private",
  profile_type: "new",
  status: "active",
  company_name: "",
  notes: "",
};

export default function CustomerEditPage() {
  const router = useRouter();
  const params = useParams();
  const locale = useLocale();
  const t = useTranslations();

  const id = params.id as string;
  const isNew = id === "new";

  const [formData, setFormData] = React.useState<FormData>(defaultFormData);
  const [accessCode, setAccessCode] = React.useState<string>("");
  const [deleteConfirm, setDeleteConfirm] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(!isNew);
  const [error, setError] = React.useState<string | null>(null);

  // Investment management state
  const [investments, setInvestments] = React.useState<Investment[]>([]);
  const [properties, setProperties] = React.useState<Property[]>([]);
  const [showInvestmentForm, setShowInvestmentForm] = React.useState(false);
  const [investmentForm, setInvestmentForm] = React.useState({
    property_id: "",
    amount_invested: "",
    ownership_percentage: "",
    expected_annual_return: "",
    investment_date: new Date().toISOString().split("T")[0],
    maturity_date: "",
  });
  const [isCreatingInvestment, setIsCreatingInvestment] = React.useState(false);
  const [deleteInvestmentId, setDeleteInvestmentId] = React.useState<number | null>(null);

  // Load existing investor and their investments
  React.useEffect(() => {
    const fetchData = async () => {
      if (!isNew) {
        try {
          // Fetch investor data
          const investor = await getInvestorById(parseInt(id));
          if (investor) {
            setFormData({
              name: investor.name,
              email: investor.email,
              phone: investor.phone || "",
              investor_type: investor.investor_type,
              profile_type: investor.profile_type,
              status: investor.status,
              company_name: investor.company_name || "",
              notes: investor.notes || "",
            });
            setAccessCode(investor.access_code);
          }

          // Fetch investor's investments
          const investorInvestments = await getInvestorInvestments(parseInt(id));
          setInvestments(investorInvestments.data);

          // Fetch available properties
          const propertiesResult = await getProperties({ status: "open" });
          setProperties(propertiesResult.data);
        } catch (err) {
          console.error("Error fetching data:", err);
          setError("Failed to load investor data");
        } finally {
          setIsLoading(false);
        }
      } else {
        // For new investors, still fetch properties for later use
        const propertiesResult = await getProperties({ status: "open" });
        setProperties(propertiesResult.data);
      }
    };
    fetchData();
  }, [id, isNew]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);

    try {
      const admin = getCurrentAdmin();

      if (isNew) {
        const result = await createInvestor({
          name: formData.name,
          email: formData.email,
          phone: formData.phone || undefined,
          investor_type: formData.investor_type,
          profile_type: formData.profile_type,
          company_name: formData.company_name || undefined,
          notes: formData.notes || undefined,
          createdBy: admin?.id,
        });

        if (result.success) {
          // Show the access code to the user
          if (result.accessCode) {
            alert(`Investor created successfully!\n\nAccess Code: ${result.accessCode}\n\nPlease save this code - it will be needed for portal login.`);
          }
          router.push(`/${locale}/spv-investment/admin/customers`);
        } else {
          setError(result.error || "Failed to create investor");
          setIsSaving(false);
        }
      } else {
        const result = await updateInvestor(parseInt(id), {
          name: formData.name,
          email: formData.email,
          phone: formData.phone || undefined,
          investor_type: formData.investor_type,
          profile_type: formData.profile_type,
          status: formData.status,
          company_name: formData.company_name || undefined,
          notes: formData.notes || undefined,
          updatedBy: admin?.id,
        });

        if (result) {
          router.push(`/${locale}/spv-investment/admin/customers`);
        } else {
          setError("Failed to update investor");
          setIsSaving(false);
        }
      }
    } catch (err) {
      console.error("Error saving investor:", err);
      setError("An error occurred while saving");
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      const admin = getCurrentAdmin();
      const success = await deleteInvestor(parseInt(id), admin?.id);
      if (success) {
        router.push(`/${locale}/spv-investment/admin/customers`);
      } else {
        setError("Failed to delete investor");
      }
    } catch (err) {
      console.error("Error deleting investor:", err);
      setError("An error occurred while deleting");
    }
  };

  const handleResetCode = async () => {
    try {
      const admin = getCurrentAdmin();
      const result = await resetInvestorAccessCode(parseInt(id), admin?.id);
      if (result.success && result.accessCode) {
        setAccessCode(result.accessCode);
        alert(`Access code reset successfully!\n\nNew Access Code: ${result.accessCode}`);
      } else {
        setError("Failed to reset access code");
      }
    } catch (err) {
      console.error("Error resetting access code:", err);
      setError("An error occurred while resetting access code");
    }
  };

  // Investment handlers
  const handleCreateInvestment = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreatingInvestment(true);
    setError(null);

    try {
      const admin = getCurrentAdmin();
      const result = await createInvestment({
        investor_id: parseInt(id),
        property_id: parseInt(investmentForm.property_id),
        amount_invested: parseFloat(investmentForm.amount_invested.replace(/[^0-9.]/g, "")),
        ownership_percentage: parseFloat(investmentForm.ownership_percentage),
        expected_annual_return: investmentForm.expected_annual_return ? parseFloat(investmentForm.expected_annual_return) : undefined,
        investment_date: investmentForm.investment_date || undefined,
        maturity_date: investmentForm.maturity_date || undefined,
        createdBy: admin?.id,
      });

      if (result.success) {
        // Refresh investments list
        const investorInvestments = await getInvestorInvestments(parseInt(id));
        setInvestments(investorInvestments.data);
        setShowInvestmentForm(false);
        setInvestmentForm({
          property_id: "",
          amount_invested: "",
          ownership_percentage: "",
          expected_annual_return: "",
          investment_date: new Date().toISOString().split("T")[0],
          maturity_date: "",
        });
      } else {
        setError(result.error || "Failed to create investment");
      }
    } catch (err) {
      console.error("Error creating investment:", err);
      setError("An error occurred while creating investment");
    } finally {
      setIsCreatingInvestment(false);
    }
  };

  const handleDeleteInvestment = async (investmentId: number) => {
    try {
      const admin = getCurrentAdmin();
      const success = await deleteInvestment(investmentId, admin?.id);
      if (success) {
        setInvestments(investments.filter((inv) => inv.id !== investmentId));
      } else {
        setError("Failed to delete investment");
      }
    } catch (err) {
      console.error("Error deleting investment:", err);
      setError("An error occurred while deleting investment");
    }
    setDeleteInvestmentId(null);
  };

  const formatCurrency = (value: number | undefined) => {
    if (!value) return "—";
    return new Intl.NumberFormat("en-EU", {
      style: "currency",
      currency: "EUR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  if (isLoading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-brand-off flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-gold/30 border-t-brand-gold" />
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-brand-off">
      {/* Page Header */}
      <div className="bg-white border-b border-brand-grayLight/40">
        <div className="container mx-auto max-w-5xl px-6 py-6">
          <Link
            href={`/${locale}/spv-investment/admin/customers`}
            className="inline-flex items-center text-sm font-medium text-brand-grayMed hover:text-brand-dark mb-4 transition-colors"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t("spvInvestment.admin.common.backToList")}
          </Link>
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-brand-dark">
              {isNew
                ? t("spvInvestment.admin.customers.form.createTitle")
                : t("spvInvestment.admin.customers.form.editTitle")}
            </h1>
            {!isNew && (
              deleteConfirm ? (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setDeleteConfirm(false)}
                    className="border-brand-grayLight/60 text-brand-dark hover:bg-brand-off"
                  >
                    {t("spvInvestment.admin.common.cancel")}
                  </Button>
                  <Button
                    onClick={handleDelete}
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    <Check className="mr-2 h-4 w-4" />
                    {t("spvInvestment.admin.common.confirm")}
                  </Button>
                </div>
              ) : (
                <Button
                  variant="outline"
                  onClick={() => setDeleteConfirm(true)}
                  className="text-red-600 border-red-200 hover:bg-red-50"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  {t("spvInvestment.admin.common.delete")}
                </Button>
              )
            )}
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="container mx-auto max-w-5xl px-6 py-8 space-y-6">
          {/* Error Message */}
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {error}
            </div>
          )}

          {/* Customer Information */}
          <Card className="border border-brand-grayLight/40 bg-white shadow-sm rounded-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-brand-dark">
                <User className="h-5 w-5 text-brand-gold" />
                {t("spvInvestment.admin.customers.form.title")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Name */}
                <div className="space-y-2">
                  <Label htmlFor="name">{t("spvInvestment.admin.customers.form.name")} *</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-grayMed" />
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="pl-10"
                      placeholder={t("spvInvestment.admin.customers.form.namePlaceholder")}
                      required
                    />
                  </div>
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email">{t("spvInvestment.admin.customers.form.email")} *</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-grayMed" />
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="pl-10"
                      placeholder={t("spvInvestment.admin.customers.form.emailPlaceholder")}
                      required
                    />
                  </div>
                </div>

                {/* Phone */}
                <div className="space-y-2">
                  <Label htmlFor="phone">{t("spvInvestment.admin.customers.form.phone")}</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-grayMed" />
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="pl-10"
                      placeholder={t("spvInvestment.admin.customers.form.phonePlaceholder")}
                    />
                  </div>
                </div>

                {/* Company Name */}
                <div className="space-y-2">
                  <Label htmlFor="company_name">Company Name</Label>
                  <div className="relative">
                    <Building className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-grayMed" />
                    <Input
                      id="company_name"
                      value={formData.company_name}
                      onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                      className="pl-10"
                      placeholder="Company name (if applicable)"
                    />
                  </div>
                </div>

                {/* Investor Type */}
                <div className="space-y-2">
                  <Label htmlFor="investor_type">{t("spvInvestment.admin.customers.form.investorType")}</Label>
                  <select
                    id="investor_type"
                    value={formData.investor_type}
                    onChange={(e) => setFormData({ ...formData, investor_type: e.target.value as FormData["investor_type"] })}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="institutional">{t("spvInvestment.admin.customers.form.investorTypes.institutional")}</option>
                    <option value="professional">{t("spvInvestment.admin.customers.form.investorTypes.professional")}</option>
                    <option value="private">{t("spvInvestment.admin.customers.form.investorTypes.private")}</option>
                  </select>
                </div>

                {/* Profile */}
                <div className="space-y-2">
                  <Label htmlFor="profile_type">{t("spvInvestment.admin.customers.form.profile")}</Label>
                  <select
                    id="profile_type"
                    value={formData.profile_type}
                    onChange={(e) => setFormData({ ...formData, profile_type: e.target.value as FormData["profile_type"] })}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="new">{t("spvInvestment.admin.customers.form.profiles.new")}</option>
                    <option value="existing">{t("spvInvestment.admin.customers.form.profiles.existing")}</option>
                  </select>
                </div>

                {/* Status */}
                {!isNew && (
                  <div className="space-y-2">
                    <Label htmlFor="status">{t("spvInvestment.admin.customers.form.status")}</Label>
                    <select
                      id="status"
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as FormData["status"] })}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    >
                      <option value="active">{t("spvInvestment.admin.customers.form.statuses.active")}</option>
                      <option value="inactive">{t("spvInvestment.admin.customers.form.statuses.inactive")}</option>
                    </select>
                  </div>
                )}

                {/* Notes */}
                <div className="md:col-span-2 space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    placeholder="Any additional notes about the investor..."
                  />
                </div>

                {/* Access Code - Only for existing investors */}
                {!isNew && (
                  <div className="md:col-span-2 space-y-2">
                    <Label>{t("spvInvestment.admin.customers.form.accessCode")}</Label>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Key className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-grayMed" />
                        <Input
                          value={accessCode}
                          className="pl-10 font-mono"
                          readOnly
                        />
                      </div>
                      <Button type="button" variant="outline" onClick={handleResetCode} className="border-brand-grayLight/60 hover:bg-brand-off">
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Reset Code
                      </Button>
                    </div>
                    <p className="text-xs text-brand-grayMed">
                      Resetting the code will generate a new access code and invalidate the old one.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-end gap-3 pb-8">
            <Button type="button" variant="outline" className="border-brand-grayLight/60 text-brand-dark hover:bg-brand-off" asChild>
              <Link href={`/${locale}/spv-investment/admin/customers`}>
                {t("spvInvestment.admin.common.cancel")}
              </Link>
            </Button>
            <Button type="submit" disabled={isSaving} className="bg-brand-gold hover:bg-brand-goldDark text-white font-medium">
              {isSaving ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  {t("spvInvestment.admin.common.saving")}
                </div>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  {isNew ? t("spvInvestment.admin.common.create") : t("spvInvestment.admin.common.save")}
                </>
              )}
            </Button>
          </div>
        </div>
      </form>

      {/* Investments Section - Only for existing investors */}
      {!isNew && (
        <div className="container mx-auto max-w-5xl px-6 pb-8">
          <Card className="border border-brand-grayLight/40 bg-white shadow-sm rounded-xl">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-brand-dark">
                <TrendingUp className="h-5 w-5 text-brand-gold" />
                Investments
              </CardTitle>
              <Button
                onClick={() => setShowInvestmentForm(!showInvestmentForm)}
                className="bg-brand-gold hover:bg-brand-goldDark text-white font-medium"
                size="sm"
              >
                <Plus className="mr-2 h-4 w-4" />
                Assign to Property
              </Button>
            </CardHeader>
            <CardContent>
              {/* Investment Creation Form */}
              {showInvestmentForm && (
                <form onSubmit={handleCreateInvestment} className="mb-6 p-4 bg-brand-off border border-brand-grayLight/30 rounded-lg space-y-4">
                  <h4 className="font-semibold text-brand-dark">Create New Investment</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2 space-y-2">
                      <Label>Property *</Label>
                      <select
                        value={investmentForm.property_id}
                        onChange={(e) => setInvestmentForm({ ...investmentForm, property_id: e.target.value })}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        required
                      >
                        <option value="">Select a property...</option>
                        {properties.map((property) => (
                          <option key={property.id} value={property.id}>
                            {property.title} - {property.location}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label>Amount Invested (EUR) *</Label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-grayMed" />
                        <Input
                          value={investmentForm.amount_invested}
                          onChange={(e) => setInvestmentForm({ ...investmentForm, amount_invested: e.target.value })}
                          className="pl-10"
                          placeholder="e.g. 100000"
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Ownership Percentage (%) *</Label>
                      <Input
                        value={investmentForm.ownership_percentage}
                        onChange={(e) => setInvestmentForm({ ...investmentForm, ownership_percentage: e.target.value })}
                        placeholder="e.g. 5"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Expected Annual Return (%)</Label>
                      <Input
                        value={investmentForm.expected_annual_return}
                        onChange={(e) => setInvestmentForm({ ...investmentForm, expected_annual_return: e.target.value })}
                        placeholder="e.g. 8"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Investment Date</Label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-grayMed" />
                        <Input
                          type="date"
                          value={investmentForm.investment_date}
                          onChange={(e) => setInvestmentForm({ ...investmentForm, investment_date: e.target.value })}
                          className="pl-10"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Maturity Date</Label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-grayMed" />
                        <Input
                          type="date"
                          value={investmentForm.maturity_date}
                          onChange={(e) => setInvestmentForm({ ...investmentForm, maturity_date: e.target.value })}
                          className="pl-10"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowInvestmentForm(false)}
                      className="border-brand-grayLight/60 hover:bg-white"
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isCreatingInvestment} className="bg-brand-gold hover:bg-brand-goldDark text-white font-medium">
                      {isCreatingInvestment ? (
                        <div className="flex items-center gap-2">
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                          Creating...
                        </div>
                      ) : (
                        "Create Investment"
                      )}
                    </Button>
                  </div>
                </form>
              )}

              {/* Investments List */}
              {investments.length === 0 ? (
                <div className="text-center py-8 text-brand-grayMed">
                  <TrendingUp className="mx-auto h-12 w-12 text-brand-grayLight mb-2" />
                  <p>No investments assigned yet</p>
                  <p className="text-sm">Click "Assign to Property" to create an investment</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {investments.map((investment) => (
                    <div
                      key={investment.id}
                      className="flex items-center justify-between p-4 bg-white border border-brand-grayLight/40 rounded-lg shadow-sm"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <Building className="h-4 w-4 text-brand-gold" />
                          <span className="font-medium text-brand-dark">
                            {investment.property_title || `Property #${investment.property_id}`}
                          </span>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            investment.status === 'active' ? 'bg-emerald-100 text-emerald-700' :
                            investment.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                            'bg-brand-off text-brand-grayMed border border-brand-grayLight/30'
                          }`}>
                            {investment.status}
                          </span>
                        </div>
                        <div className="mt-1 text-sm text-brand-grayMed grid grid-cols-2 md:grid-cols-4 gap-2">
                          <span>Amount: {formatCurrency(investment.amount_invested)}</span>
                          <span>Ownership: {investment.ownership_percentage}%</span>
                          <span>Return: {investment.expected_annual_return || "—"}%</span>
                          <span>Date: {investment.investment_date ? new Date(investment.investment_date).toLocaleDateString() : "—"}</span>
                        </div>
                      </div>
                      <div className="ml-4">
                        {deleteInvestmentId === investment.id ? (
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteInvestment(investment.id)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setDeleteInvestmentId(null)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDeleteInvestmentId(investment.id)}
                            className="text-brand-grayMed hover:text-red-600"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
