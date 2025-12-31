"use client";

import { StepTemplate } from '../StepTemplate';

export const PMCompanyIdentityStep = () => (
  <StepTemplate
    title="Company Identity"
    description="Legal name, registration, business sector, regulatory status"
    fields={[
      { label: "Legal Name", type: "text", key: "legalName" },
      { label: "Registration Number (RCS)", type: "text", key: "registrationNumber" },
      { label: "Business Sector", type: "select", key: "businessSector" },
    ]}
  />
);

export const PMRepresentativesStep = () => (
  <StepTemplate
    title="Representatives & Shareholders"
    description="Company representatives, shareholders above 25%, roles and contacts"
  />
);

export const PMFATCAStep = () => (
  <StepTemplate
    title="FATCA & Ultimate Beneficial Owners"
    description="US person status, UBO identification, ownership percentages"
  />
);

export const PMFinancialStep = () => (
  <StepTemplate
    title="Company Financial Situation"
    description="Balance sheet, turnover, equity, patrimony breakdown"
    fields={[
      { label: "Last FY Balance Sheet Total", type: "number", key: "balanceSheet" },
      { label: "Last FY Net Turnover", type: "number", key: "turnover" },
    ]}
  />
);

export const PMOriginOfFundsStep = () => (
  <StepTemplate
    title="Origin of Funds"
    description="Assets to invest, planned amount, economic origin, banking details"
    fields={[
      { label: "Planned Investment Amount", type: "number", key: "investmentAmount" },
      { label: "Origin Bank Name", type: "text", key: "bankName" },
    ]}
  />
);

export const PMKnowledgeStep = () => (
  <StepTemplate
    title="Company Investment Knowledge"
    description="Company's experience with various financial instruments"
  />
);

export const PMPortfolioManagementStep = () => (
  <StepTemplate
    title="Portfolio Management Culture"
    description="Managed portfolio status, internal capabilities, market following"
  />
);

export const PMObjectivesStep = () => (
  <StepTemplate
    title="Investment Objectives & Risk"
    description="Company investment goals, horizon, risk tolerance, ESG preferences"
  />
);

export const PMConsentsStep = () => (
  <StepTemplate
    title="Corporate Consents & Declarations"
    description="Company consents, GDPR, AML declarations, authorized signatory"
  />
);
