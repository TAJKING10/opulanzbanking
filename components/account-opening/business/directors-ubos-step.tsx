"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Users, Plus, X } from "lucide-react";
import { DirectorOrUBO } from "@/shared/types/person";
import { usePersonList } from "@/shared/hooks/use-person-list";
import { StepProps } from "@/shared/types/step-props";

interface DirectorsUBOsData {
  directors?: DirectorOrUBO[];
  ubos?: DirectorOrUBO[];
  isDirectorsStepValid?: boolean;
}

interface DirectorsUBOsStepProps extends StepProps<DirectorsUBOsData> {}

type Person = DirectorOrUBO;

export function DirectorsUBOsStep({ data, onUpdate, onNext }: DirectorsUBOsStepProps) {
  const directors = usePersonList<Person>(
    data.directors?.length > 0 ? data.directors : [{ id: "1", firstName: "", lastName: "", email: "" }]
  );
  
  const ubos = usePersonList<Person>(
    data.ubos?.length > 0
      ? data.ubos
      : [{ id: "1", firstName: "", lastName: "", email: "", ownership: "" }]
  );

  const addDirector = () => {
    directors.add({ id: Date.now().toString(), firstName: "", lastName: "", email: "" });
  };

  const removeDirector = (id: string) => {
    if (directors.count > 1) {
      directors.remove(id);
    }
  };

  const updateDirector = (id: string, field: string, value: string) => {
    directors.updateField(id, field as keyof Person, value);
  };

  const addUBO = () => {
    ubos.add({ id: Date.now().toString(), firstName: "", lastName: "", email: "", ownership: "" });
  };

  const removeUBO = (id: string) => {
    if (ubos.count > 1) {
      ubos.remove(id);
    }
  };

  const updateUBO = (id: string, field: string, value: string) => {
    ubos.updateField(id, field as keyof Person, value);
  };

  const isDirectorsStepValid =
    directors.items.every((d) => d.firstName && d.lastName && d.email) &&
    ubos.items.every((u) => u.firstName && u.lastName && u.email && u.ownership);

  // Update parent with validation status
  React.useEffect(() => {
    onUpdate({ directors: directors.items, ubos: ubos.items, isDirectorsStepValid });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDirectorsStepValid]);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="mb-2 text-2xl font-bold text-brand-dark">Directors & Beneficial Owners</h2>
        <p className="text-brand-grayMed">
          Provide information about company directors and ultimate beneficial owners (UBOs).
        </p>
      </div>

      <div className="space-y-8">
        {/* Directors Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-lg font-semibold text-brand-dark">
              <Users className="h-5 w-5 text-brand-gold" />
              Company Directors
            </h3>
            <Button type="button" onClick={addDirector} variant="outline" size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Add Director
            </Button>
          </div>

          {directors.items.map((director, index) => (
            <div key={director.id} className="rounded-lg border border-brand-grayLight bg-gray-50 p-4">
              <div className="mb-3 flex items-center justify-between">
                <h4 className="font-semibold text-brand-dark">Director {index + 1}</h4>
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
                  <Label>First Name *</Label>
                  <Input
                    value={director.firstName}
                    onChange={(e) => updateDirector(director.id, "firstName", e.target.value)}
                    placeholder="First name"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Last Name *</Label>
                  <Input
                    value={director.lastName}
                    onChange={(e) => updateDirector(director.id, "lastName", e.target.value)}
                    placeholder="Last name"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>Email *</Label>
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
                Ultimate Beneficial Owners (UBOs)
              </h3>
              <p className="mt-1 text-sm text-brand-grayMed">
                Individuals who own 25% or more of the company
              </p>
            </div>
            <Button type="button" onClick={addUBO} variant="outline" size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Add UBO
            </Button>
          </div>

          {ubos.items.map((ubo, index) => (
            <div key={ubo.id} className="rounded-lg border border-brand-grayLight bg-gray-50 p-4">
              <div className="mb-3 flex items-center justify-between">
                <h4 className="font-semibold text-brand-dark">UBO {index + 1}</h4>
                {ubos.count > 1 && (
                  <Button type="button" onClick={() => removeUBO(ubo.id)} variant="ghost" size="sm">
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>First Name *</Label>
                  <Input
                    value={ubo.firstName}
                    onChange={(e) => updateUBO(ubo.id, "firstName", e.target.value)}
                    placeholder="First name"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Last Name *</Label>
                  <Input
                    value={ubo.lastName}
                    onChange={(e) => updateUBO(ubo.id, "lastName", e.target.value)}
                    placeholder="Last name"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Email *</Label>
                  <Input
                    type="email"
                    value={ubo.email}
                    onChange={(e) => updateUBO(ubo.id, "email", e.target.value)}
                    placeholder="email@example.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Ownership % *</Label>
                  <Input
                    type="number"
                    min="25"
                    max="100"
                    value={ubo.ownership}
                    onChange={(e) => updateUBO(ubo.id, "ownership", e.target.value)}
                    placeholder="e.g., 50"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="rounded-lg bg-blue-50 p-4">
          <h4 className="mb-2 text-sm font-semibold text-blue-900">Why we need this information</h4>
          <p className="text-sm text-blue-800">
            Banks are required by law (KYC/AML regulations) to know who controls the company. This helps
            prevent financial crime and ensures transparency.
          </p>
        </div>
      </div>
    </div>
  );
}
