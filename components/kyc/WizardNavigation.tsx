"use client";

import React from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslations } from 'next-intl';

interface WizardNavigationProps {
  onNext: () => void;
  onPrev: () => void;
  canGoPrev: boolean;
  canGoNext: boolean;
  nextLabel?: string;
  prevLabel?: string;
}

export function WizardNavigation({
  onNext,
  onPrev,
  canGoPrev,
  canGoNext,
  nextLabel,
  prevLabel,
}: WizardNavigationProps) {
  const t = useTranslations('common');
  const displayNext = nextLabel ?? t('next');
  const displayPrev = prevLabel ?? t('back');
  return (
    <div className="flex justify-between mt-8 pt-6 border-t border-brand-grayLight">
      <Button
        type="button"
        onClick={onPrev}
        disabled={!canGoPrev}
        variant="outline"
        className="flex items-center gap-2"
      >
        <ArrowLeft className="w-4 h-4" />
        {displayPrev}
      </Button>
      <Button
        type="button"
        onClick={onNext}
        disabled={!canGoNext}
        className="flex items-center gap-2 bg-brand-gold hover:bg-brand-goldDark"
      >
        {displayNext}
        <ArrowRight className="w-4 h-4" />
      </Button>
    </div>
  );
}
