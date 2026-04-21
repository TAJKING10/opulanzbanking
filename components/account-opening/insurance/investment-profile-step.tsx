"use client";

import * as React from "react";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Slider } from "@/components/ui/slider";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info, AlertTriangle } from "lucide-react";

interface InvestmentProfileStepProps {
  data: any;
  onUpdate: (data: any) => void;
  onNext: () => void;
}

export function InvestmentProfileStep({ data, onUpdate, onNext }: InvestmentProfileStepProps) {
  const [formState, setFormState] = React.useState({
    investmentHorizon: data.investmentHorizon || "",
    investmentKnowledge: data.investmentKnowledge || "",
    investmentExperience: data.investmentExperience || "",
    riskTolerance: data.riskTolerance || 3,
    investmentObjective: data.investmentObjective || "",
    expectedReturn: data.expectedReturn || "",
    liquidityNeeds: data.liquidityNeeds || "",
  });

  const updateField = (field: string, value: any) => {
    setFormState((prev) => ({ ...prev, [field]: value }));
  };

  // Suitability check - warn if horizon doesn't match risk
  const suitabilityWarning = React.useMemo(() => {
    const horizon = formState.investmentHorizon;
    const risk = formState.riskTolerance;

    if (horizon === "short" && risk >= 4) {
      return "Your high risk tolerance may not align with your short investment horizon. Consider adjusting your approach.";
    }
    if (horizon === "long" && risk <= 2) {
      return "A conservative risk approach with a long investment horizon may limit potential returns.";
    }
    return null;
  }, [formState.investmentHorizon, formState.riskTolerance]);

  // Validation
  const isFormValid = React.useMemo(() => {
    return (
      formState.investmentHorizon &&
      formState.investmentKnowledge &&
      formState.investmentExperience &&
      formState.investmentObjective &&
      formState.expectedReturn &&
      formState.liquidityNeeds
    );
  }, [formState]);

  // Update parent with validation status
  React.useEffect(() => {
    onUpdate({
      ...formState,
      isInvestmentStepValid: isFormValid,
      suitabilityWarning: suitabilityWarning,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formState, isFormValid, suitabilityWarning]);

  const getRiskLabel = (value: number) => {
    const labels = ["Very Conservative", "Conservative", "Moderate", "Growth", "Aggressive"];
    return labels[value - 1] || "Moderate";
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="mb-2 text-2xl font-bold text-brand-dark">Investment Profile</h2>
        <p className="text-brand-grayMed">
          Help us understand your investment experience and objectives to recommend suitable products.
        </p>
      </div>

      {/* Investment Horizon */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold text-brand-dark">Investment Horizon *</h3>
          <Info className="h-4 w-4 text-brand-grayMed" />
        </div>

        <RadioGroup value={formState.investmentHorizon} onValueChange={(value) => updateField("investmentHorizon", value)}>
          <div className="space-y-3">
            <div className="flex items-start space-x-3 rounded-lg border-2 border-gray-200 p-4 transition-colors hover:border-gray-300 data-[state=checked]:border-brand-gold data-[state=checked]:bg-brand-gold/5">
              <RadioGroupItem value="short" id="horizon-short" />
              <div className="flex-1">
                <Label htmlFor="horizon-short" className="cursor-pointer font-medium">
                  Short-term (0-3 years)
                </Label>
                <p className="text-sm text-brand-grayMed">
                  I may need access to my funds within 3 years
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3 rounded-lg border-2 border-gray-200 p-4 transition-colors hover:border-gray-300 data-[state=checked]:border-brand-gold data-[state=checked]:bg-brand-gold/5">
              <RadioGroupItem value="medium" id="horizon-medium" />
              <div className="flex-1">
                <Label htmlFor="horizon-medium" className="cursor-pointer font-medium">
                  Medium-term (3-7 years)
                </Label>
                <p className="text-sm text-brand-grayMed">
                  I can invest for 3-7 years without needing access
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3 rounded-lg border-2 border-gray-200 p-4 transition-colors hover:border-gray-300 data-[state=checked]:border-brand-gold data-[state=checked]:bg-brand-gold/5">
              <RadioGroupItem value="long" id="horizon-long" />
              <div className="flex-1">
                <Label htmlFor="horizon-long" className="cursor-pointer font-medium">
                  Long-term (7+ years)
                </Label>
                <p className="text-sm text-brand-grayMed">
                  I can invest for 7 years or more without needing access
                </p>
              </div>
            </div>
          </div>
        </RadioGroup>
      </div>

      {/* Investment Knowledge */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-brand-dark">Investment Knowledge *</h3>

        <RadioGroup value={formState.investmentKnowledge} onValueChange={(value) => updateField("investmentKnowledge", value)}>
          <div className="space-y-3">
            <div className="flex items-start space-x-3 rounded-lg border-2 border-gray-200 p-4 transition-colors hover:border-gray-300 data-[state=checked]:border-brand-gold data-[state=checked]:bg-brand-gold/5">
              <RadioGroupItem value="none" id="knowledge-none" />
              <div className="flex-1">
                <Label htmlFor="knowledge-none" className="cursor-pointer font-medium">
                  Limited or None
                </Label>
                <p className="text-sm text-brand-grayMed">
                  I have little to no knowledge of investment products
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3 rounded-lg border-2 border-gray-200 p-4 transition-colors hover:border-gray-300 data-[state=checked]:border-brand-gold data-[state=checked]:bg-brand-gold/5">
              <RadioGroupItem value="basic" id="knowledge-basic" />
              <div className="flex-1">
                <Label htmlFor="knowledge-basic" className="cursor-pointer font-medium">
                  Basic
                </Label>
                <p className="text-sm text-brand-grayMed">
                  I understand basic investment concepts (stocks, bonds, funds)
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3 rounded-lg border-2 border-gray-200 p-4 transition-colors hover:border-gray-300 data-[state=checked]:border-brand-gold data-[state=checked]:bg-brand-gold/5">
              <RadioGroupItem value="good" id="knowledge-good" />
              <div className="flex-1">
                <Label htmlFor="knowledge-good" className="cursor-pointer font-medium">
                  Good
                </Label>
                <p className="text-sm text-brand-grayMed">
                  I have good knowledge of various investment products and strategies
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3 rounded-lg border-2 border-gray-200 p-4 transition-colors hover:border-gray-300 data-[state=checked]:border-brand-gold data-[state=checked]:bg-brand-gold/5">
              <RadioGroupItem value="advanced" id="knowledge-advanced" />
              <div className="flex-1">
                <Label htmlFor="knowledge-advanced" className="cursor-pointer font-medium">
                  Advanced
                </Label>
                <p className="text-sm text-brand-grayMed">
                  I have extensive knowledge and experience with complex investment products
                </p>
              </div>
            </div>
          </div>
        </RadioGroup>
      </div>

      {/* Investment Experience */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-brand-dark">Investment Experience *</h3>

        <RadioGroup value={formState.investmentExperience} onValueChange={(value) => updateField("investmentExperience", value)}>
          <div className="space-y-3">
            <div className="flex items-start space-x-3 rounded-lg border-2 border-gray-200 p-4 transition-colors hover:border-gray-300 data-[state=checked]:border-brand-gold data-[state=checked]:bg-brand-gold/5">
              <RadioGroupItem value="none" id="experience-none" />
              <div className="flex-1">
                <Label htmlFor="experience-none" className="cursor-pointer font-medium">
                  No Experience
                </Label>
                <p className="text-sm text-brand-grayMed">
                  I have never invested before
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3 rounded-lg border-2 border-gray-200 p-4 transition-colors hover:border-gray-300 data-[state=checked]:border-brand-gold data-[state=checked]:bg-brand-gold/5">
              <RadioGroupItem value="limited" id="experience-limited" />
              <div className="flex-1">
                <Label htmlFor="experience-limited" className="cursor-pointer font-medium">
                  Limited (Less than 2 years)
                </Label>
                <p className="text-sm text-brand-grayMed">
                  I have invested occasionally or for a short period
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3 rounded-lg border-2 border-gray-200 p-4 transition-colors hover:border-gray-300 data-[state=checked]:border-brand-gold data-[state=checked]:bg-brand-gold/5">
              <RadioGroupItem value="moderate" id="experience-moderate" />
              <div className="flex-1">
                <Label htmlFor="experience-moderate" className="cursor-pointer font-medium">
                  Moderate (2-5 years)
                </Label>
                <p className="text-sm text-brand-grayMed">
                  I have been actively investing for 2-5 years
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3 rounded-lg border-2 border-gray-200 p-4 transition-colors hover:border-gray-300 data-[state=checked]:border-brand-gold data-[state=checked]:bg-brand-gold/5">
              <RadioGroupItem value="extensive" id="experience-extensive" />
              <div className="flex-1">
                <Label htmlFor="experience-extensive" className="cursor-pointer font-medium">
                  Extensive (5+ years)
                </Label>
                <p className="text-sm text-brand-grayMed">
                  I have been actively investing for over 5 years
                </p>
              </div>
            </div>
          </div>
        </RadioGroup>
      </div>

      {/* Risk Tolerance */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-brand-dark">Risk Tolerance *</h3>
          <span className="rounded-full bg-brand-gold/10 px-3 py-1 text-sm font-medium text-brand-gold">
            {getRiskLabel(formState.riskTolerance)}
          </span>
        </div>

        <div className="rounded-lg border border-brand-grayLight bg-gray-50 p-6">
          <p className="mb-6 text-sm text-brand-grayMed">
            How much risk are you willing to take with your investment? Higher risk can lead to higher potential
            returns, but also higher potential losses.
          </p>

          <div className="space-y-6">
            <Slider
              value={[formState.riskTolerance]}
              onValueChange={([value]) => updateField("riskTolerance", value)}
              min={1}
              max={5}
              step={1}
              className="w-full"
            />

            <div className="grid grid-cols-5 gap-2 text-xs text-center">
              <div className="text-brand-grayMed">Very Conservative</div>
              <div className="text-brand-grayMed">Conservative</div>
              <div className="text-brand-grayMed">Moderate</div>
              <div className="text-brand-grayMed">Growth</div>
              <div className="text-brand-grayMed">Aggressive</div>
            </div>
          </div>
        </div>

        {suitabilityWarning && (
          <Alert className="border-amber-200 bg-amber-50">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-sm text-amber-800">
              {suitabilityWarning}
            </AlertDescription>
          </Alert>
        )}
      </div>

      {/* Investment Objective */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-brand-dark">Investment Objective *</h3>

        <RadioGroup value={formState.investmentObjective} onValueChange={(value) => updateField("investmentObjective", value)}>
          <div className="space-y-3">
            <div className="flex items-start space-x-3 rounded-lg border-2 border-gray-200 p-4 transition-colors hover:border-gray-300 data-[state=checked]:border-brand-gold data-[state=checked]:bg-brand-gold/5">
              <RadioGroupItem value="preservation" id="objective-preservation" />
              <div className="flex-1">
                <Label htmlFor="objective-preservation" className="cursor-pointer font-medium">
                  Capital Preservation
                </Label>
                <p className="text-sm text-brand-grayMed">
                  Protect my capital with minimal risk, accepting lower returns
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3 rounded-lg border-2 border-gray-200 p-4 transition-colors hover:border-gray-300 data-[state=checked]:border-brand-gold data-[state=checked]:bg-brand-gold/5">
              <RadioGroupItem value="income" id="objective-income" />
              <div className="flex-1">
                <Label htmlFor="objective-income" className="cursor-pointer font-medium">
                  Income Generation
                </Label>
                <p className="text-sm text-brand-grayMed">
                  Generate regular income from my investments
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3 rounded-lg border-2 border-gray-200 p-4 transition-colors hover:border-gray-300 data-[state=checked]:border-brand-gold data-[state=checked]:bg-brand-gold/5">
              <RadioGroupItem value="balanced" id="objective-balanced" />
              <div className="flex-1">
                <Label htmlFor="objective-balanced" className="cursor-pointer font-medium">
                  Balanced Growth
                </Label>
                <p className="text-sm text-brand-grayMed">
                  Balance growth and income with moderate risk
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3 rounded-lg border-2 border-gray-200 p-4 transition-colors hover:border-gray-300 data-[state=checked]:border-brand-gold data-[state=checked]:bg-brand-gold/5">
              <RadioGroupItem value="growth" id="objective-growth" />
              <div className="flex-1">
                <Label htmlFor="objective-growth" className="cursor-pointer font-medium">
                  Capital Growth
                </Label>
                <p className="text-sm text-brand-grayMed">
                  Maximize long-term capital appreciation, accepting higher volatility
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3 rounded-lg border-2 border-gray-200 p-4 transition-colors hover:border-gray-300 data-[state=checked]:border-brand-gold data-[state=checked]:bg-brand-gold/5">
              <RadioGroupItem value="aggressive" id="objective-aggressive" />
              <div className="flex-1">
                <Label htmlFor="objective-aggressive" className="cursor-pointer font-medium">
                  Aggressive Growth
                </Label>
                <p className="text-sm text-brand-grayMed">
                  Seek maximum returns with high risk tolerance
                </p>
              </div>
            </div>
          </div>
        </RadioGroup>
      </div>

      {/* Expected Return */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-brand-dark">Expected Return *</h3>

        <RadioGroup value={formState.expectedReturn} onValueChange={(value) => updateField("expectedReturn", value)}>
          <div className="space-y-3">
            <div className="flex items-start space-x-3 rounded-lg border-2 border-gray-200 p-4 transition-colors hover:border-gray-300 data-[state=checked]:border-brand-gold data-[state=checked]:bg-brand-gold/5">
              <RadioGroupItem value="low" id="return-low" />
              <div className="flex-1">
                <Label htmlFor="return-low" className="cursor-pointer font-medium">
                  0-3% per year
                </Label>
                <p className="text-sm text-brand-grayMed">Low risk, stable returns</p>
              </div>
            </div>

            <div className="flex items-start space-x-3 rounded-lg border-2 border-gray-200 p-4 transition-colors hover:border-gray-300 data-[state=checked]:border-brand-gold data-[state=checked]:bg-brand-gold/5">
              <RadioGroupItem value="moderate" id="return-moderate" />
              <div className="flex-1">
                <Label htmlFor="return-moderate" className="cursor-pointer font-medium">
                  3-6% per year
                </Label>
                <p className="text-sm text-brand-grayMed">Moderate risk and returns</p>
              </div>
            </div>

            <div className="flex items-start space-x-3 rounded-lg border-2 border-gray-200 p-4 transition-colors hover:border-gray-300 data-[state=checked]:border-brand-gold data-[state=checked]:bg-brand-gold/5">
              <RadioGroupItem value="high" id="return-high" />
              <div className="flex-1">
                <Label htmlFor="return-high" className="cursor-pointer font-medium">
                  6-10% per year
                </Label>
                <p className="text-sm text-brand-grayMed">Higher risk for growth potential</p>
              </div>
            </div>

            <div className="flex items-start space-x-3 rounded-lg border-2 border-gray-200 p-4 transition-colors hover:border-gray-300 data-[state=checked]:border-brand-gold data-[state=checked]:bg-brand-gold/5">
              <RadioGroupItem value="very-high" id="return-very-high" />
              <div className="flex-1">
                <Label htmlFor="return-very-high" className="cursor-pointer font-medium">
                  10%+ per year
                </Label>
                <p className="text-sm text-brand-grayMed">High risk, high potential returns</p>
              </div>
            </div>
          </div>
        </RadioGroup>
      </div>

      {/* Liquidity Needs */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-brand-dark">Liquidity Needs *</h3>

        <RadioGroup value={formState.liquidityNeeds} onValueChange={(value) => updateField("liquidityNeeds", value)}>
          <div className="space-y-3">
            <div className="flex items-start space-x-3 rounded-lg border-2 border-gray-200 p-4 transition-colors hover:border-gray-300 data-[state=checked]:border-brand-gold data-[state=checked]:bg-brand-gold/5">
              <RadioGroupItem value="immediate" id="liquidity-immediate" />
              <div className="flex-1">
                <Label htmlFor="liquidity-immediate" className="cursor-pointer font-medium">
                  High - I may need access to funds soon
                </Label>
              </div>
            </div>

            <div className="flex items-start space-x-3 rounded-lg border-2 border-gray-200 p-4 transition-colors hover:border-gray-300 data-[state=checked]:border-brand-gold data-[state=checked]:bg-brand-gold/5">
              <RadioGroupItem value="medium" id="liquidity-medium" />
              <div className="flex-1">
                <Label htmlFor="liquidity-medium" className="cursor-pointer font-medium">
                  Medium - I might need partial access in a few years
                </Label>
              </div>
            </div>

            <div className="flex items-start space-x-3 rounded-lg border-2 border-gray-200 p-4 transition-colors hover:border-gray-300 data-[state=checked]:border-brand-gold data-[state=checked]:bg-brand-gold/5">
              <RadioGroupItem value="low" id="liquidity-low" />
              <div className="flex-1">
                <Label htmlFor="liquidity-low" className="cursor-pointer font-medium">
                  Low - I don't need access to these funds
                </Label>
              </div>
            </div>
          </div>
        </RadioGroup>
      </div>

      <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
        <div className="flex items-start gap-2">
          <Info className="mt-0.5 h-5 w-5 text-blue-600" />
          <div className="space-y-1 text-sm text-blue-800">
            <p className="font-semibold">MiFID II Suitability Assessment</p>
            <p>
              This questionnaire helps us assess whether our products are suitable for you based on your investment
              knowledge, experience, objectives, and financial situation, as required by EU MiFID II regulations.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
