"use client";

import * as React from "react";
import { useTranslations, useLocale } from "next-intl";
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
  const t = useTranslations();
  const locale = useLocale();
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

  return (
    <>
      <Hero
        title="How Can We Help You?"
        subtitle="Get in touch with our support team for any questions or assistance you need"
      />

      {/* Contact Methods */}
      <section className="bg-white py-20">
        <div className="container mx-auto max-w-7xl px-6">
          <SectionHeading
            title="Get in Touch"
            description="Choose your preferred way to reach us"
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
                <h3 className="mb-3 text-xl font-bold text-brand-dark">Phone Support</h3>
                <p className="mb-4 text-sm text-brand-grayMed">
                  Speak directly with our support team
                </p>
                <p className="mb-2 text-lg font-semibold text-brand-gold">
                  +352 20 30 40 50
                </p>
                <p className="text-xs text-brand-grayMed">Mon-Fri, 9:00-18:00 CET</p>
              </CardContent>
            </Card>

            {/* Email Support */}
            <Card className="card-hover border-none text-center">
              <CardContent className="p-8">
                <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-full bg-brand-goldLight">
                  <Mail className="h-8 w-8 text-brand-goldDark" />
                </div>
                <h3 className="mb-3 text-xl font-bold text-brand-dark">Email Support</h3>
                <p className="mb-4 text-sm text-brand-grayMed">
                  Send us your questions anytime
                </p>
                <a
                  href="mailto:support@opulanz.com"
                  className="mb-2 block text-lg font-semibold text-brand-gold hover:text-brand-goldDark"
                >
                  support@opulanz.com
                </a>
                <p className="text-xs text-brand-grayMed">Response within 24 hours</p>
              </CardContent>
            </Card>

            {/* Live Chat */}
            <Card className="card-hover border-none text-center">
              <CardContent className="p-8">
                <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-full bg-brand-goldLight">
                  <MessageCircle className="h-8 w-8 text-brand-goldDark" />
                </div>
                <h3 className="mb-3 text-xl font-bold text-brand-dark">Live Chat</h3>
                <p className="mb-4 text-sm text-brand-grayMed">
                  Chat with us in real-time
                </p>
                <Button variant="primary" className="w-full">
                  Start Chat
                </Button>
                <p className="mt-2 text-xs text-brand-grayMed">
                  Available during business hours
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section className="bg-white py-20">
        <div className="container mx-auto max-w-4xl px-6">
          <SectionHeading
            title="Send Us a Message"
            description="Fill out the form below and we'll get back to you as soon as possible"
            align="center"
            className="mb-12"
          />

          <Card className="border-none shadow-elevated">
            <CardContent className="p-8">
              <form className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">
                      First Name <span className="text-red-600">*</span>
                    </Label>
                    <Input id="firstName" placeholder="John" required />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="lastName">
                      Last Name <span className="text-red-600">*</span>
                    </Label>
                    <Input id="lastName" placeholder="Doe" required />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">
                    Email <span className="text-red-600">*</span>
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="john.doe@example.com"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
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
                    Subject <span className="text-red-600">*</span>
                  </Label>
                  <select
                    id="subject"
                    required
                    className="flex h-12 w-full rounded-xl border border-brand-grayLight bg-white px-4 py-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold"
                  >
                    <option value="">Select a subject</option>
                    <option value="account">Account Questions</option>
                    <option value="technical">Technical Support</option>
                    <option value="company">Company Formation</option>
                    <option value="billing">Billing & Payments</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">
                    Message <span className="text-red-600">*</span>
                  </Label>
                  <textarea
                    id="message"
                    rows={6}
                    required
                    className="flex w-full rounded-xl border border-brand-grayLight bg-white px-4 py-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold"
                    placeholder="How can we help you?"
                  />
                </div>

                <Button type="submit" variant="primary" size="lg" className="w-full">
                  Send Message
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="bg-white py-20">
        <div className="container mx-auto max-w-4xl px-6">
          <SectionHeading
            title="Frequently Asked Questions"
            description="Find quick answers to common questions"
            align="center"
            className="mb-12"
          />

          <div className="space-y-4">
            {[
              {
                question: "How long does it take to open an account?",
                answer:
                  "Individual accounts can be opened within 24-48 hours after document verification. Business accounts typically take 3-5 business days.",
              },
              {
                question: "What documents do I need to open an account?",
                answer:
                  "For individual accounts: valid passport or ID card, proof of address (utility bill or bank statement), and source of funds documentation. For business accounts: company registration documents, beneficial owner information, and business plan.",
              },
              {
                question: "Are there any monthly fees?",
                answer:
                  "We offer transparent pricing with no hidden fees. Monthly fees vary by account type. Individual accounts start from €10/month, and business accounts from €25/month.",
              },
              {
                question: "Which currencies do you support?",
                answer:
                  "We support EUR, USD, GBP, CHF, and other major currencies. Multi-currency IBANs are available for all account types.",
              },
              {
                question: "How can I contact support?",
                answer:
                  "You can reach us via phone at +352 20 30 40 50, email at support@opulanz.com, or live chat during business hours (Mon-Fri, 9:00-18:00 CET).",
              },
            ].map((faq, index) => (
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
      <section className="bg-white py-20">
        <div className="container mx-auto max-w-7xl px-6">
          <SectionHeading
            title="Additional Resources"
            description="Explore our help center and documentation"
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
                  Documentation
                </h3>
                <p className="mb-6 text-sm text-brand-grayMed">
                  Browse our comprehensive guides and tutorials
                </p>
                <Button variant="outline">View Docs</Button>
              </CardContent>
            </Card>

            <Card className="card-hover border-none text-center">
              <CardContent className="p-8">
                <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-full bg-brand-goldLight">
                  <HelpCircle className="h-8 w-8 text-brand-goldDark" />
                </div>
                <h3 className="mb-3 text-xl font-bold text-brand-dark">Help Center</h3>
                <p className="mb-6 text-sm text-brand-grayMed">
                  Search our knowledge base for answers
                </p>
                <Button variant="outline">Visit Help Center</Button>
              </CardContent>
            </Card>

            <Card className="card-hover border-none text-center">
              <CardContent className="p-8">
                <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-full bg-brand-goldLight">
                  <Clock className="h-8 w-8 text-brand-goldDark" />
                </div>
                <h3 className="mb-3 text-xl font-bold text-brand-dark">
                  Service Status
                </h3>
                <p className="mb-6 text-sm text-brand-grayMed">
                  Check the status of our services
                </p>
                <Button variant="outline">View Status</Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Office Locations */}
      <section className="bg-white py-20">
        <div className="container mx-auto max-w-7xl px-6">
          <SectionHeading
            title="Our Offices"
            description="Visit us at one of our locations"
            align="center"
            className="mb-12"
          />

          <div className="grid gap-8 md:grid-cols-2">
            <Card className="border-none">
              <CardContent className="p-8">
                <h3 className="mb-4 text-xl font-bold text-brand-dark">
                  Luxembourg Office
                </h3>
                <div className="space-y-2 text-sm text-brand-grayMed">
                  <p>1, Rue de la Poste</p>
                  <p>L-2346 Luxembourg</p>
                  <p>Luxembourg</p>
                  <p className="mt-4">
                    <strong className="text-brand-dark">Phone:</strong> +352 20 30 40 50
                  </p>
                  <p>
                    <strong className="text-brand-dark">Email:</strong>{" "}
                    luxembourg@opulanz.com
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none">
              <CardContent className="p-8">
                <h3 className="mb-4 text-xl font-bold text-brand-dark">
                  France Office
                </h3>
                <div className="space-y-2 text-sm text-brand-grayMed">
                  <p>25, Rue de la Paix</p>
                  <p>75002 Paris</p>
                  <p>France</p>
                  <p className="mt-4">
                    <strong className="text-brand-dark">Phone:</strong> +33 1 23 45 67 89
                  </p>
                  <p>
                    <strong className="text-brand-dark">Email:</strong>{" "}
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
