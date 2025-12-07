"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';
import type { ClientFile, ClientType, IndividualClientData, CorporateClientData } from '@/types/kyc';

interface WizardContextType {
  currentStep: number;
  clientType: ClientType | null;
  data: Partial<ClientFile>;
  setClientType: (type: ClientType) => void;
  updateData: (updates: Partial<ClientFile>) => void;
  nextStep: () => void;
  prevStep: () => void;
  goToStep: (step: number) => void;
  resetWizard: () => void;
}

const KYCWizardContext = createContext<WizardContextType | undefined>(undefined);

export function KYCWizardProvider({ children }: { children: ReactNode }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [clientType, setClientTypeState] = useState<ClientType | null>(null);
  const [data, setData] = useState<Partial<ClientFile>>({});

  const setClientType = (type: ClientType) => {
    setClientTypeState(type);
    setData({
      clientType: type,
      common: {
        missionInfo: {} as any,
        recommendedProducts: [],
        documents: []
      }
    } as Partial<ClientFile>);
  };

  const updateData = (updates: Partial<ClientFile>) => {
    setData(prev => ({
      ...prev,
      ...updates
    } as Partial<ClientFile>));
  };

  const nextStep = () => setCurrentStep(prev => prev + 1);
  const prevStep = () => setCurrentStep(prev => Math.max(0, prev - 1));
  const goToStep = (step: number) => setCurrentStep(step);

  const resetWizard = () => {
    setCurrentStep(0);
    setClientTypeState(null);
    setData({});
  };

  return (
    <KYCWizardContext.Provider value={{
      currentStep,
      clientType,
      data,
      setClientType,
      updateData,
      nextStep,
      prevStep,
      goToStep,
      resetWizard
    }}>
      {children}
    </KYCWizardContext.Provider>
  );
}

export function useKYCWizard() {
  const context = useContext(KYCWizardContext);
  if (!context) {
    throw new Error('useKYCWizard must be used within KYCWizardProvider');
  }
  return context;
}
