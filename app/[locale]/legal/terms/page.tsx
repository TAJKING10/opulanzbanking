"use client";

import * as React from "react";
import { useTranslations, useLocale } from "next-intl";
import { Hero } from "@/components/hero";
import { Card, CardContent } from "@/components/ui/card";

export default function TermsPage() {
  const t = useTranslations();
  const locale = useLocale();

  return (
    <>
      <Hero
        title="Terms & Conditions"
        subtitle="Please read these terms and conditions carefully before using our services"
      />

      <section className="bg-white py-20">
        <div className="container mx-auto max-w-4xl px-6">
          <Card className="border-none shadow-sm">
            <CardContent className="prose prose-lg max-w-none p-8">
              <h2 className="text-2xl font-bold text-brand-dark mb-4">1. Agreement to Terms</h2>
              <p className="text-brand-grayMed mb-6">
                By accessing and using the Opulanz banking platform, you agree to be bound by these Terms and Conditions.
                If you do not agree to these terms, please do not use our services.
              </p>

              <h2 className="text-2xl font-bold text-brand-dark mb-4">2. Eligibility</h2>
              <p className="text-brand-grayMed mb-6">
                You must be at least 18 years old and have the legal capacity to enter into binding contracts to use our services.
                By using our services, you represent and warrant that you meet these eligibility requirements.
              </p>

              <h2 className="text-2xl font-bold text-brand-dark mb-4">3. Account Registration</h2>
              <p className="text-brand-grayMed mb-4">
                To access certain features of our platform, you must register for an account. You agree to:
              </p>
              <ul className="list-disc pl-6 text-brand-grayMed mb-6 space-y-2">
                <li>Provide accurate, current, and complete information during registration</li>
                <li>Maintain and promptly update your account information</li>
                <li>Maintain the security of your account credentials</li>
                <li>Accept responsibility for all activities under your account</li>
                <li>Notify us immediately of any unauthorized access or security breach</li>
              </ul>

              <h2 className="text-2xl font-bold text-brand-dark mb-4">4. Services Provided</h2>
              <p className="text-brand-grayMed mb-4">
                Opulanz provides the following services:
              </p>
              <ul className="list-disc pl-6 text-brand-grayMed mb-6 space-y-2">
                <li>Digital banking and payment services</li>
                <li>Multi-currency accounts and transfers</li>
                <li>Investment advisory services</li>
                <li>Tax and accounting advisory</li>
                <li>Company formation assistance</li>
                <li>Life insurance products</li>
              </ul>

              <h2 className="text-2xl font-bold text-brand-dark mb-4">5. Fees and Charges</h2>
              <p className="text-brand-grayMed mb-6">
                You agree to pay all applicable fees for services rendered. Fees are outlined in our fee schedule and may be updated from time to time.
                We will notify you of any material changes to fees with reasonable advance notice.
              </p>

              <h2 className="text-2xl font-bold text-brand-dark mb-4">6. Prohibited Activities</h2>
              <p className="text-brand-grayMed mb-4">
                You agree not to:
              </p>
              <ul className="list-disc pl-6 text-brand-grayMed mb-6 space-y-2">
                <li>Use our services for any illegal purpose or in violation of any laws</li>
                <li>Engage in money laundering, terrorist financing, or other financial crimes</li>
                <li>Provide false, misleading, or fraudulent information</li>
                <li>Attempt to gain unauthorized access to our systems or other users' accounts</li>
                <li>Interfere with or disrupt the operation of our platform</li>
                <li>Use automated systems to access our services without permission</li>
              </ul>

              <h2 className="text-2xl font-bold text-brand-dark mb-4">7. Compliance and Regulatory Requirements</h2>
              <p className="text-brand-grayMed mb-6">
                Opulanz is regulated by relevant financial authorities. We comply with all applicable anti-money laundering (AML),
                know-your-customer (KYC), and counter-terrorist financing (CTF) regulations. You agree to cooperate with our compliance
                procedures and provide requested documentation when necessary.
              </p>

              <h2 className="text-2xl font-bold text-brand-dark mb-4">8. Limitation of Liability</h2>
              <p className="text-brand-grayMed mb-6">
                To the maximum extent permitted by law, Opulanz shall not be liable for any indirect, incidental, special,
                consequential, or punitive damages, or any loss of profits or revenues, whether incurred directly or indirectly,
                or any loss of data, use, goodwill, or other intangible losses.
              </p>

              <h2 className="text-2xl font-bold text-brand-dark mb-4">9. Intellectual Property</h2>
              <p className="text-brand-grayMed mb-6">
                All content, features, and functionality on our platform, including text, graphics, logos, and software,
                are owned by Opulanz and protected by international copyright, trademark, and other intellectual property laws.
              </p>

              <h2 className="text-2xl font-bold text-brand-dark mb-4">10. Account Termination</h2>
              <p className="text-brand-grayMed mb-6">
                We reserve the right to suspend or terminate your account at any time for violation of these terms,
                suspected fraudulent activity, or as required by law or regulatory authorities. You may close your account
                at any time by contacting our support team.
              </p>

              <h2 className="text-2xl font-bold text-brand-dark mb-4">11. Privacy and Data Protection</h2>
              <p className="text-brand-grayMed mb-6">
                Your use of our services is also governed by our Privacy Policy, which describes how we collect, use,
                and protect your personal information. Please review our Privacy Policy to understand our practices.
              </p>

              <h2 className="text-2xl font-bold text-brand-dark mb-4">12. Modifications to Terms</h2>
              <p className="text-brand-grayMed mb-6">
                We reserve the right to modify these Terms and Conditions at any time. We will notify you of material changes
                through our platform or by email. Your continued use of our services after such modifications constitutes
                acceptance of the updated terms.
              </p>

              <h2 className="text-2xl font-bold text-brand-dark mb-4">13. Governing Law and Dispute Resolution</h2>
              <p className="text-brand-grayMed mb-6">
                These Terms and Conditions are governed by the laws of Luxembourg and France, depending on your jurisdiction.
                Any disputes arising from these terms shall be resolved through arbitration or in the courts of the applicable jurisdiction.
              </p>

              <h2 className="text-2xl font-bold text-brand-dark mb-4">14. Contact Information</h2>
              <p className="text-brand-grayMed mb-4">
                If you have any questions about these Terms and Conditions, please contact us:
              </p>
              <ul className="list-none text-brand-grayMed mb-6 space-y-2">
                <li><strong>Email:</strong> legal@opulanz.com</li>
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
