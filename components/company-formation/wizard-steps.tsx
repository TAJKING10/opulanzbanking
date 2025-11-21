"use client";

import * as React from "react";
import { v4 as uuidv4 } from "uuid";
import {
  Users,
  Euro,
  Briefcase,
  Upload,
  CheckCircle,
  X,
  Plus,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  CompanyFormationDossier,
  Person,
  Contribution,
  UploadedFile,
  COMPANY_FORM_RULES,
} from "@/types/company-formation";

type StepProps = {
  dossier: Partial<CompanyFormationDossier>;
  updateDossier: (updates: Partial<CompanyFormationDossier>) => void;
};

// Step 3: People (Shareholders, Directors, UBOs)
export function Step3People({ dossier, updateDossier }: StepProps) {
  const [shareholders, setShareholders] = React.useState<Person[]>(dossier.shareholders || []);
  const [directors, setDirectors] = React.useState<Person[]>(dossier.directors || []);
  const [managers, setManagers] = React.useState<Person[]>(dossier.managers || []);
  const [ubos, setUbos] = React.useState<Person[]>(dossier.ubos || []);
  const [editingPerson, setEditingPerson] = React.useState<Person | null>(null);
  const [editingType, setEditingType] = React.useState<"shareholder" | "director" | "manager" | "ubo" | null>(null);

  React.useEffect(() => {
    updateDossier({ shareholders, directors, managers, ubos });
  }, [shareholders, directors, managers, ubos]);

  const addPerson = (type: "shareholder" | "director" | "manager" | "ubo") => {
    const newPerson: Person = {
      id: uuidv4(),
      firstName: "",
      lastName: "",
      dob: "",
      nationality: "",
      address: "",
      email: "",
      phone: "",
      roles: [type.toUpperCase() as any],
      sharePercent: type === "shareholder" ? 0 : undefined,
      isPep: false,
    };
    setEditingPerson(newPerson);
    setEditingType(type);
  };

  const savePerson = () => {
    if (!editingPerson || !editingType) return;

    switch (editingType) {
      case "shareholder":
        setShareholders([...shareholders.filter(p => p.id !== editingPerson.id), editingPerson]);
        break;
      case "director":
        setDirectors([...directors.filter(p => p.id !== editingPerson.id), editingPerson]);
        break;
      case "manager":
        setManagers([...managers.filter(p => p.id !== editingPerson.id), editingPerson]);
        break;
      case "ubo":
        setUbos([...ubos.filter(p => p.id !== editingPerson.id), editingPerson]);
        break;
    }

    setEditingPerson(null);
    setEditingType(null);
  };

  const deletePerson = (id: string, type: "shareholder" | "director" | "manager" | "ubo") => {
    switch (type) {
      case "shareholder":
        setShareholders(shareholders.filter(p => p.id !== id));
        break;
      case "director":
        setDirectors(directors.filter(p => p.id !== id));
        break;
      case "manager":
        setManagers(managers.filter(p => p.id !== id));
        break;
      case "ubo":
        setUbos(ubos.filter(p => p.id !== id));
        break;
    }
  };

  const totalSharePercent = shareholders.reduce((sum, p) => sum + (p.sharePercent || 0), 0);

  return (
    <div className="space-y-8">
      {/* Shareholders */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-bold text-brand-dark">Shareholders</h3>
          <Button size="sm" onClick={() => addPerson("shareholder")}>
            <Plus className="mr-2 h-4 w-4" />
            Add Shareholder
          </Button>
        </div>
        {shareholders.length === 0 ? (
          <div className="rounded-xl border-2 border-dashed border-brand-grayLight p-8 text-center text-brand-grayMed">
            No shareholders added yet. Click "Add Shareholder" to begin.
          </div>
        ) : (
          <div className="space-y-4">
            {shareholders.map((person) => (
              <PersonCard
                key={person.id}
                person={person}
                onEdit={() => {
                  setEditingPerson(person);
                  setEditingType("shareholder");
                }}
                onDelete={() => deletePerson(person.id, "shareholder")}
              />
            ))}
            {totalSharePercent !== 100 && (
              <div className="flex items-center gap-2 rounded-xl bg-yellow-50 p-4 text-sm text-yellow-900">
                <AlertCircle className="h-5 w-5" />
                <span>Total ownership: {totalSharePercent}% (should equal 100%)</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Directors (for SA) */}
      {COMPANY_FORM_RULES[dossier.formType!]?.requiresDirectors && (
        <div>
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-bold text-brand-dark">Directors</h3>
            <Button size="sm" onClick={() => addPerson("director")}>
              <Plus className="mr-2 h-4 w-4" />
              Add Director
            </Button>
          </div>
          {directors.length === 0 ? (
            <div className="rounded-xl border-2 border-dashed border-brand-grayLight p-8 text-center text-brand-grayMed">
              No directors added yet. {dossier.formType} requires at least {'minDirectors' in COMPANY_FORM_RULES[dossier.formType!] ? COMPANY_FORM_RULES[dossier.formType!].minDirectors : 1} directors.
            </div>
          ) : (
            <div className="space-y-4">
              {directors.map((person) => (
                <PersonCard
                  key={person.id}
                  person={person}
                  onEdit={() => {
                    setEditingPerson(person);
                    setEditingType("director");
                  }}
                  onDelete={() => deletePerson(person.id, "director")}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Managers (for SARL/SARL-S) */}
      {COMPANY_FORM_RULES[dossier.formType!]?.requiresManagers && (
        <div>
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-bold text-brand-dark">Managers</h3>
            <Button size="sm" onClick={() => addPerson("manager")}>
              <Plus className="mr-2 h-4 w-4" />
              Add Manager
            </Button>
          </div>
          {managers.length === 0 ? (
            <div className="rounded-xl border-2 border-dashed border-brand-grayLight p-8 text-center text-brand-grayMed">
              No managers added yet. {dossier.formType} requires at least {COMPANY_FORM_RULES[dossier.formType!].minManagers} manager.
            </div>
          ) : (
            <div className="space-y-4">
              {managers.map((person) => (
                <PersonCard
                  key={person.id}
                  person={person}
                  onEdit={() => {
                    setEditingPerson(person);
                    setEditingType("manager");
                  }}
                  onDelete={() => deletePerson(person.id, "manager")}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* UBOs */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-bold text-brand-dark">Ultimate Beneficial Owners (UBOs)</h3>
          <Button size="sm" onClick={() => addPerson("ubo")}>
            <Plus className="mr-2 h-4 w-4" />
            Add UBO
          </Button>
        </div>
        <p className="mb-4 text-sm text-brand-grayMed">
          Individuals who own or control more than 25% of the company
        </p>
        {ubos.length === 0 ? (
          <div className="rounded-xl border-2 border-dashed border-brand-grayLight p-8 text-center text-brand-grayMed">
            No UBOs added yet.
          </div>
        ) : (
          <div className="space-y-4">
            {ubos.map((person) => (
              <PersonCard
                key={person.id}
                person={person}
                showPep
                onEdit={() => {
                  setEditingPerson(person);
                  setEditingType("ubo");
                }}
                onDelete={() => deletePerson(person.id, "ubo")}
              />
            ))}
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editingPerson && editingType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-2xl rounded-2xl bg-white p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="mb-6 text-2xl font-bold text-brand-dark">
              {editingPerson.firstName ? "Edit" : "Add"} {editingType}
            </h3>
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>First Name *</Label>
                  <Input
                    value={editingPerson.firstName}
                    onChange={(e) => setEditingPerson({ ...editingPerson, firstName: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Last Name *</Label>
                  <Input
                    value={editingPerson.lastName}
                    onChange={(e) => setEditingPerson({ ...editingPerson, lastName: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Date of Birth *</Label>
                  <Input
                    type="date"
                    value={editingPerson.dob}
                    onChange={(e) => setEditingPerson({ ...editingPerson, dob: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Nationality *</Label>
                  <Input
                    value={editingPerson.nationality}
                    onChange={(e) => setEditingPerson({ ...editingPerson, nationality: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Address *</Label>
                <Input
                  value={editingPerson.address}
                  onChange={(e) => setEditingPerson({ ...editingPerson, address: e.target.value })}
                />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={editingPerson.email}
                    onChange={(e) => setEditingPerson({ ...editingPerson, email: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Phone</Label>
                  <Input
                    value={editingPerson.phone}
                    onChange={(e) => setEditingPerson({ ...editingPerson, phone: e.target.value })}
                  />
                </div>
              </div>
              {editingType === "shareholder" && (
                <div className="space-y-2">
                  <Label>Ownership Percentage *</Label>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    value={editingPerson.sharePercent || 0}
                    onChange={(e) => setEditingPerson({ ...editingPerson, sharePercent: parseFloat(e.target.value) })}
                  />
                </div>
              )}
              {editingType === "ubo" && (
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="isPep"
                    checked={editingPerson.isPep}
                    onCheckedChange={(checked) => setEditingPerson({ ...editingPerson, isPep: checked as boolean })}
                  />
                  <Label htmlFor="isPep">This person is a Politically Exposed Person (PEP)</Label>
                </div>
              )}
            </div>
            <div className="mt-6 flex justify-end gap-4">
              <Button variant="outline" onClick={() => {
                setEditingPerson(null);
                setEditingType(null);
              }}>
                Cancel
              </Button>
              <Button onClick={savePerson}>Save</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function PersonCard({ person, showPep, onEdit, onDelete }: {
  person: Person;
  showPep?: boolean;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-brand-grayLight p-4">
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-goldLight text-brand-goldDark font-bold">
          {person.firstName[0]}{person.lastName[0]}
        </div>
        <div>
          <p className="font-semibold text-brand-dark">{person.firstName} {person.lastName}</p>
          <p className="text-sm text-brand-grayMed">
            {person.nationality} • {person.dob}
            {person.sharePercent && <> • {person.sharePercent}% ownership</>}
            {showPep && person.isPep && <> • PEP</>}
          </p>
        </div>
      </div>
      <div className="flex gap-2">
        <Button size="sm" variant="outline" onClick={onEdit}>Edit</Button>
        <Button size="sm" variant="outline" onClick={onDelete}>
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

// Step 4: Capital & Contributions
export function Step4Capital({ dossier, updateDossier }: StepProps) {
  const [capitalAmount, setCapitalAmount] = React.useState(dossier.capitalAmount || 0);
  const [paidUpPercent, setPaidUpPercent] = React.useState(dossier.capitalPaidUpPercent || 100);
  const [contributions, setContributions] = React.useState<Contribution[]>(dossier.contributions || []);

  const rules = COMPANY_FORM_RULES[dossier.formType!];

  React.useEffect(() => {
    updateDossier({
      capitalAmount,
      capitalPaidUpPercent: rules.requiresPaidUpPercent ? paidUpPercent : undefined,
      contributions,
    });
  }, [capitalAmount, paidUpPercent, contributions]);

  const addContribution = () => {
    const newContribution: Contribution = {
      id: uuidv4(),
      type: "CASH",
      description: "",
      amount: 0,
    };
    setContributions([...contributions, newContribution]);
  };

  const updateContribution = (id: string, updates: Partial<Contribution>) => {
    setContributions(contributions.map(c => c.id === id ? { ...c, ...updates } : c));
  };

  const deleteContribution = (id: string) => {
    setContributions(contributions.filter(c => c.id !== id));
  };

  const totalContributions = contributions.reduce((sum, c) => sum + c.amount, 0);
  const isValid = capitalAmount >= rules.minCapital &&
    (rules.maxCapital === Infinity || capitalAmount <= rules.maxCapital);

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="capitalAmount">
          Share Capital Amount (EUR) <span className="text-red-500">*</span>
        </Label>
        <Input
          id="capitalAmount"
          type="number"
          min={rules.minCapital}
          max={rules.maxCapital !== Infinity ? rules.maxCapital : undefined}
          value={capitalAmount}
          onChange={(e) => setCapitalAmount(parseFloat(e.target.value) || 0)}
        />
        <p className="text-xs text-brand-grayMed">
          {rules.minCapital === 0 ? "No minimum required" : `Minimum: €${rules.minCapital.toLocaleString()}`}
          {rules.maxCapital !== Infinity && ` • Maximum: €${rules.maxCapital.toLocaleString()}`}
        </p>
        {!isValid && (
          <p className="text-sm text-red-500">
            Capital amount must be between €{rules.minCapital.toLocaleString()} and €{rules.maxCapital === Infinity ? "∞" : rules.maxCapital.toLocaleString()}
          </p>
        )}
      </div>

      {rules.requiresPaidUpPercent && (
        <div className="space-y-2">
          <Label htmlFor="paidUpPercent">
            Paid-Up Percentage <span className="text-red-500">*</span>
          </Label>
          <Input
            id="paidUpPercent"
            type="number"
            min="25"
            max="100"
            value={paidUpPercent}
            onChange={(e) => setPaidUpPercent(parseFloat(e.target.value) || 100)}
          />
          <p className="text-xs text-brand-grayMed">
            For SA, at least 25% must be paid up at incorporation
          </p>
        </div>
      )}

      <div>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-bold text-brand-dark">Contributions</h3>
          <Button size="sm" onClick={addContribution}>
            <Plus className="mr-2 h-4 w-4" />
            Add Contribution
          </Button>
        </div>
        {contributions.length === 0 ? (
          <div className="rounded-xl border-2 border-dashed border-brand-grayLight p-8 text-center text-brand-grayMed">
            No contributions added yet. Add cash or in-kind contributions.
          </div>
        ) : (
          <div className="space-y-4">
            {contributions.map((contribution) => (
              <div key={contribution.id} className="rounded-xl border border-brand-grayLight p-4 space-y-4">
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label>Type</Label>
                    <select
                      className="flex h-11 w-full rounded-xl border border-brand-grayLight bg-white px-4 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold"
                      value={contribution.type}
                      onChange={(e) => updateContribution(contribution.id, { type: e.target.value as any })}
                    >
                      <option value="CASH">Cash</option>
                      <option value="INKIND">In-Kind</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label>Amount (EUR)</Label>
                    <Input
                      type="number"
                      value={contribution.amount}
                      onChange={(e) => updateContribution(contribution.id, { amount: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                  <div className="flex items-end">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteContribution(contribution.id)}
                      className="w-full"
                    >
                      <X className="mr-2 h-4 w-4" />
                      Remove
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Input
                    value={contribution.description}
                    onChange={(e) => updateContribution(contribution.id, { description: e.target.value })}
                    placeholder="Describe the contribution..."
                  />
                </div>
              </div>
            ))}
            <div className="rounded-xl bg-brand-goldLight/20 p-4">
              <p className="text-sm font-semibold text-brand-dark">
                Total Contributions: €{totalContributions.toLocaleString()}
              </p>
              {totalContributions !== capitalAmount && (
                <p className="text-sm text-yellow-700 mt-1">
                  <AlertCircle className="inline h-4 w-4 mr-1" />
                  Contributions should equal capital amount (€{capitalAmount.toLocaleString()})
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Continue with remaining steps in the next message due to length...
