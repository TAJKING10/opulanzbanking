"use client";

import * as React from "react";
import { useRouter, useParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import {
  ArrowLeft, Save, Trash2, Plus, X, ImageIcon, MapPin,
  Building2, Calendar, DollarSign, Landmark, Check, FileText, Edit2
} from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  getOfferingById,
  createOffering,
  updateOffering,
  deleteOffering,
  addOfferingDocument,
  updateOfferingDocument,
  deleteOfferingDocument,
  formatFileSize,
  type Offering,
  type OfferingFinancials,
  type OfferingBankTransfer,
  type Document,
} from "@/lib/spv-data";

const documentTypes = [
  { value: "prospectus", label: "Prospectus" },
  { value: "legal", label: "Legal Document" },
  { value: "financial", label: "Financial Report" },
  { value: "contract", label: "Contract" },
  { value: "other", label: "Other" },
];

const defaultFinancials: OfferingFinancials = {
  totalValue: "",
  spvShares: "",
  minimumInvestment: "",
  targetReturn: "",
  investmentTerm: "",
  distributionFrequency: "",
};

const defaultBankTransfer: OfferingBankTransfer = {
  bankName: "Banque de Luxembourg",
  iban: "",
  bic: "BLLLLULL",
  reference: "",
};

export default function PropertyEditPage() {
  const router = useRouter();
  const params = useParams();
  const locale = useLocale();
  const t = useTranslations();

  const id = params.id as string;
  const isNew = id === "new";

  const [formData, setFormData] = React.useState({
    title: "",
    location: "",
    propertyType: "",
    size: "",
    yearBuilt: "",
    status: "open" as Offering["status"],
    description: "",
    features: [] as string[],
    images: [] as string[],
    financials: { ...defaultFinancials },
    bankTransfer: { ...defaultBankTransfer },
  });

  const [newFeature, setNewFeature] = React.useState("");
  const [newImage, setNewImage] = React.useState("");
  const [deleteConfirm, setDeleteConfirm] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);

  // Document state
  const [documents, setDocuments] = React.useState<Document[]>([]);
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

  // Load existing offering
  React.useEffect(() => {
    if (!isNew) {
      const offering = getOfferingById(id);
      if (offering) {
        setFormData({
          title: offering.title,
          location: offering.location,
          propertyType: offering.propertyType,
          size: offering.size,
          yearBuilt: offering.yearBuilt,
          status: offering.status,
          description: offering.description,
          features: [...offering.features],
          images: [...offering.images],
          financials: { ...offering.financials },
          bankTransfer: { ...offering.bankTransfer },
        });
        setDocuments(offering.documents || []);
      }
    }
  }, [id, isNew]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    await new Promise((resolve) => setTimeout(resolve, 500));

    if (isNew) {
      createOffering(formData);
    } else {
      updateOffering(id, formData);
    }

    router.push(`/${locale}/spv-investment/admin/properties`);
  };

  const handleDelete = () => {
    deleteOffering(id);
    router.push(`/${locale}/spv-investment/admin/properties`);
  };

  const addFeature = () => {
    if (newFeature.trim()) {
      setFormData({ ...formData, features: [...formData.features, newFeature.trim()] });
      setNewFeature("");
    }
  };

  const removeFeature = (index: number) => {
    setFormData({
      ...formData,
      features: formData.features.filter((_, i) => i !== index),
    });
  };

  const addImage = () => {
    if (newImage.trim()) {
      setFormData({ ...formData, images: [...formData.images, newImage.trim()] });
      setNewImage("");
    }
  };

  const removeImage = (index: number) => {
    setFormData({
      ...formData,
      images: formData.images.filter((_, i) => i !== index),
    });
  };

  const updateFinancials = (key: keyof OfferingFinancials, value: string) => {
    setFormData({
      ...formData,
      financials: { ...formData.financials, [key]: value },
    });
  };

  const updateBankTransfer = (key: keyof OfferingBankTransfer, value: string) => {
    setFormData({
      ...formData,
      bankTransfer: { ...formData.bankTransfer, [key]: value },
    });
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
      updateOfferingDocument(id, editingDoc.id, {
        name: docForm.name,
        type: docForm.type,
        fileName: docForm.fileName,
        fileSize: docForm.fileSize,
        url: docForm.url,
      });
    } else {
      addOfferingDocument(id, {
        name: docForm.name,
        type: docForm.type,
        fileName: docForm.fileName,
        fileSize: docForm.fileSize,
        url: docForm.url,
      });
    }

    // Refresh documents
    const offering = getOfferingById(id);
    if (offering) {
      setDocuments(offering.documents || []);
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
    deleteOfferingDocument(id, docId);
    const offering = getOfferingById(id);
    if (offering) {
      setDocuments(offering.documents || []);
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
            href={`/${locale}/spv-investment/admin/properties`}
            className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-700 mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t("spvInvestment.admin.properties.backToList")}
          </Link>
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-slate-900">
              {isNew
                ? t("spvInvestment.admin.properties.createProperty")
                : t("spvInvestment.admin.properties.editProperty")}
            </h1>
            {!isNew && (
              deleteConfirm ? (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setDeleteConfirm(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleDelete}
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    <Check className="mr-2 h-4 w-4" />
                    Confirm Delete
                  </Button>
                </div>
              ) : (
                <Button
                  variant="outline"
                  onClick={() => setDeleteConfirm(true)}
                  className="text-red-600 border-red-200 hover:bg-red-50"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </Button>
              )
            )}
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="container mx-auto max-w-5xl px-6 py-8 space-y-6">
          {/* Basic Information */}
          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-indigo-600" />
                {t("spvInvestment.admin.properties.form.basicInfo")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2 space-y-2">
                  <Label htmlFor="title">{t("spvInvestment.admin.properties.form.title")} *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. Luxembourg City Premium Residence"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">{t("spvInvestment.admin.properties.form.location")} *</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      className="pl-10"
                      placeholder="e.g. Luxembourg City, Luxembourg"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="propertyType">{t("spvInvestment.admin.properties.form.propertyType")} *</Label>
                  <Input
                    id="propertyType"
                    value={formData.propertyType}
                    onChange={(e) => setFormData({ ...formData, propertyType: e.target.value })}
                    placeholder="e.g. Residential — Luxury Apartments"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="size">{t("spvInvestment.admin.properties.form.size")}</Label>
                  <Input
                    id="size"
                    value={formData.size}
                    onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                    placeholder="e.g. 2,400 m²"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="yearBuilt">{t("spvInvestment.admin.properties.form.yearBuilt")}</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      id="yearBuilt"
                      value={formData.yearBuilt}
                      onChange={(e) => setFormData({ ...formData, yearBuilt: e.target.value })}
                      className="pl-10"
                      placeholder="e.g. 2022"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">{t("spvInvestment.admin.properties.form.status")}</Label>
                  <select
                    id="status"
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as Offering["status"] })}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="open">Open for Investment</option>
                    <option value="closing">Closing Soon</option>
                    <option value="closed">Fully Subscribed</option>
                    <option value="coming">Coming Soon</option>
                  </select>
                </div>
                <div className="md:col-span-2 space-y-2">
                  <Label htmlFor="description">{t("spvInvestment.admin.properties.form.description")}</Label>
                  <textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={4}
                    className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none"
                    placeholder="Describe the property and investment opportunity..."
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Features */}
          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle>{t("spvInvestment.admin.properties.form.features")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  value={newFeature}
                  onChange={(e) => setNewFeature(e.target.value)}
                  placeholder="Add a feature..."
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addFeature())}
                />
                <Button type="button" onClick={addFeature} variant="outline">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {formData.features.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.features.map((feature, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-sm"
                    >
                      {feature}
                      <button
                        type="button"
                        onClick={() => removeFeature(index)}
                        className="text-slate-400 hover:text-red-500"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Images */}
          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="h-5 w-5 text-indigo-600" />
                {t("spvInvestment.admin.properties.form.images")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  value={newImage}
                  onChange={(e) => setNewImage(e.target.value)}
                  placeholder="Add image URL..."
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addImage())}
                />
                <Button type="button" onClick={addImage} variant="outline">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {formData.images.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {formData.images.map((url, index) => (
                    <div key={index} className="relative aspect-[4/3] rounded-lg overflow-hidden bg-slate-100">
                      <img src={url} alt="" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-2 right-2 p-1 rounded-full bg-red-500 text-white hover:bg-red-600"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Financials */}
          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-indigo-600" />
                {t("spvInvestment.admin.properties.form.financials")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Total Value</Label>
                  <Input
                    value={formData.financials.totalValue}
                    onChange={(e) => updateFinancials("totalValue", e.target.value)}
                    placeholder="e.g. €3,200,000"
                  />
                </div>
                <div className="space-y-2">
                  <Label>SPV Shares</Label>
                  <Input
                    value={formData.financials.spvShares}
                    onChange={(e) => updateFinancials("spvShares", e.target.value)}
                    placeholder="e.g. 40 SPV shares"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Minimum Investment</Label>
                  <Input
                    value={formData.financials.minimumInvestment}
                    onChange={(e) => updateFinancials("minimumInvestment", e.target.value)}
                    placeholder="e.g. €50,000"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Target Return</Label>
                  <Input
                    value={formData.financials.targetReturn}
                    onChange={(e) => updateFinancials("targetReturn", e.target.value)}
                    placeholder="e.g. 7–9% p.a."
                  />
                </div>
                <div className="space-y-2">
                  <Label>Investment Term</Label>
                  <Input
                    value={formData.financials.investmentTerm}
                    onChange={(e) => updateFinancials("investmentTerm", e.target.value)}
                    placeholder="e.g. 5 years"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Distribution Frequency</Label>
                  <Input
                    value={formData.financials.distributionFrequency}
                    onChange={(e) => updateFinancials("distributionFrequency", e.target.value)}
                    placeholder="e.g. Quarterly"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Bank Transfer */}
          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Landmark className="h-5 w-5 text-indigo-600" />
                {t("spvInvestment.admin.properties.form.bankTransfer")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Bank Name</Label>
                  <Input
                    value={formData.bankTransfer.bankName}
                    onChange={(e) => updateBankTransfer("bankName", e.target.value)}
                    placeholder="e.g. Banque de Luxembourg"
                  />
                </div>
                <div className="space-y-2">
                  <Label>IBAN</Label>
                  <Input
                    value={formData.bankTransfer.iban}
                    onChange={(e) => updateBankTransfer("iban", e.target.value)}
                    placeholder="e.g. LU12 3456 7890 1234 5678"
                  />
                </div>
                <div className="space-y-2">
                  <Label>BIC/SWIFT</Label>
                  <Input
                    value={formData.bankTransfer.bic}
                    onChange={(e) => updateBankTransfer("bic", e.target.value)}
                    placeholder="e.g. BLLLLULL"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Payment Reference</Label>
                  <Input
                    value={formData.bankTransfer.reference}
                    onChange={(e) => updateBankTransfer("reference", e.target.value)}
                    placeholder="e.g. SPV-LUX-RES-01"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Documents Section - Only for existing properties */}
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
              <Link href={`/${locale}/spv-investment/admin/properties`}>
                {t("spvInvestment.admin.common.cancel")}
              </Link>
            </Button>
            <Button type="submit" disabled={isSaving} className="bg-indigo-600 hover:bg-indigo-700">
              {isSaving ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Saving...
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
