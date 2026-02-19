"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Users, Plus, X } from "lucide-react";

interface DirectorsUBOsStepProps {
  data: any;
  onUpdate: (data: any) => void;
  onNext: () => void;
}

interface Person {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  ownership?: string;
}

export function DirectorsUBOsStep({ data, onUpdate, onNext }: DirectorsUBOsStepProps) {
  const t = useTranslations("accountForms.business.directors");
  const tc = useTranslations("accountForms.common");

  const [directors, setDirectors] = React.useState<Person[]>(
    data.directors?.length > 0 ? data.directors : [{ id: "1", firstName: "", lastName: "", email: "" }]
  );
  const [ubos, setUbos] = React.useState<Person[]>(
    data.ubos?.length > 0
      ? data.ubos
      : [{ id: "1", firstName: "", lastName: "", email: "", ownership: "" }]
  );

  const addDirector = () => {
    setDirectors([...directors, { id: Date.now().toString(), firstName: "", lastName: "", email: "" }]);
  };

  const removeDirector = (id: string) => {
    if (directors.length > 1) {
      setDirectors(directors.filter((d) => d.id !== id));
    }
  };

  const updateDirector = (id: string, field: string, value: string) => {
    setDirectors(directors.map((d) => (d.id === id ? { ...d, [field]: value } : d)));
  };

  const addUBO = () => {
    setUbos([
      ...ubos,
      { id: Date.now().toString(), firstName: "", lastName: "", email: "", ownership: "" },
    ]);
  };

  const removeUBO = (id: string) => {
    if (ubos.length > 1) {
      setUbos(ubos.filter((u) => u.id !== id));
    }
  };

  const updateUBO = (id: string, field: string, value: string) => {
    setUbos(ubos.map((u) => (u.id === id ? { ...u, [field]: value } : u)));
  };

  const isDirectorsStepValid =
    directors.every((d) => d.firstName && d.lastName && d.email) &&
    ubos.every((u) => u.firstName && u.lastName && u.email && u.ownership);

  // Update parent with validation status
  React.useEffect(() => {
    onUpdate({ directors, ubos, isDirectorsStepValid });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDirectorsStepValid]);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="mb-2 text-2xl font-bold text-brand-dark">{t("title")}</h2>
        <p className="text-brand-grayMed">
          {t("description")}
        </p>
      </div>

      <div className="space-y-8">
        {/* Directors Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-lg font-semibold text-brand-dark">
              <Users className="h-5 w-5 text-brand-gold" />
              {t("companyDirectors")}
            </h3>
            <Button type="button" onClick={addDirector} variant="outline" size="sm">
              <Plus className="mr-2 h-4 w-4" />
              {t("addDirector")}
            </Button>
          </div>

          {directors.map((director, index) => (
            <div key={director.id} className="rounded-lg border border-brand-grayLight bg-gray-50 p-4">
              <div className="mb-3 flex items-center justify-between">
                <h4 className="font-semibold text-brand-dark">{t("director")} {index + 1}</h4>
                {directors.length > 1 && (
                  <Button
                    type="button"
                    onClick={() => removeDirector(director.id)}
                    variant="ghost"
                    size="sm"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>{tc("firstName")} *</Label>
                  <Input
                    value={director.firstName}
                    onChange={(e) => updateDirector(director.id, "firstName", e.target.value)}
                    placeholder={tc("firstName")}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{tc("lastName")} *</Label>
                  <Input
                    value={director.lastName}
                    onChange={(e) => updateDirector(director.id, "lastName", e.target.value)}
                    placeholder={tc("lastName")}
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>{tc("email")} *</Label>
                  <Input
                    type="email"
                    value={director.email}
                    onChange={(e) => updateDirector(director.id, "email", e.target.value)}
                    placeholder="email@example.com"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* UBOs Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="flex items-center gap-2 text-lg font-semibold text-brand-dark">
                <Users className="h-5 w-5 text-brand-gold" />
                {t("ubosTitle")}
              </h3>
              <p className="mt-1 text-sm text-brand-grayMed">
                {t("ubosDescription")}
              </p>
            </div>
            <Button type="button" onClick={addUBO} variant="outline" size="sm">
              <Plus className="mr-2 h-4 w-4" />
              {t("addUbo")}
            </Button>
          </div>

          {ubos.map((ubo, index) => (
            <div key={ubo.id} className="rounded-lg border border-brand-grayLight bg-gray-50 p-4">
              <div className="mb-3 flex items-center justify-between">
                <h4 className="font-semibold text-brand-dark">{t("ubo")} {index + 1}</h4>
                {ubos.length > 1 && (
                  <Button type="button" onClick={() => removeUBO(ubo.id)} variant="ghost" size="sm">
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>{tc("firstName")} *</Label>
                  <Input
                    value={ubo.firstName}
                    onChange={(e) => updateUBO(ubo.id, "firstName", e.target.value)}
                    placeholder={tc("firstName")}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{tc("lastName")} *</Label>
                  <Input
                    value={ubo.lastName}
                    onChange={(e) => updateUBO(ubo.id, "lastName", e.target.value)}
                    placeholder={tc("lastName")}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{tc("email")} *</Label>
                  <Input
                    type="email"
                    value={ubo.email}
                    onChange={(e) => updateUBO(ubo.id, "email", e.target.value)}
                    placeholder="email@example.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t("ownership")} *</Label>
                  <Input
                    type="number"
                    min="25"
                    max="100"
                    value={ubo.ownership}
                    onChange={(e) => updateUBO(ubo.id, "ownership", e.target.value)}
                    placeholder={t("ownershipPlaceholder")}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="rounded-lg bg-blue-50 p-4">
          <h4 className="mb-2 text-sm font-semibold text-blue-900">{t("whyNeeded")}</h4>
          <p className="text-sm text-blue-800">
            {t("whyNeededDesc")}
          </p>
        </div>
      </div>
    </div>
  );
}
