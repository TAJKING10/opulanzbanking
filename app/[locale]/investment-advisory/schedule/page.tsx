"use client";

import * as React from "react";
import { useTranslations, useLocale } from "next-intl";
import { Hero } from "@/components/hero";
import { Card, CardContent } from "@/components/ui/card";
import Script from "next/script";

export default function ScheduleInvestmentMeetingPage() {
  const t = useTranslations();
  const locale = useLocale();

  return (
    <>
      <Hero
        title="Schedule Your Investment Advisory Meeting"
        subtitle="Book a convenient time to discuss your investment goals with our expert advisors"
      />

      <section className="bg-white py-20">
        <div className="container mx-auto max-w-5xl px-6">
          <div className="mb-8 text-center">
            <h2 className="mb-4 text-2xl font-bold text-brand-dark md:text-3xl">
              Choose a Time That Works for You
            </h2>
            <p className="text-brand-grayMed">
              Select your preferred date and time from the calendar below. Our investment advisors are ready to help you build and grow your wealth.
            </p>
          </div>

          <Card className="border-none shadow-lg">
            <CardContent className="p-4 md:p-8">
              {/* Calendly inline widget */}
              <div
                className="calendly-inline-widget"
                data-url="https://calendly.com/d/ctfs-wfg-bwx?primary_color=c28800"
                style={{ minWidth: '320px', height: '700px' }}
              />
            </CardContent>
          </Card>

          {/* Information Section */}
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            <div className="text-center">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-brand-goldLight">
                <svg className="h-6 w-6 text-brand-goldDark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="mb-2 text-lg font-bold text-brand-dark">45-Minute Consultation</h3>
              <p className="text-sm text-brand-grayMed">
                Comprehensive consultation to understand your investment needs
              </p>
            </div>

            <div className="text-center">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-brand-goldLight">
                <svg className="h-6 w-6 text-brand-goldDark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="mb-2 text-lg font-bold text-brand-dark">Video Conference</h3>
              <p className="text-sm text-brand-grayMed">
                Secure online meeting via your preferred platform
              </p>
            </div>

            <div className="text-center">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-brand-goldLight">
                <svg className="h-6 w-6 text-brand-goldDark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="mb-2 text-lg font-bold text-brand-dark">Confidential & Secure</h3>
              <p className="text-sm text-brand-grayMed">
                All discussions are strictly confidential
              </p>
            </div>
          </div>

          {/* What to Prepare Section */}
          <div className="mt-12 rounded-lg bg-brand-off p-8">
            <h3 className="mb-4 text-xl font-bold text-brand-dark">What to Prepare for Your Meeting</h3>
            <ul className="space-y-3 text-brand-grayMed">
              <li className="flex items-start gap-3">
                <svg className="mt-1 h-5 w-5 flex-shrink-0 text-brand-gold" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Overview of your current financial situation and investment portfolio</span>
              </li>
              <li className="flex items-start gap-3">
                <svg className="mt-1 h-5 w-5 flex-shrink-0 text-brand-gold" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Your short-term and long-term financial goals</span>
              </li>
              <li className="flex items-start gap-3">
                <svg className="mt-1 h-5 w-5 flex-shrink-0 text-brand-gold" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Information about your risk tolerance and investment timeline</span>
              </li>
              <li className="flex items-start gap-3">
                <svg className="mt-1 h-5 w-5 flex-shrink-0 text-brand-gold" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>List of questions or specific investment concerns you'd like to address</span>
              </li>
              <li className="flex items-start gap-3">
                <svg className="mt-1 h-5 w-5 flex-shrink-0 text-brand-gold" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Recent account statements (if available)</span>
              </li>
            </ul>
          </div>

          {/* Investment Topics Section */}
          <div className="mt-12 grid gap-6 md:grid-cols-2">
            <Card className="border-brand-grayLight/30">
              <CardContent className="p-6">
                <h3 className="mb-4 text-lg font-bold text-brand-dark">Topics We'll Cover</h3>
                <ul className="space-y-2 text-sm text-brand-grayMed">
                  <li>• Investment strategy and asset allocation</li>
                  <li>• Portfolio diversification opportunities</li>
                  <li>• Risk management and mitigation</li>
                  <li>• Tax-efficient investment solutions</li>
                  <li>• Retirement planning strategies</li>
                  <li>• Market outlook and trends</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-brand-grayLight/30">
              <CardContent className="p-6">
                <h3 className="mb-4 text-lg font-bold text-brand-dark">What You'll Receive</h3>
                <ul className="space-y-2 text-sm text-brand-grayMed">
                  <li>• Personalized investment recommendations</li>
                  <li>• Portfolio analysis and optimization suggestions</li>
                  <li>• Detailed fee structure explanation</li>
                  <li>• Next steps for getting started</li>
                  <li>• Educational resources and materials</li>
                  <li>• Follow-up action plan</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Load Calendly widget script */}
      <Script
        src="https://assets.calendly.com/assets/external/widget.js"
        strategy="lazyOnload"
      />
    </>
  );
}
