"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslations, useLocale } from "next-intl";
import { Hero } from "@/components/hero";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Calculator, FileText } from "lucide-react";

const getStartedSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  phoneNumber: z.string().min(8, "Please enter a valid phone number"),
  email: z.string().email("Please enter a valid email address"),
  serviceType: z.enum(["accounting", "invoicing"], {
    required_error: "Please select a service type",
  }),
});

type GetStartedFormData = z.infer<typeof getStartedSchema>;

export default function GetStartedPage() {
  const t = useTranslations();
  const locale = useLocale();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<GetStartedFormData>({
    resolver: zodResolver(getStartedSchema),
  });

  const serviceType = watch("serviceType");

  const onSubmit = async (data: GetStartedFormData) => {
    setIsSubmitting(true);

    // Simulate a brief delay to show the form is processing
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Redirect based on service type
    if (data.serviceType === "accounting") {
      window.location.href = "https://www.horussoftware.be/pme/";
    } else if (data.serviceType === "invoicing") {
      window.location.href = "https://www.falco-app.be/";
    }
  };

  return (
    <>
      <Hero
        title="Get Started with Our Services"
        subtitle="Fill out the form below to begin your journey with Opulanz accounting and invoicing solutions"
      />

      <section className="bg-white py-20">
        <div className="container mx-auto max-w-2xl px-6">
          <Card className="border-none shadow-lg">
            <CardContent className="p-8 md:p-12">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* First Name */}
                <div>
                  <Label htmlFor="firstName" className="text-brand-dark">
                    First Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="firstName"
                    type="text"
                    {...register("firstName")}
                    className="mt-2"
                    placeholder="Enter your first name"
                    disabled={isSubmitting}
                  />
                  {errors.firstName && (
                    <p className="mt-1 text-sm text-red-500">{errors.firstName.message}</p>
                  )}
                </div>

                {/* Last Name */}
                <div>
                  <Label htmlFor="lastName" className="text-brand-dark">
                    Last Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="lastName"
                    type="text"
                    {...register("lastName")}
                    className="mt-2"
                    placeholder="Enter your last name"
                    disabled={isSubmitting}
                  />
                  {errors.lastName && (
                    <p className="mt-1 text-sm text-red-500">{errors.lastName.message}</p>
                  )}
                </div>

                {/* Phone Number */}
                <div>
                  <Label htmlFor="phoneNumber" className="text-brand-dark">
                    Phone Number <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="phoneNumber"
                    type="tel"
                    {...register("phoneNumber")}
                    className="mt-2"
                    placeholder="+352 123 456 789"
                    disabled={isSubmitting}
                  />
                  {errors.phoneNumber && (
                    <p className="mt-1 text-sm text-red-500">{errors.phoneNumber.message}</p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <Label htmlFor="email" className="text-brand-dark">
                    Email Address <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    {...register("email")}
                    className="mt-2"
                    placeholder="your.email@example.com"
                    disabled={isSubmitting}
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>
                  )}
                </div>

                {/* Service Type Selection */}
                <div>
                  <Label className="mb-4 block text-brand-dark">
                    Select Service Type <span className="text-red-500">*</span>
                  </Label>
                  <RadioGroup
                    value={serviceType}
                    onValueChange={(value) => setValue("serviceType", value as "accounting" | "invoicing")}
                    className="space-y-4"
                    disabled={isSubmitting}
                  >
                    {/* Accounting Option */}
                    <div
                      className={`relative flex cursor-pointer items-start gap-4 rounded-lg border-2 p-4 transition-all ${
                        serviceType === "accounting"
                          ? "border-brand-gold bg-brand-goldLight/10"
                          : "border-brand-grayLight hover:border-brand-gold/50"
                      }`}
                      onClick={() => !isSubmitting && setValue("serviceType", "accounting")}
                    >
                      <RadioGroupItem value="accounting" id="accounting" className="mt-1" />
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-brand-gold/10">
                            <Calculator className="h-5 w-5 text-brand-gold" />
                          </div>
                          <Label
                            htmlFor="accounting"
                            className="cursor-pointer text-lg font-semibold text-brand-dark"
                          >
                            Accounting Services
                          </Label>
                        </div>
                        <p className="mt-2 text-sm text-brand-grayMed">
                          Comprehensive bookkeeping, financial reporting, and compliance services for your business.
                        </p>
                      </div>
                    </div>

                    {/* Invoicing Option */}
                    <div
                      className={`relative flex cursor-pointer items-start gap-4 rounded-lg border-2 p-4 transition-all ${
                        serviceType === "invoicing"
                          ? "border-brand-gold bg-brand-goldLight/10"
                          : "border-brand-grayLight hover:border-brand-gold/50"
                      }`}
                      onClick={() => !isSubmitting && setValue("serviceType", "invoicing")}
                    >
                      <RadioGroupItem value="invoicing" id="invoicing" className="mt-1" />
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-brand-gold/10">
                            <FileText className="h-5 w-5 text-brand-gold" />
                          </div>
                          <Label
                            htmlFor="invoicing"
                            className="cursor-pointer text-lg font-semibold text-brand-dark"
                          >
                            Invoicing Services
                          </Label>
                        </div>
                        <p className="mt-2 text-sm text-brand-grayMed">
                          Professional invoicing solution with automated payment tracking and reminders.
                        </p>
                      </div>
                    </div>
                  </RadioGroup>
                  {errors.serviceType && (
                    <p className="mt-2 text-sm text-red-500">{errors.serviceType.message}</p>
                  )}
                </div>

                {/* Submit Button */}
                <div className="pt-4">
                  <Button
                    type="submit"
                    size="lg"
                    className="w-full bg-brand-gold text-white hover:bg-brand-goldDark"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Processing..." : "Continue to Service"}
                  </Button>
                </div>

                {/* Info Text */}
                <p className="text-center text-xs text-brand-grayMed">
                  By submitting this form, you agree to be redirected to our trusted partner platform
                  to complete your service setup.
                </p>
              </form>
            </CardContent>
          </Card>

          {/* Service Information Cards */}
          <div className="mt-12 grid gap-6 md:grid-cols-2">
            <Card className="border-brand-grayLight/30">
              <CardContent className="p-6">
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-brand-gold/10">
                  <Calculator className="h-6 w-6 text-brand-gold" />
                </div>
                <h3 className="mb-2 text-lg font-bold text-brand-dark">Accounting Services</h3>
                <p className="mb-3 text-sm text-brand-grayMed">
                  Complete accounting solution including:
                </p>
                <ul className="space-y-1 text-sm text-brand-grayMed">
                  <li>• Bookkeeping & financial records</li>
                  <li>• Tax compliance & reporting</li>
                  <li>• Financial analysis & insights</li>
                  <li>• Payroll management</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-brand-grayLight/30">
              <CardContent className="p-6">
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-brand-gold/10">
                  <FileText className="h-6 w-6 text-brand-gold" />
                </div>
                <h3 className="mb-2 text-lg font-bold text-brand-dark">Invoicing Services</h3>
                <p className="mb-3 text-sm text-brand-grayMed">
                  Professional invoicing platform featuring:
                </p>
                <ul className="space-y-1 text-sm text-brand-grayMed">
                  <li>• Automated invoice generation</li>
                  <li>• Payment tracking & reminders</li>
                  <li>• Multi-currency support</li>
                  <li>• Client management tools</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </>
  );
}
