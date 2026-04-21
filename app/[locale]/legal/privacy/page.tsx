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
        subtitle="Data Protection and GDPR Compliance"
      />

      <section className="bg-white py-12">
        <div className="container mx-auto max-w-4xl px-6">
          <Card className="border-none shadow-sm">
            <CardContent className="prose prose-lg max-w-none p-8">
              <h2 className="text-2xl font-bold text-brand-dark mb-4">GDPR Compliance</h2>
              <p className="text-brand-grayMed mb-6">
                We are committed to protecting your personal data and respecting your privacy rights in accordance with the General Data Protection Regulation (GDPR).
              </p>
              <p className="text-brand-grayMed mb-6">
                You have the right to access, rectify, delete, and port your personal data.
              </p>
              <p className="text-brand-grayMed mb-6">
                To exercise these rights, please contact us at: <strong>contact@advensys-in-finance.com</strong>
              </p>

              <h2 className="text-2xl font-bold text-brand-dark mb-4">Data Controller</h2>
              <p className="text-brand-grayMed mb-6">
                Advensys Insurance Finance S.A.R.L. acts as the data controller for all personal data collected through this website.
              </p>
              <p className="text-brand-grayMed mb-6">
                We process your data in accordance with applicable data protection laws and regulations.
              </p>

              <h2 className="text-2xl font-bold text-brand-dark mb-4">Data Collection</h2>
              <p className="text-brand-grayMed mb-6">
                We collect personal data that you voluntarily provide to us through our website forms and communications.
              </p>
              <p className="text-brand-grayMed mb-6">
                All personal data concerning Internet users is collected directly from them. Advensys Insurance Finance S.A.R.L. undertakes to obtain the consent of Internet users and/or to allow them to oppose the use of their personal data.
              </p>

              <h2 className="text-2xl font-bold text-brand-dark mb-4">Types of Data and Purpose of Collection</h2>
              <p className="text-brand-grayMed mb-4">
                The following data from Internet users may be collected by Advensys Insurance Finance S.A.R.L.:
              </p>
              <ul className="list-disc pl-6 text-brand-grayMed mb-6 space-y-2">
                <li>Surname</li>
                <li>First name</li>
                <li>Address</li>
                <li>Email</li>
                <li>IP address for Google Analytics</li>
              </ul>

              <p className="text-brand-grayMed mb-4">
                This collected data is mainly processed for:
              </p>
              <ul className="list-disc pl-6 text-brand-grayMed mb-6 space-y-2">
                <li>Allow navigation on the site</li>
                <li>Produce statistics</li>
              </ul>

              <h2 className="text-2xl font-bold text-brand-dark mb-4">Legitimate Interest</h2>
              <p className="text-brand-grayMed mb-4">
                The collection of personal data is based on the legitimate interest of Advensys Insurance Finance S.A.R.L. to offer:
              </p>
              <ul className="list-disc pl-6 text-brand-grayMed mb-6 space-y-2">
                <li>News and services of interest to anyone looking for information on the profession of financial investment advice, a job or an internship</li>
                <li>Information on wealth management and financial investment services</li>
              </ul>

              <h2 className="text-2xl font-bold text-brand-dark mb-4">Data Processing Location</h2>
              <p className="text-brand-grayMed mb-6">
                The processing carried out by Advensys Insurance Finance S.A.R.L. is located exclusively in Metropolitan France.
              </p>

              <h2 className="text-2xl font-bold text-brand-dark mb-4">Data Retention</h2>
              <p className="text-brand-grayMed mb-4">
                Personal data is kept only for the time necessary for the purpose pursued by the processing:
              </p>
              <ul className="list-disc pl-6 text-brand-grayMed mb-6 space-y-2">
                <li><strong>Navigation on the site and statistics:</strong> 1 year</li>
                <li><strong>Membership:</strong> The membership processing time (a few weeks)</li>
              </ul>

              <h2 className="text-2xl font-bold text-brand-dark mb-4">Your Rights</h2>
              <p className="text-brand-grayMed mb-4">
                Under GDPR, you have the following rights regarding your personal data:
              </p>
              <ul className="list-disc pl-6 text-brand-grayMed mb-6 space-y-2">
                <li><strong>Right to Access:</strong> Request a copy of your personal data</li>
                <li><strong>Right to Rectification:</strong> Correct inaccurate or incomplete data</li>
                <li><strong>Right to Erasure (Right to be Forgotten):</strong> Request deletion of your data</li>
                <li><strong>Right to Data Portability:</strong> Receive your data in a machine-readable format</li>
                <li><strong>Right to Object:</strong> Object to certain types of processing</li>
                <li><strong>Right to Restriction of Processing:</strong> Limit how we use your data</li>
              </ul>

              <h2 className="text-2xl font-bold text-brand-dark mb-4">Contact for Data Protection</h2>
              <p className="text-brand-grayMed mb-4">
                To exercise your rights or for any questions regarding data protection, please contact us:
              </p>
              <div className="text-brand-grayMed mb-6 space-y-2">
                <p><strong>Email:</strong> contact@advensys-in-finance.com</p>
                <p><strong>Address:</strong> 66 avenue des Champs Elysées, 75008 Paris</p>
                <p><strong>Phone:</strong> +33 6 98 21 44 46</p>
              </div>

              <h2 className="text-2xl font-bold text-brand-dark mb-4">Cookies and Tracking</h2>
              <p className="text-brand-grayMed mb-6">
                We use Google Analytics to analyze website usage and improve our services. This involves collecting IP addresses and website navigation data.
              </p>

              <h2 className="text-2xl font-bold text-brand-dark mb-4">Data Security</h2>
              <p className="text-brand-grayMed mb-6">
                We implement appropriate technical and organizational measures to protect your personal data against unauthorized access, alteration, disclosure, or destruction.
              </p>

              <h2 className="text-2xl font-bold text-brand-dark mb-4">Updates to This Policy</h2>
              <p className="text-brand-grayMed mb-6">
                This privacy policy may be updated from time to time. We recommend that you review this page periodically to stay informed of any changes.
              </p>

              <p className="text-sm text-brand-grayMed mt-8 pt-6 border-t border-brand-grayLight">
                Last updated: January 2025
              </p>
            </CardContent>
          </Card>
        </div>
      </section>
    </>
  );
}
