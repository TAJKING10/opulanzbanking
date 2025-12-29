"use client";

import * as React from "react";
import { v4 as uuidv4 } from "uuid";
import { useTranslations } from "next-intl";
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
  const t = useTranslations('companyFormation.wizard.step3');
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
          <h3 className="text-lg font-bold text-brand-dark">{t('shareholders')}</h3>
          <Button size="sm" onClick={() => addPerson("shareholder")}>
            <Plus className="mr-2 h-4 w-4" />
            {t('addShareholder')}
          </Button>
        </div>
        {shareholders.length === 0 ? (
          <div className="rounded-xl border-2 border-dashed border-brand-grayLight p-8 text-center text-brand-grayMed">
            {t('noShareholdersYet')}
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
                <span>{t('totalOwnership', { percent: totalSharePercent })}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Directors (for SA) */}
      {COMPANY_FORM_RULES[dossier.formType!]?.requiresDirectors && (
        <div>
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-bold text-brand-dark">{t('directors')}</h3>
            <Button size="sm" onClick={() => addPerson("director")}>
              <Plus className="mr-2 h-4 w-4" />
              {t('addDirector')}
            </Button>
          </div>
          {directors.length === 0 ? (
            <div className="rounded-xl border-2 border-dashed border-brand-grayLight p-8 text-center text-brand-grayMed">
              {t('noDirectorsYet', { formType: dossier.formType, minDirectors: (COMPANY_FORM_RULES[dossier.formType!] as any).minDirectors || 1 })}
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
            <h3 className="text-lg font-bold text-brand-dark">{t('managers')}</h3>
            <Button size="sm" onClick={() => addPerson("manager")}>
              <Plus className="mr-2 h-4 w-4" />
              {t('addManager')}
            </Button>
          </div>
          {managers.length === 0 ? (
            <div className="rounded-xl border-2 border-dashed border-brand-grayLight p-8 text-center text-brand-grayMed">
              {t('noManagersYet', { formType: dossier.formType, minManagers: (COMPANY_FORM_RULES[dossier.formType!] as any).minManagers || 1 })}
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
          <h3 className="text-lg font-bold text-brand-dark">{t('ubos')}</h3>
          <Button size="sm" onClick={() => addPerson("ubo")}>
            <Plus className="mr-2 h-4 w-4" />
            {t('addUBO')}
          </Button>
        </div>
        <p className="mb-4 text-sm text-brand-grayMed">
          {t('ubosDescription')}
        </p>
        {ubos.length === 0 ? (
          <div className="rounded-xl border-2 border-dashed border-brand-grayLight p-8 text-center text-brand-grayMed">
            {t('noUBOsYet')}
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
              {editingPerson.firstName ? t('editPerson', { type: editingType }) : t('addPerson', { type: editingType })}
            </h3>
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>{t('firstName')} *</Label>
                  <Input
                    value={editingPerson.firstName}
                    onChange={(e) => setEditingPerson({ ...editingPerson, firstName: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t('lastName')} *</Label>
                  <Input
                    value={editingPerson.lastName}
                    onChange={(e) => setEditingPerson({ ...editingPerson, lastName: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>{t('dateOfBirth')} *</Label>
                  <Input
                    type="date"
                    value={editingPerson.dob}
                    onChange={(e) => setEditingPerson({ ...editingPerson, dob: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t('nationality')} *</Label>
                  <Input
                    value={editingPerson.nationality}
                    onChange={(e) => setEditingPerson({ ...editingPerson, nationality: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>{t('address')} *</Label>
                <Input
                  value={editingPerson.address}
                  onChange={(e) => setEditingPerson({ ...editingPerson, address: e.target.value })}
                />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>{t('email')}</Label>
                  <Input
                    type="email"
                    value={editingPerson.email}
                    onChange={(e) => setEditingPerson({ ...editingPerson, email: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t('phone')}</Label>
                  <Input
                    value={editingPerson.phone}
                    onChange={(e) => setEditingPerson({ ...editingPerson, phone: e.target.value })}
                  />
                </div>
              </div>
              {editingType === "shareholder" && (
                <div className="space-y-2">
                  <Label>{t('ownershipPercentage')} *</Label>
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
                  <Label htmlFor="isPep">{t('isPEP')}</Label>
                </div>
              )}
            </div>
            <div className="mt-6 flex justify-end gap-4">
              <Button variant="outline" onClick={() => {
                setEditingPerson(null);
                setEditingType(null);
              }}>
                {t('cancel')}
              </Button>
              <Button onClick={savePerson}>{t('save')}</Button>
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
  const t = useTranslations('companyFormation.wizard.step3');

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
            {person.sharePercent && <> • {person.sharePercent}% {t('ownership')}</>}
            {showPep && person.isPep && <> • {t('pep')}</>}
          </p>
        </div>
      </div>
      <div className="flex gap-2">
        <Button size="sm" variant="outline" onClick={onEdit}>{t('edit')}</Button>
        <Button size="sm" variant="outline" onClick={onDelete}>
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

// Step 4: Capital & Contributions
export function Step4Capital({ dossier, updateDossier }: StepProps) {
  const t = useTranslations('companyFormation.wizard.step4');
  const [capitalAmount, setCapitalAmount] = React.useState(dossier.capitalAmount);
  const [paidUpPercent, setPaidUpPercent] = React.useState(dossier.capitalPaidUpPercent || 100);
  const [contributions, setContributions] = React.useState<Contribution[]>(dossier.contributions || []);

  const rules = COMPANY_FORM_RULES[dossier.formType!];

  React.useEffect(() => {
    updateDossier({
      capitalAmount,
      capitalPaidUpPercent: (rules as any).requiresPaidUpPercent ? paidUpPercent : undefined,
      contributions,
    });
  }, [capitalAmount, paidUpPercent, contributions]);

  const addContribution = () => {
    const newContribution: Contribution = {
      id: uuidv4(),
      type: "CASH",
      description: "",
      amount: undefined as any,
    };
    setContributions([...contributions, newContribution]);
  };

  const updateContribution = (id: string, updates: Partial<Contribution>) => {
    setContributions(contributions.map(c => c.id === id ? { ...c, ...updates } : c));
  };

  const deleteContribution = (id: string) => {
    setContributions(contributions.filter(c => c.id !== id));
  };

  const totalContributions = contributions.reduce((sum, c) => sum + (c.amount || 0), 0);
  const isValid = (capitalAmount || 0) >= rules.minCapital &&
    (rules.maxCapital === Infinity || (capitalAmount || 0) <= rules.maxCapital);

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="capitalAmount">
          {t('shareCapitalAmount')} <span className="text-red-500">{t('shareCapitalAmountRequired')}</span>
        </Label>
        <Input
          id="capitalAmount"
          type="number"
          min={rules.minCapital}
          max={rules.maxCapital !== Infinity ? rules.maxCapital : undefined}
          value={capitalAmount === undefined || capitalAmount === 0 ? "" : capitalAmount}
          onChange={(e) => setCapitalAmount(e.target.value === "" ? undefined : parseFloat(e.target.value))}
        />
        <p className="text-xs text-brand-grayMed">
          {rules.minCapital === 0 ? t('noMinimumRequired') : t('minimumCapital', { amount: rules.minCapital.toLocaleString() })}
          {rules.maxCapital !== Infinity && ` • ${t('maximumCapital', { amount: rules.maxCapital.toLocaleString() })}`}
        </p>
        {!isValid && (
          <p className="text-sm text-red-500">
            {t('capitalAmountError', { min: rules.minCapital.toLocaleString(), max: rules.maxCapital === Infinity ? "∞" : rules.maxCapital.toLocaleString() })}
          </p>
        )}
      </div>

      {(rules as any).requiresPaidUpPercent && (
        <div className="space-y-2">
          <Label htmlFor="paidUpPercent">
            {t('paidUpPercentage')} <span className="text-red-500">{t('paidUpPercentageRequired')}</span>
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
            {t('paidUpPercentageHint')}
          </p>
        </div>
      )}

      <div>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-bold text-brand-dark">{t('contributions')}</h3>
          <Button size="sm" onClick={addContribution}>
            <Plus className="mr-2 h-4 w-4" />
            {t('addContribution')}
          </Button>
        </div>
        {contributions.length === 0 ? (
          <div className="rounded-xl border-2 border-dashed border-brand-grayLight p-8 text-center text-brand-grayMed">
            {t('noContributionsYet')}
          </div>
        ) : (
          <div className="space-y-4">
            {contributions.map((contribution) => (
              <div key={contribution.id} className="rounded-xl border border-brand-grayLight p-4 space-y-4">
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label>{t('contributionType')}</Label>
                    <select
                      className="flex h-11 w-full rounded-xl border border-brand-grayLight bg-white px-4 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold"
                      value={contribution.type}
                      onChange={(e) => updateContribution(contribution.id, { type: e.target.value as any })}
                    >
                      <option value="CASH">{t('contributionTypeCash')}</option>
                      <option value="INKIND">{t('contributionTypeInKind')}</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label>{t('contributionAmount')}</Label>
                    <Input
                      type="number"
                      value={contribution.amount === undefined || contribution.amount === 0 ? "" : contribution.amount}
                      onChange={(e) => updateContribution(contribution.id, { amount: e.target.value === "" ? undefined : parseFloat(e.target.value) })}
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
                      {t('remove')}
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>{t('contributionDescription')}</Label>
                  <Input
                    value={contribution.description}
                    onChange={(e) => updateContribution(contribution.id, { description: e.target.value })}
                    placeholder={t('contributionDescriptionPlaceholder')}
                  />
                </div>
              </div>
            ))}
            <div className="rounded-xl bg-brand-goldLight/20 p-4">
              <p className="text-sm font-semibold text-brand-dark">
                {t('totalContributions', { amount: totalContributions.toLocaleString() })}
              </p>
              {totalContributions !== capitalAmount && (
                <p className="text-sm text-yellow-700 mt-1">
                  <AlertCircle className="inline h-4 w-4 mr-1" />
                  {t('contributionsMismatch', { amount: (capitalAmount || 0).toLocaleString() })}
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
