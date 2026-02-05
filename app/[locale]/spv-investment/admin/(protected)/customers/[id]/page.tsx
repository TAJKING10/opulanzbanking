"use client";

import * as React from "react";
import { useRouter, useParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import {
  ArrowLeft, Save, Trash2, Plus, X, FileText, Upload,
  User, Mail, Phone, Key, RefreshCw, Check, Edit2
} from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  getCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  generateAccessCode,
  addCustomerDocument,
  updateCustomerDocument,
  deleteCustomerDocument,
  formatFileSize,
  type Customer,
  type Document,
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

const documentTypes = [
  { value: "id", label: "ID Document" },
  { value: "contract", label: "Contract" },
  { value: "kyc", label: "KYC Document" },
  { value: "legal", label: "Legal Document" },
  { value: "financial", label: "Financial Document" },
  { value: "other", label: "Other" },
];

export default function CustomerEditPage() {
  const router = useRouter();
  const params = useParams();
  const locale = useLocale();
  const t = useTranslations();

  const id = params.id as string;
  const isNew = id === "new";

  const [formData, setFormData] = React.useState<FormData>({
    ...defaultFormData,
    accessCode: generateAccessCode(),
  });
  const [documents, setDocuments] = React.useState<Document[]>([]);
  const [deleteConfirm, setDeleteConfirm] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);

  // Document form state
  const [showDocForm, setShowDocForm] = React.useState(false);
  const [editingDoc, setEditingDoc] = React.useState<Document | null>(null);
  const [docForm, setDocForm] = React.useState({
    name: "",
    type: "other" as Document["type"],
    fileName: "",
    fileSize: "",
    url: "",
  });
  const [deleteDocConfirm, setDeleteDocConfirm] = React.useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Load existing customer
  React.useEffect(() => {
    if (!isNew) {
      const customer = getCustomerById(id);
      if (customer) {
        setFormData({
          name: customer.name,
          email: customer.email,
          phone: customer.phone || "",
          investorType: customer.investorType,
          profile: customer.profile,
          status: customer.status,
          accessCode: customer.accessCode,
        });
        setDocuments(customer.documents || []);
      }
    }
  }, [id, isNew]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    await new Promise((resolve) => setTimeout(resolve, 500));

    if (isNew) {
      createCustomer(formData);
    } else {
      updateCustomer(id, formData);
    }

    router.push(`/${locale}/spv-investment/admin/customers`);
  };

  const handleDelete = () => {
    deleteCustomer(id);
    router.push(`/${locale}/spv-investment/admin/customers`);
  };

  const handleRegenerateCode = () => {
    setFormData({ ...formData, accessCode: generateAccessCode() });
  };

  // Document handlers
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setDocForm({
        ...docForm,
        fileName: file.name,
        fileSize: formatFileSize(file.size),
        name: docForm.name || file.name.replace(/\.[^/.]+$/, ""),
      });
    }
  };

  const handleAddDocument = () => {
    if (!docForm.name || !docForm.fileName) return;

    if (editingDoc) {
      updateCustomerDocument(id, editingDoc.id, {
        name: docForm.name,
        type: docForm.type,
        fileName: docForm.fileName,
        fileSize: docForm.fileSize,
        url: docForm.url,
      });
    } else {
      addCustomerDocument(id, {
        name: docForm.name,
        type: docForm.type,
        fileName: docForm.fileName,
        fileSize: docForm.fileSize,
        url: docForm.url,
      });
    }

    // Refresh documents
    const customer = getCustomerById(id);
    if (customer) {
      setDocuments(customer.documents || []);
    }

    resetDocForm();
  };

  const handleEditDocument = (doc: Document) => {
    setEditingDoc(doc);
    setDocForm({
      name: doc.name,
      type: doc.type,
      fileName: doc.fileName,
      fileSize: doc.fileSize,
      url: doc.url || "",
    });
    setShowDocForm(true);
  };

  const handleDeleteDocument = (docId: string) => {
    deleteCustomerDocument(id, docId);
    const customer = getCustomerById(id);
    if (customer) {
      setDocuments(customer.documents || []);
    }
    setDeleteDocConfirm(null);
  };

  const resetDocForm = () => {
    setShowDocForm(false);
    setEditingDoc(null);
    setDocForm({
      name: "",
      type: "other",
      fileName: "",
      fileSize: "",
      url: "",
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const formatDate = (dateStr: string) => {
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
        <div className="container mx-auto max-w-5xl px-6 py-6">
          <Link
            href={`/${locale}/spv-investment/admin/customers`}
            className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-700 mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t("spvInvestment.admin.common.backToList")}
          </Link>
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-slate-900">
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
          {/* Customer Information */}
          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-indigo-600" />
                {t("spvInvestment.admin.customers.form.title")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                      placeholder={t("spvInvestment.admin.customers.form.namePlaceholder")}
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
                      placeholder={t("spvInvestment.admin.customers.form.emailPlaceholder")}
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
                      placeholder={t("spvInvestment.admin.customers.form.phonePlaceholder")}
                    />
                  </div>
                </div>

                {/* Investor Type */}
                <div className="space-y-2">
                  <Label htmlFor="investorType">{t("spvInvestment.admin.customers.form.investorType")}</Label>
                  <select
                    id="investorType"
                    value={formData.investorType}
                    onChange={(e) => setFormData({ ...formData, investorType: e.target.value as FormData["investorType"] })}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="institutional">{t("spvInvestment.admin.customers.form.investorTypes.institutional")}</option>
                    <option value="professional">{t("spvInvestment.admin.customers.form.investorTypes.professional")}</option>
                    <option value="private">{t("spvInvestment.admin.customers.form.investorTypes.private")}</option>
                  </select>
                </div>

                {/* Profile */}
                <div className="space-y-2">
                  <Label htmlFor="profile">{t("spvInvestment.admin.customers.form.profile")}</Label>
                  <select
                    id="profile"
                    value={formData.profile}
                    onChange={(e) => setFormData({ ...formData, profile: e.target.value as FormData["profile"] })}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="new">{t("spvInvestment.admin.customers.form.profiles.new")}</option>
                    <option value="existing">{t("spvInvestment.admin.customers.form.profiles.existing")}</option>
                  </select>
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
                    <option value="active">{t("spvInvestment.admin.customers.form.statuses.active")}</option>
                    <option value="inactive">{t("spvInvestment.admin.customers.form.statuses.inactive")}</option>
                  </select>
                </div>

                {/* Access Code */}
                <div className="md:col-span-2 space-y-2">
                  <Label htmlFor="accessCode">{t("spvInvestment.admin.customers.form.accessCode")}</Label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Key className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <Input
                        id="accessCode"
                        value={formData.accessCode}
                        onChange={(e) => setFormData({ ...formData, accessCode: e.target.value })}
                        className="pl-10 font-mono"
                        required
                      />
                    </div>
                    <Button type="button" variant="outline" onClick={handleRegenerateCode}>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      {t("spvInvestment.admin.customers.form.regenerateCode")}
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Documents Section - Only for existing customers */}
          {!isNew && (
            <Card className="border-none shadow-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-indigo-600" />
                    {t("spvInvestment.admin.documents.title")}
                  </CardTitle>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowDocForm(true)}
                    className="text-indigo-600 border-indigo-200 hover:bg-indigo-50"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    {t("spvInvestment.admin.documents.addDocument")}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {/* Document Form */}
                {showDocForm && (
                  <div className="mb-6 p-4 bg-slate-50 rounded-lg border border-slate-200">
                    <h4 className="font-medium text-slate-900 mb-4">
                      {editingDoc ? t("spvInvestment.admin.documents.editDocument") : t("spvInvestment.admin.documents.addDocument")}
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>{t("spvInvestment.admin.documents.documentName")} *</Label>
                        <Input
                          value={docForm.name}
                          onChange={(e) => setDocForm({ ...docForm, name: e.target.value })}
                          placeholder={t("spvInvestment.admin.documents.documentNamePlaceholder")}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>{t("spvInvestment.admin.documents.documentType")}</Label>
                        <select
                          value={docForm.type}
                          onChange={(e) => setDocForm({ ...docForm, type: e.target.value as Document["type"] })}
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        >
                          {documentTypes.map((type) => (
                            <option key={type.value} value={type.value}>
                              {type.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="md:col-span-2 space-y-2">
                        <Label>{t("spvInvestment.admin.documents.selectFile")}</Label>
                        <div className="flex gap-2">
                          <Input
                            ref={fileInputRef}
                            type="file"
                            onChange={handleFileSelect}
                            className="flex-1"
                            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                          />
                        </div>
                        {docForm.fileName && (
                          <p className="text-sm text-slate-500">
                            {t("spvInvestment.admin.documents.selectedFile")}: {docForm.fileName} ({docForm.fileSize})
                          </p>
                        )}
                      </div>
                      <div className="md:col-span-2 space-y-2">
                        <Label>{t("spvInvestment.admin.documents.documentUrl")}</Label>
                        <Input
                          value={docForm.url}
                          onChange={(e) => setDocForm({ ...docForm, url: e.target.value })}
                          placeholder="https://..."
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2 mt-4">
                      <Button type="button" variant="outline" onClick={resetDocForm}>
                        {t("spvInvestment.admin.common.cancel")}
                      </Button>
                      <Button
                        type="button"
                        onClick={handleAddDocument}
                        disabled={!docForm.name || !docForm.fileName}
                        className="bg-indigo-600 hover:bg-indigo-700"
                      >
                        {editingDoc ? t("spvInvestment.admin.common.save") : t("spvInvestment.admin.documents.addDocument")}
                      </Button>
                    </div>
                  </div>
                )}

                {/* Documents List */}
                {documents.length === 0 ? (
                  <div className="text-center py-8 text-slate-500">
                    <FileText className="mx-auto h-12 w-12 text-slate-300 mb-3" />
                    <p>{t("spvInvestment.admin.documents.noDocuments")}</p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {documents.map((doc) => (
                      <div
                        key={doc.id}
                        className="flex items-center justify-between py-3 hover:bg-slate-50 px-2 -mx-2 rounded"
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-indigo-50 rounded-lg">
                            <FileText className="h-5 w-5 text-indigo-600" />
                          </div>
                          <div>
                            <p className="font-medium text-slate-900">{doc.name}</p>
                            <p className="text-sm text-slate-500">
                              {documentTypes.find((t) => t.value === doc.type)?.label || doc.type} • {doc.fileSize} • {formatDate(doc.uploadedAt)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {deleteDocConfirm === doc.id ? (
                            <>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteDocument(doc.id)}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <Check className="h-4 w-4" />
                              </Button>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => setDeleteDocConfirm(null)}
                                className="text-slate-500"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </>
                          ) : (
                            <>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEditDocument(doc)}
                                className="text-slate-500 hover:text-indigo-600"
                              >
                                <Edit2 className="h-4 w-4" />
                              </Button>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => setDeleteDocConfirm(doc.id)}
                                className="text-slate-500 hover:text-red-600"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 pb-8">
            <Button type="button" variant="outline" asChild>
              <Link href={`/${locale}/spv-investment/admin/customers`}>
                {t("spvInvestment.admin.common.cancel")}
              </Link>
            </Button>
            <Button type="submit" disabled={isSaving} className="bg-indigo-600 hover:bg-indigo-700">
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
    </div>
  );
}
