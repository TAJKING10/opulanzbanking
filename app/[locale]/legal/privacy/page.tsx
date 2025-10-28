"use client";

import * as React from "react";
import { useTranslations, useLocale } from "next-intl";
import { Hero } from "@/components/hero";
import { Card, CardContent } from "@/components/ui/card";

export default function PrivacyPage() {
  const t = useTranslations();
  const locale = useLocale();

  return (
    <>
      <Hero
        title="Privacy Policy"
        subtitle="How we collect, use, and protect your personal information"
      />

      <section className="bg-white py-20">
        <div className="container mx-auto max-w-4xl px-6">
          <Card className="border-none shadow-sm">
            <CardContent className="prose prose-lg max-w-none p-8">
              <h2 className="text-2xl font-bold text-brand-dark mb-4">1. Introduction</h2>
              <p className="text-brand-grayMed mb-6">
                At Opulanz, we are committed to protecting your privacy and personal data. This Privacy Policy explains how we collect,
                use, disclose, and safeguard your information when you use our banking platform and services. We comply with the
                General Data Protection Regulation (GDPR) and other applicable data protection laws.
              </p>

              <h2 className="text-2xl font-bold text-brand-dark mb-4">2. Information We Collect</h2>
              <p className="text-brand-grayMed mb-4">
                We collect several types of information to provide and improve our services:
              </p>

              <h3 className="text-xl font-semibold text-brand-dark mb-3 mt-6">2.1 Personal Information</h3>
              <ul className="list-disc pl-6 text-brand-grayMed mb-6 space-y-2">
                <li>Name, date of birth, nationality, and identification documents</li>
                <li>Contact information (email, phone, address)</li>
                <li>Financial information (bank account details, transaction history)</li>
                <li>Employment and income information</li>
                <li>Tax identification numbers</li>
              </ul>

              <h3 className="text-xl font-semibold text-brand-dark mb-3">2.2 Technical Information</h3>
              <ul className="list-disc pl-6 text-brand-grayMed mb-6 space-y-2">
                <li>IP address, browser type, and device information</li>
                <li>Login credentials and authentication data</li>
                <li>Usage data and platform interactions</li>
                <li>Cookies and similar tracking technologies</li>
              </ul>

              <h3 className="text-xl font-semibold text-brand-dark mb-3">2.3 Third-Party Information</h3>
              <ul className="list-disc pl-6 text-brand-grayMed mb-6 space-y-2">
                <li>Information from credit bureaus and identity verification services</li>
                <li>Data from partner financial institutions</li>
                <li>Publicly available information for compliance purposes</li>
              </ul>

              <h2 className="text-2xl font-bold text-brand-dark mb-4">3. How We Use Your Information</h2>
              <p className="text-brand-grayMed mb-4">
                We use your information for the following purposes:
              </p>
              <ul className="list-disc pl-6 text-brand-grayMed mb-6 space-y-2">
                <li>To provide and maintain our banking services</li>
                <li>To verify your identity and comply with KYC/AML regulations</li>
                <li>To process transactions and manage your account</li>
                <li>To communicate with you about your account and services</li>
                <li>To detect and prevent fraud, money laundering, and other illegal activities</li>
                <li>To improve our services and develop new features</li>
                <li>To comply with legal and regulatory obligations</li>
                <li>To send marketing communications (with your consent)</li>
              </ul>

              <h2 className="text-2xl font-bold text-brand-dark mb-4">4. Legal Basis for Processing</h2>
              <p className="text-brand-grayMed mb-4">
                Under GDPR, we process your personal data based on:
              </p>
              <ul className="list-disc pl-6 text-brand-grayMed mb-6 space-y-2">
                <li><strong>Contract Performance:</strong> To fulfill our contractual obligations to provide banking services</li>
                <li><strong>Legal Obligation:</strong> To comply with regulatory requirements including KYC, AML, and CTF laws</li>
                <li><strong>Legitimate Interests:</strong> To prevent fraud, improve services, and maintain security</li>
                <li><strong>Consent:</strong> For marketing communications and optional data processing (you can withdraw consent anytime)</li>
              </ul>

              <h2 className="text-2xl font-bold text-brand-dark mb-4">5. Data Sharing and Disclosure</h2>
              <p className="text-brand-grayMed mb-4">
                We may share your information with:
              </p>
              <ul className="list-disc pl-6 text-brand-grayMed mb-6 space-y-2">
                <li><strong>Service Providers:</strong> Third-party vendors who assist in providing our services (payment processors, identity verification, cloud hosting)</li>
                <li><strong>Partner Banks:</strong> Licensed financial institutions that provide underlying banking services</li>
                <li><strong>Regulatory Authorities:</strong> Government agencies and regulators as required by law</li>
                <li><strong>Legal Requirements:</strong> When necessary to comply with legal processes, court orders, or law enforcement requests</li>
                <li><strong>Business Transfers:</strong> In connection with mergers, acquisitions, or asset sales</li>
              </ul>
              <p className="text-brand-grayMed mb-6">
                We do not sell your personal information to third parties for marketing purposes.
              </p>

              <h2 className="text-2xl font-bold text-brand-dark mb-4">6. International Data Transfers</h2>
              <p className="text-brand-grayMed mb-6">
                Your data may be transferred to and processed in countries outside the European Economic Area (EEA).
                When we transfer data internationally, we ensure appropriate safeguards are in place, such as:
                Standard Contractual Clauses approved by the European Commission, adequacy decisions, or other legally
                recognized transfer mechanisms.
              </p>

              <h2 className="text-2xl font-bold text-brand-dark mb-4">7. Data Security</h2>
              <p className="text-brand-grayMed mb-6">
                We implement industry-standard security measures to protect your data, including:
                encryption of data in transit and at rest, secure authentication mechanisms, regular security audits,
                access controls and monitoring, and incident response procedures. However, no method of transmission
                or storage is completely secure, and we cannot guarantee absolute security.
              </p>

              <h2 className="text-2xl font-bold text-brand-dark mb-4">8. Data Retention</h2>
              <p className="text-brand-grayMed mb-6">
                We retain your personal information for as long as necessary to provide our services and comply with
                legal obligations. Generally, we retain account information for the duration of your account plus a
                period required by law (typically 5-10 years after account closure for financial records).
                You may request deletion of your data, subject to our legal retention obligations.
              </p>

              <h2 className="text-2xl font-bold text-brand-dark mb-4">9. Your Rights Under GDPR</h2>
              <p className="text-brand-grayMed mb-4">
                You have the following rights regarding your personal data:
              </p>
              <ul className="list-disc pl-6 text-brand-grayMed mb-6 space-y-2">
                <li><strong>Right to Access:</strong> Request a copy of your personal data</li>
                <li><strong>Right to Rectification:</strong> Correct inaccurate or incomplete data</li>
                <li><strong>Right to Erasure:</strong> Request deletion of your data (subject to legal obligations)</li>
                <li><strong>Right to Restriction:</strong> Limit how we use your data</li>
                <li><strong>Right to Data Portability:</strong> Receive your data in a machine-readable format</li>
                <li><strong>Right to Object:</strong> Object to certain types of processing</li>
                <li><strong>Right to Withdraw Consent:</strong> Withdraw consent for optional processing</li>
                <li><strong>Right to Lodge a Complaint:</strong> File a complaint with your data protection authority</li>
              </ul>
              <p className="text-brand-grayMed mb-6">
                To exercise these rights, please contact our Data Protection Officer at privacy@opulanz.com.
              </p>

              <h2 className="text-2xl font-bold text-brand-dark mb-4">10. Cookies and Tracking</h2>
              <p className="text-brand-grayMed mb-6">
                We use cookies and similar technologies to enhance your experience, analyze usage, and provide personalized content.
                You can manage cookie preferences through your browser settings. Essential cookies required for platform functionality
                cannot be disabled.
              </p>

              <h2 className="text-2xl font-bold text-brand-dark mb-4">11. Children's Privacy</h2>
              <p className="text-brand-grayMed mb-6">
                Our services are not intended for individuals under 18 years of age. We do not knowingly collect personal
                information from children. If you believe we have collected data from a child, please contact us immediately.
              </p>

              <h2 className="text-2xl font-bold text-brand-dark mb-4">12. Changes to This Policy</h2>
              <p className="text-brand-grayMed mb-6">
                We may update this Privacy Policy from time to time. We will notify you of material changes through our platform
                or by email. The "Last Updated" date at the bottom of this policy indicates when it was last revised.
              </p>

              <h2 className="text-2xl font-bold text-brand-dark mb-4">13. Contact Information</h2>
              <p className="text-brand-grayMed mb-4">
                For questions about this Privacy Policy or to exercise your rights, please contact:
              </p>
              <ul className="list-none text-brand-grayMed mb-6 space-y-2">
                <li><strong>Data Protection Officer:</strong> privacy@opulanz.com</li>
                <li><strong>Email:</strong> support@opulanz.com</li>
                <li><strong>Phone:</strong> +352 20 30 40 50</li>
                <li><strong>Address:</strong> 1 Avenue de la Liberté, L-1931 Luxembourg</li>
              </ul>

              <p className="text-sm text-brand-grayMed mt-8 pt-6 border-t border-brand-grayLight">
                Last updated: October 28, 2025
              </p>
            </CardContent>
          </Card>
        </div>
      </section>
    </>
  );
}
