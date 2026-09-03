"use client";

import * as React from "react";
import Link from "next/link";
import {
  PieChart, BarChart3, Users, CheckCircle, ChevronDown,
  Target, FileText, ShieldCheck, TrendingUp, ClipboardList,
  BookOpen, ArrowRight, AlertCircle, Calendar,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { Hero } from "@/components/hero";
import { SectionHeading } from "@/components/section-heading";
import { Button } from "@/components/ui/button";
import { IATTechSection } from "@/components/investment-advisory-test/iat-tech-section";

// ---------------------------------------------------------------------------
// Static content
// ---------------------------------------------------------------------------

const BENEFITS = [
  {
    icon: Target,
    title: "Personalised Assessment",
    description: "Review your objectives, experience, income, assets, commitments, and investment preferences.",
  },
  {
    icon: Users,
    title: "Professional Guidance",
    description: "Discuss your financial situation with an AMF-certified investment advisor.",
  },
  {
    icon: FileText,
    title: "Documented Recommendations",
    description: "Receive a formal suitability report explaining the recommendations made during the advisory process.",
  },
];

const PROCESS_STEPS = [
  {
    num: 1,
    title: "Complete Your Investor Profile",
    description: "Answer questions about your knowledge, experience, financial situation, objectives, investment horizon, liquidity needs, and risk tolerance.",
  },
  {
    num: 2,
    title: "Provide Supporting Information",
    description: "Securely provide relevant information, including your current portfolio, income details, and any personal or financial constraints.",
  },
  {
    num: 3,
    title: "Meet Your Advisor",
    description: "Book a consultation with an AMF-certified advisor to review your circumstances and discuss suitable investment options.",
  },
  {
    num: 4,
    title: "Receive and Sign Your Report",
    description: "Receive your suitability report in PDF format and review and sign it electronically.",
  },
];

const PROFILE_ITEMS = [
  "Investment objectives", "Investment time horizon", "Knowledge and experience",
  "Current portfolio", "Income and financial commitments", "Liquidity requirements",
  "Capacity to bear losses", "Risk tolerance", "Investment restrictions",
  "Sustainability preferences, where applicable",
];

const DOCUMENTS_INFO = [
  { icon: BarChart3, label: "Current investment portfolio" },
  { icon: TrendingUp, label: "Income information" },
  { icon: PieChart, label: "Assets and financial commitments" },
  { icon: FileText, label: "Existing investment statements" },
  { icon: ShieldCheck, label: "Identification and compliance documents" },
  { icon: ClipboardList, label: "Investment restriction information" },
  { icon: BookOpen, label: "Additional documents requested by the advisor" },
];

const FAQ_ITEMS = [
  {
    q: "Who provides the investment advisory service?",
    a: "Investment advisory services are provided by Advensys Insurance Finance, a regulated firm in France operating under AMF supervision. Opulanz facilitates access to this service on behalf of clients.",
  },
  {
    q: "What information will I need to provide?",
    a: "You will be asked to complete a MiFID II investor profile questionnaire covering your objectives, experience, financial situation, time horizon, liquidity needs, and risk tolerance.",
  },
  {
    q: "Why is a MiFID II questionnaire required?",
    a: "MiFID II regulations require investment advisors to gather sufficient information about a client's circumstances before providing a personal recommendation.",
  },
  {
    q: "What is a suitability report?",
    a: "A formal document explaining the client profile considered, the recommendations discussed, the associated risks, and why a proposed approach may be suitable for your circumstances.",
  },
  {
    q: "Does completing the questionnaire guarantee a recommendation?",
    a: "No. A recommendation will only be provided if the advisor determines that a suitable investment approach can be identified based on the information you provide.",
  },
  {
    q: "Can I update my information before the consultation?",
    a: "Yes. You can update the information provided at any time before the consultation takes place.",
  },
  {
    q: "How will my documents be protected?",
    a: "All documents and personal information are handled in accordance with applicable data protection regulations, including the GDPR.",
  },
  {
    q: "Is the service available in every country?",
    a: "The investment advisory service is currently designed for clients resident in France and Luxembourg.",
  },
];

// ---------------------------------------------------------------------------
// FAQ accordion item
// ---------------------------------------------------------------------------

function FaqItem({ question, answer, index }: { question: string; answer: string; index: number }) {
  const [open, setOpen] = React.useState(false);
  const id = `faq-iat-${index}`;
  return (
    <div className="border-b border-brand-grayLight last:border-b-0">
      <button
        id={`${id}-trigger`}
        aria-expanded={open}
        aria-controls={`${id}-panel`}
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between gap-4 py-5 text-left text-sm font-semibold text-brand-dark hover:text-brand-gold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold"
      >
        <span>{question}</span>
        <ChevronDown className={`h-5 w-5 flex-shrink-0 text-brand-gold transition-transform ${open ? "rotate-180" : ""}`} aria-hidden="true" />
      </button>
      <div id={`${id}-panel`} role="region" aria-labelledby={`${id}-trigger`} hidden={!open} className="pb-5 text-sm leading-relaxed text-brand-grayMed">
        {answer}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// MAIN PAGE
// ---------------------------------------------------------------------------

export function IATPageContent({
  params,
}: {
  params: { locale: string };
}) {
  const { locale } = params;
  const t = useTranslations("iat");
  const p = useTranslations("investmentAdvisory.page");

  const applyHref = `/${locale}/investment-advisory-test/apply`;

  return (
    <>
      {/* Test badge */}
      <div className="bg-amber-50 border-b border-amber-200 py-2 text-center">
        <span className="inline-flex items-center gap-2 text-xs font-semibold text-amber-800">
          <AlertCircle className="h-3.5 w-3.5" aria-hidden="true" />
          Internal Review Prototype — not published, not linked from any live page
        </span>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* HERO                                                                 */}
      {/* ------------------------------------------------------------------ */}
      <Hero
        title="Investment Guidance Built Around Your Goals"
        subtitle="Meet with an AMF-certified advisor to review your objectives, financial situation, investment experience, time horizon, and risk profile. Receive personalised recommendations supported by a formal suitability report."
        primaryCta={{
          label: p("hero.scheduleMeeting"),
          href: `/${locale}/investment-advisory/schedule`,
        }}
        secondaryCta={{
          label: "Start Your Advisory Request",
          href: applyHref,
        }}
        tertiaryCta={{
          label: "How It Works",
          href: "#process",
        }}
      />
      <div className="bg-white py-3 text-center text-xs text-brand-grayMed border-b border-brand-grayLight">
        Advisory services provided by Advensys Insurance Finance, France.
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* INTRODUCTION                                                         */}
      {/* ------------------------------------------------------------------ */}
      <section className="relative bg-gradient-to-b from-white to-gray-50 py-12 md:py-20 overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-gold/5 rounded-full blur-3xl pointer-events-none" />
        <div className="container mx-auto max-w-7xl px-6 relative z-10">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-start">
            <div>
              <SectionHeading overline="OUR APPROACH" title="Personalised Advice for Important Investment Decisions" align="left" className="mb-0" />
              <p className="mt-6 text-brand-grayMed leading-relaxed">
                Investment decisions should reflect more than expected returns. Our advisory process considers your financial objectives, experience, investment horizon, liquidity needs, personal constraints, and ability to accept risk.
              </p>
              <p className="mt-4 text-brand-grayMed leading-relaxed">
                Through a structured consultation and MiFID II assessment, your advisor can evaluate whether proposed investment solutions are appropriate for your circumstances.
              </p>
            </div>
            <div className="grid gap-4">
              {BENEFITS.map(({ icon: Icon, title, description }) => (
                <div key={title} className="group flex gap-4 rounded-2xl border border-brand-grayLight bg-white p-5 shadow-sm transition-all hover:border-brand-gold/40 hover:shadow-md">
                  <div className="flex-shrink-0 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-brand-gold/10 group-hover:bg-brand-gold/20 transition-colors">
                    <Icon className="h-5 w-5 text-brand-gold" aria-hidden="true" />
                  </div>
                  <div>
                    <h3 className="mb-1 font-semibold text-brand-dark">{title}</h3>
                    <p className="text-sm text-brand-grayMed leading-relaxed">{description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* HOW IT WORKS                                                         */}
      {/* ------------------------------------------------------------------ */}
      <section id="process" className="relative bg-white py-12 md:py-20 overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#f0f0f0_1px,transparent_1px),linear-gradient(to_bottom,#f0f0f0_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,#000_70%,transparent_110%)] opacity-20 pointer-events-none" />
        <div className="container mx-auto max-w-7xl px-6 relative z-10">
          <SectionHeading overline="THE PROCESS" title="Your Investment Advisory Journey" className="mb-12" />
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {PROCESS_STEPS.map((s, idx) => (
              <div key={s.num} className="group relative text-center">
                {idx < PROCESS_STEPS.length - 1 && (
                  <div className="hidden lg:block absolute top-8 left-full w-full h-0.5 -translate-x-1/2 bg-gradient-to-r from-brand-gold/40 to-brand-gold/10 z-0" />
                )}
                <div className="relative z-10">
                  <div className="relative inline-block mb-4">
                    <div className="absolute inset-0 bg-brand-gold rounded-full blur-xl opacity-30 group-hover:opacity-50 transition-opacity" />
                    <div className="relative inline-flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-brand-gold to-brand-goldDark text-white text-xl font-bold shadow-lg group-hover:scale-110 transition-transform duration-300">
                      {s.num}
                    </div>
                  </div>
                  <h3 className="mb-2 text-base font-bold text-brand-dark group-hover:text-brand-gold transition-colors">{s.title}</h3>
                  <p className="text-sm text-brand-grayMed leading-relaxed">{s.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* INVESTOR PROFILE OVERVIEW                                           */}
      {/* ------------------------------------------------------------------ */}
      <section className="bg-gray-50 py-12 md:py-20">
        <div className="container mx-auto max-w-7xl px-6">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-start">
            <div>
              <SectionHeading overline="MIFID II ASSESSMENT" title="A Structured MiFID II Assessment" description="Before recommendations can be provided, we need to understand your financial profile and investment needs." align="left" className="mb-0" />
            </div>
            <div className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                {PROFILE_ITEMS.map((item) => (
                  <div key={item} className="flex items-start gap-2.5 rounded-xl border border-brand-grayLight bg-white px-4 py-3 shadow-sm">
                    <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-brand-gold" aria-hidden="true" />
                    <span className="text-sm text-brand-dark">{item}</span>
                  </div>
                ))}
              </div>
              <div className="rounded-xl border border-brand-gold/30 bg-brand-gold/5 p-4">
                <p className="text-sm text-brand-dark leading-relaxed">
                  <strong>Please note: </strong>Your responses help the advisor assess whether a recommendation is suitable for your circumstances. Completing the questionnaire does not guarantee that a particular investment product will be recommended.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* DOCUMENTS OVERVIEW                                                   */}
      {/* ------------------------------------------------------------------ */}
      <section className="bg-white py-12 md:py-20">
        <div className="container mx-auto max-w-7xl px-6">
          <SectionHeading overline="DOCUMENTATION" title="Information You May Be Asked to Provide" className="mb-10" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 mb-6">
            {DOCUMENTS_INFO.map(({ icon: Icon, label }) => (
              <div key={label} className="group flex items-start gap-3 rounded-xl border border-brand-grayLight bg-gray-50 p-4 transition-all hover:border-brand-gold/40 hover:bg-white hover:shadow-sm">
                <div className="flex-shrink-0 inline-flex h-9 w-9 items-center justify-center rounded-lg bg-brand-gold/10 group-hover:bg-brand-gold/20 transition-colors">
                  <Icon className="h-4 w-4 text-brand-gold" aria-hidden="true" />
                </div>
                <span className="text-sm font-medium text-brand-dark leading-snug pt-1">{label}</span>
              </div>
            ))}
          </div>
          <p className="text-sm text-brand-grayMed max-w-2xl mx-auto text-center">
            The exact documentation required may depend on your profile, country of residence, and the nature of the advisory request.
          </p>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* START CTA                                                            */}
      {/* ------------------------------------------------------------------ */}
      <section className="bg-gray-50 py-12 md:py-16">
        <div className="container mx-auto max-w-3xl px-6 text-center">
          <div className="rounded-2xl border-2 border-brand-gold/30 bg-white p-8 shadow-sm">
            <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-full bg-brand-gold/10">
              <Target className="h-7 w-7 text-brand-gold" />
            </div>
            <h2 className="mb-3 text-2xl font-bold text-brand-dark">{t("wizard.startCTA")}</h2>
            <p className="mb-6 text-brand-grayMed text-sm max-w-lg mx-auto">
              {t("wizard.startDesc")}
            </p>
            <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <Button asChild variant="primary" size="lg">
                <Link href={`/${locale}/investment-advisory/schedule`}>
                  <Calendar className="mr-2 h-4 w-4" />
                  {p("hero.scheduleMeeting")}
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href={applyHref}>
                  {t("wizard.startBtn")}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* REGULATORY NOTICE                                                    */}
      {/* ------------------------------------------------------------------ */}
      <section className="bg-gray-50 py-12 md:py-16">
        <div className="container mx-auto max-w-4xl px-6">
          <SectionHeading overline="IMPORTANT INFORMATION" title="Regulatory Notice" className="mb-8" />
          <div className="rounded-2xl border border-brand-grayLight bg-white p-6 md:p-8 shadow-sm space-y-4">
            {[
              "Investment advisory services are provided by Advensys Insurance Finance in France.",
              "Investment values can rise or fall. Past performance does not guarantee future results.",
              "Any recommendation must be based on an assessment of the client's individual circumstances, objectives, knowledge, experience, financial situation, risk tolerance, and capacity to bear losses.",
              "The information presented on this test page is general and does not constitute personal investment advice, an offer, or a recommendation to purchase or sell any financial instrument.",
              "This page is a management-review prototype and does not confirm that the service is currently available.",
            ].map((text, i) => (
              <div key={i} className="flex items-start gap-3">
                <ShieldCheck className="mt-0.5 h-4 w-4 flex-shrink-0 text-brand-gold" aria-hidden="true" />
                <p className="text-sm text-brand-grayMed leading-relaxed">{text}</p>
              </div>
            ))}
          </div>
          <div className="mt-6 flex flex-wrap justify-center gap-x-6 gap-y-2">
            {[
              { label: "Legal Notice", href: `/${locale}/legal/mentions` },
              { label: "Terms & Conditions", href: `/${locale}/legal/terms` },
              { label: "Privacy Policy", href: `/${locale}/legal/privacy` },
              { label: "Disclaimers", href: `/${locale}/legal/disclaimers` },
              { label: "Regulatory Information", href: `/${locale}/legal/regulatory` },
            ].map(({ label, href }) => (
              <Link key={label} href={href} className="text-xs text-brand-gold underline underline-offset-2 hover:text-brand-goldDark transition-colors">
                {label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* TECHNICAL & COMPLIANCE SECTION                                       */}
      {/* ------------------------------------------------------------------ */}
      <section className="bg-white py-12 md:py-16">
        <div className="container mx-auto max-w-4xl px-6">
          <SectionHeading overline="INTERNAL REVIEW" title="Technical & Compliance Requirements" description="This section is for management review only and describes the intended production requirements. It does not make unsupported legal guarantees." className="mb-8" />
          <IATTechSection />
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* FAQ                                                                  */}
      {/* ------------------------------------------------------------------ */}
      <section className="bg-gray-50 py-12 md:py-20">
        <div className="container mx-auto max-w-3xl px-6">
          <SectionHeading overline="FAQ" title="Frequently Asked Questions" className="mb-10" />
          <div className="rounded-2xl border border-brand-grayLight bg-white px-6 shadow-sm">
            {FAQ_ITEMS.map((item, i) => (
              <FaqItem key={i} index={i} question={item.q} answer={item.a} />
            ))}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* FINAL CTA                                                            */}
      {/* ------------------------------------------------------------------ */}
      <section id="consultation-info" className="hero-gradient py-12 md:py-20">
        <div className="container mx-auto max-w-4xl px-6 text-center">
          <h2 className="mb-4 text-balance text-3xl font-bold text-white md:text-4xl lg:text-5xl">
            Ready to Discuss Your Investment Objectives?
          </h2>
          <p className="mx-auto mb-10 max-w-2xl text-balance text-lg text-white/90">
            Complete the initial request and our team will help guide you through the next steps.
          </p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href={applyHref}
              className="inline-flex h-14 min-w-48 items-center justify-center rounded-2xl bg-white px-8 text-base font-semibold text-brand-dark shadow-sm transition-all hover:bg-gray-50"
            >
              Request a Consultation
            </Link>
            <Link
              href={`/${locale}/support`}
              className="inline-flex h-14 min-w-48 items-center justify-center rounded-2xl border-2 border-white bg-transparent px-8 text-base font-semibold text-white transition-all hover:bg-white/10"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
