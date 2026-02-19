"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Phone, Mail, MessageCircle, HelpCircle, FileText, Clock } from "lucide-react";
import ReactCountryFlag from "react-country-flag";
import { Hero } from "@/components/hero";
import { SectionHeading } from "@/components/section-heading";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { COUNTRIES } from "@/shared/lib/countries";

export default function SupportPage() {
  const t = useTranslations("supportPage");
  const [selectedPhoneCode, setSelectedPhoneCode] = React.useState<string>("+33");
  const [isDropdownOpen, setIsDropdownOpen] = React.useState<boolean>(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const faqs = [
    {
      question: t("faq.questions.openAccount.question"),
      answer: t("faq.questions.openAccount.answer"),
    },
    {
      question: t("faq.questions.documents.question"),
      answer: t("faq.questions.documents.answer"),
    },
    {
      question: t("faq.questions.fees.question"),
      answer: t("faq.questions.fees.answer"),
    },
    {
      question: t("faq.questions.currencies.question"),
      answer: t("faq.questions.currencies.answer"),
    },
    {
      question: t("faq.questions.contact.question"),
      answer: t("faq.questions.contact.answer"),
    },
  ];

  return (
    <>
      <Hero
        title={t("hero.title")}
        subtitle={t("hero.subtitle")}
      />

      {/* Contact Methods */}
      <section className="bg-white py-12">
        <div className="container mx-auto max-w-7xl px-6">
          <SectionHeading
            title={t("contactMethods.title")}
            description={t("contactMethods.description")}
            align="center"
            className="mb-12"
          />

          <div className="grid gap-8 md:grid-cols-3">
            {/* Phone Support */}
            <Card className="card-hover border-none text-center">
              <CardContent className="p-8">
                <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-full bg-brand-goldLight">
                  <Phone className="h-8 w-8 text-brand-goldDark" />
                </div>
                <h3 className="mb-3 text-xl font-bold text-brand-dark">{t("contactMethods.phone.title")}</h3>
                <p className="mb-4 text-sm text-brand-grayMed">
                  {t("contactMethods.phone.description")}
                </p>
                <p className="mb-2 text-lg font-semibold text-brand-gold">
                  {t("contactMethods.phone.number")}
                </p>
                <p className="text-xs text-brand-grayMed">{t("contactMethods.phone.hours")}</p>
              </CardContent>
            </Card>

            {/* Email Support */}
            <Card className="card-hover border-none text-center">
              <CardContent className="p-8">
                <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-full bg-brand-goldLight">
                  <Mail className="h-8 w-8 text-brand-goldDark" />
                </div>
                <h3 className="mb-3 text-xl font-bold text-brand-dark">{t("contactMethods.email.title")}</h3>
                <p className="mb-4 text-sm text-brand-grayMed">
                  {t("contactMethods.email.description")}
                </p>
                <a
                  href={`mailto:${t("contactMethods.email.address")}`}
                  className="mb-2 block text-lg font-semibold text-brand-gold hover:text-brand-goldDark"
                >
                  {t("contactMethods.email.address")}
                </a>
                <p className="text-xs text-brand-grayMed">{t("contactMethods.email.response")}</p>
              </CardContent>
            </Card>

            {/* Live Chat */}
            <Card className="card-hover border-none text-center">
              <CardContent className="p-8">
                <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-full bg-brand-goldLight">
                  <MessageCircle className="h-8 w-8 text-brand-goldDark" />
                </div>
                <h3 className="mb-3 text-xl font-bold text-brand-dark">{t("contactMethods.chat.title")}</h3>
                <p className="mb-4 text-sm text-brand-grayMed">
                  {t("contactMethods.chat.description")}
                </p>
                <Button variant="primary" className="w-full">
                  {t("contactMethods.chat.button")}
                </Button>
                <p className="mt-2 text-xs text-brand-grayMed">
                  {t("contactMethods.chat.availability")}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section className="bg-white py-12">
        <div className="container mx-auto max-w-4xl px-6">
          <SectionHeading
            title={t("contactForm.title")}
            description={t("contactForm.description")}
            align="center"
            className="mb-12"
          />

          <Card className="border-none shadow-elevated">
            <CardContent className="p-8">
              <form className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">
                      {t("contactForm.firstName")} <span className="text-red-600">*</span>
                    </Label>
                    <Input id="firstName" placeholder="John" required />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="lastName">
                      {t("contactForm.lastName")} <span className="text-red-600">*</span>
                    </Label>
                    <Input id="lastName" placeholder="Doe" required />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">
                    {t("contactForm.email")} <span className="text-red-600">*</span>
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="john.doe@example.com"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">{t("contactForm.phone")}</Label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-2 z-10">
                      <div ref={dropdownRef} className="relative">
                        <button
                          type="button"
                          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                          className="flex items-center gap-2 bg-transparent border-none text-sm font-medium focus:outline-none cursor-pointer"
                        >
                          <ReactCountryFlag
                            countryCode={COUNTRIES.find(c => c.phoneCode === selectedPhoneCode)?.code || "FR"}
                            svg
                            style={{
                              width: '1.5em',
                              height: '1.5em',
                            }}
                          />
                          <span>{selectedPhoneCode}</span>
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>

                        {isDropdownOpen && (
                          <div className="absolute top-full mt-1 left-0 w-64 max-h-60 overflow-y-auto bg-white border border-brand-grayLight rounded-lg shadow-lg z-50">
                            {COUNTRIES.map((country) => (
                              <button
                                key={country.code}
                                type="button"
                                onClick={() => {
                                  setSelectedPhoneCode(country.phoneCode);
                                  setIsDropdownOpen(false);
                                }}
                                className="w-full flex items-center gap-3 px-3 py-2 hover:bg-gray-50 text-left text-sm"
                              >
                                <ReactCountryFlag
                                  countryCode={country.code}
                                  svg
                                  style={{
                                    width: '1.5em',
                                    height: '1.5em',
                                  }}
                                />
                                <span className="font-medium">{country.phoneCode}</span>
                                <span className="text-gray-600 text-xs">{country.name}</span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                      <span className="text-brand-grayLight">|</span>
                    </div>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="123456789"
                      className="pl-32"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subject">
                    {t("contactForm.subject")} <span className="text-red-600">*</span>
                  </Label>
                  <select
                    id="subject"
                    required
                    className="flex h-12 w-full rounded-xl border border-brand-grayLight bg-white px-4 py-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold"
                  >
                    <option value="">{t("contactForm.selectSubject")}</option>
                    <option value="account">{t("contactForm.subjects.account")}</option>
                    <option value="technical">{t("contactForm.subjects.technical")}</option>
                    <option value="company">{t("contactForm.subjects.company")}</option>
                    <option value="billing">{t("contactForm.subjects.billing")}</option>
                    <option value="other">{t("contactForm.subjects.other")}</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">
                    {t("contactForm.message")} <span className="text-red-600">*</span>
                  </Label>
                  <textarea
                    id="message"
                    rows={6}
                    required
                    className="flex w-full rounded-xl border border-brand-grayLight bg-white px-4 py-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold"
                    placeholder={t("contactForm.messagePlaceholder")}
                  />
                </div>

                <Button type="submit" variant="primary" size="lg" className="w-full">
                  {t("contactForm.submit")}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="bg-white py-12">
        <div className="container mx-auto max-w-4xl px-6">
          <SectionHeading
            title={t("faq.title")}
            description={t("faq.description")}
            align="center"
            className="mb-12"
          />

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <Card key={index} className="border-none">
                <CardHeader>
                  <CardTitle className="flex items-start gap-3 text-lg">
                    <HelpCircle className="h-6 w-6 flex-shrink-0 text-brand-gold" />
                    <span>{faq.question}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="pl-9 text-sm text-brand-grayMed">{faq.answer}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Additional Resources */}
      <section className="bg-white py-12">
        <div className="container mx-auto max-w-7xl px-6">
          <SectionHeading
            title={t("resources.title")}
            description={t("resources.description")}
            align="center"
            className="mb-12"
          />

          <div className="grid gap-8 md:grid-cols-3">
            <Card className="card-hover border-none text-center">
              <CardContent className="p-8">
                <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-full bg-brand-goldLight">
                  <FileText className="h-8 w-8 text-brand-goldDark" />
                </div>
                <h3 className="mb-3 text-xl font-bold text-brand-dark">
                  {t("resources.documentation.title")}
                </h3>
                <p className="mb-6 text-sm text-brand-grayMed">
                  {t("resources.documentation.description")}
                </p>
                <Button variant="outline">{t("resources.documentation.button")}</Button>
              </CardContent>
            </Card>

            <Card className="card-hover border-none text-center">
              <CardContent className="p-8">
                <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-full bg-brand-goldLight">
                  <HelpCircle className="h-8 w-8 text-brand-goldDark" />
                </div>
                <h3 className="mb-3 text-xl font-bold text-brand-dark">{t("resources.helpCenter.title")}</h3>
                <p className="mb-6 text-sm text-brand-grayMed">
                  {t("resources.helpCenter.description")}
                </p>
                <Button variant="outline">{t("resources.helpCenter.button")}</Button>
              </CardContent>
            </Card>

            <Card className="card-hover border-none text-center">
              <CardContent className="p-8">
                <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-full bg-brand-goldLight">
                  <Clock className="h-8 w-8 text-brand-goldDark" />
                </div>
                <h3 className="mb-3 text-xl font-bold text-brand-dark">
                  {t("resources.status.title")}
                </h3>
                <p className="mb-6 text-sm text-brand-grayMed">
                  {t("resources.status.description")}
                </p>
                <Button variant="outline">{t("resources.status.button")}</Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Office Locations */}
      <section className="bg-white py-12">
        <div className="container mx-auto max-w-7xl px-6">
          <SectionHeading
            title={t("offices.title")}
            description={t("offices.description")}
            align="center"
            className="mb-12"
          />

          <div className="grid gap-8 md:grid-cols-2">
            <Card className="border-none">
              <CardContent className="p-8">
                <h3 className="mb-4 text-xl font-bold text-brand-dark">
                  {t("offices.luxembourg.title")}
                </h3>
                <div className="space-y-2 text-sm text-brand-grayMed">
                  <p>{t("offices.luxembourg.address")}</p>
                  <p>{t("offices.luxembourg.city")}</p>
                  <p>{t("offices.luxembourg.country")}</p>
                  <p className="mt-4">
                    <strong className="text-brand-dark">{t("offices.luxembourg.phone")}:</strong> +352 20 30 40 50
                  </p>
                  <p>
                    <strong className="text-brand-dark">{t("offices.luxembourg.email")}:</strong>{" "}
                    luxembourg@opulanz.com
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none">
              <CardContent className="p-8">
                <h3 className="mb-4 text-xl font-bold text-brand-dark">
                  {t("offices.france.title")}
                </h3>
                <div className="space-y-2 text-sm text-brand-grayMed">
                  <p>{t("offices.france.address")}</p>
                  <p>{t("offices.france.city")}</p>
                  <p>{t("offices.france.country")}</p>
                  <p className="mt-4">
                    <strong className="text-brand-dark">{t("offices.france.phone")}:</strong> +33 1 23 45 67 89
                  </p>
                  <p>
                    <strong className="text-brand-dark">{t("offices.france.email")}:</strong>{" "}
                    france@opulanz.com
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </>
  );
}
