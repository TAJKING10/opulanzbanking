"use client";

import * as React from "react";
import { useTranslations, useLocale } from "next-intl";
import { Hero } from "@/components/hero";
import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";

export default function DisclaimersPage() {
  const t = useTranslations();
  const locale = useLocale();

  return (
    <>
      <Hero
        title="Disclaimers"
        subtitle="Important information about our services and limitations"
      />

      <section className="bg-white py-12">
        <div className="container mx-auto max-w-4xl px-6">
          <div className="mb-8 rounded-lg border-l-4 border-brand-gold bg-brand-goldLight/20 p-6">
            <div className="flex items-start gap-4">
              <AlertTriangle className="h-6 w-6 flex-shrink-0 text-brand-goldDark" />
              <div>
                <h3 className="mb-2 text-lg font-bold text-brand-dark">Important Notice</h3>
                <p className="text-sm text-brand-grayMed">
                  Please read these disclaimers carefully. By using our services, you acknowledge that you have read,
                  understood, and agree to be bound by these disclaimers.
                </p>
              </div>
            </div>
          </div>

          <Card className="border-none shadow-sm">
            <CardContent className="prose prose-lg max-w-none p-8">
              <h2 className="text-2xl font-bold text-brand-dark mb-4">1. General Disclaimer</h2>
              <p className="text-brand-grayMed mb-6">
                The information provided on the Opulanz platform is for general informational purposes only. While we strive
                to keep the information accurate and up-to-date, we make no representations or warranties of any kind,
                express or implied, about the completeness, accuracy, reliability, suitability, or availability of the
                information, products, services, or related graphics contained on the platform.
              </p>

              <h2 className="text-2xl font-bold text-brand-dark mb-4">2. Financial Advice Disclaimer</h2>
              <p className="text-brand-grayMed mb-6">
                The content provided on our platform does not constitute financial, investment, tax, or legal advice.
                Any information or recommendations provided are for informational purposes only and should not be considered
                as professional advice. You should consult with qualified professionals before making any financial decisions.
                Past performance is not indicative of future results.
              </p>

              <h2 className="text-2xl font-bold text-brand-dark mb-4">3. Investment Risk Disclaimer</h2>
              <p className="text-brand-grayMed mb-4">
                Investing in financial products involves risk, including the potential loss of principal. Before investing,
                you should consider:
              </p>
              <ul className="list-disc pl-6 text-brand-grayMed mb-6 space-y-2">
                <li>Your financial situation, investment objectives, and risk tolerance</li>
                <li>The risks associated with specific investment products</li>
                <li>Market volatility and economic conditions</li>
                <li>Currency exchange rate fluctuations</li>
                <li>Potential tax implications</li>
              </ul>
              <p className="text-brand-grayMed mb-6">
                We do not guarantee any specific investment returns or outcomes. You are solely responsible for your
                investment decisions and any resulting gains or losses.
              </p>

              <h2 className="text-2xl font-bold text-brand-dark mb-4">4. Service Availability Disclaimer</h2>
              <p className="text-brand-grayMed mb-6">
                While we strive to maintain 99.9% uptime, we cannot guarantee uninterrupted or error-free access to our platform.
                Services may be temporarily unavailable due to maintenance, technical issues, or circumstances beyond our control.
                We are not liable for any losses resulting from service interruptions or delays in processing transactions.
              </p>

              <h2 className="text-2xl font-bold text-brand-dark mb-4">5. Third-Party Services Disclaimer</h2>
              <p className="text-brand-grayMed mb-6">
                Our platform may contain links to or integrate with third-party websites, services, or products. We do not
                endorse or assume responsibility for the content, privacy policies, or practices of third-party services.
                Your interactions with third-party services are governed by their respective terms and conditions.
                We are not liable for any damages or losses resulting from your use of third-party services.
              </p>

              <h2 className="text-2xl font-bold text-brand-dark mb-4">6. Regulatory and Jurisdictional Disclaimer</h2>
              <p className="text-brand-grayMed mb-6">
                Opulanz operates under licenses and regulations in specific jurisdictions. Our services may not be available
                in all countries or regions. It is your responsibility to ensure that your use of our services complies with
                local laws and regulations in your jurisdiction. We make no representation that materials on our platform
                are appropriate or available for use in all locations.
              </p>

              <h2 className="text-2xl font-bold text-brand-dark mb-4">7. Exchange Rate and Currency Disclaimer</h2>
              <p className="text-brand-grayMed mb-6">
                Exchange rates displayed on our platform are indicative and may not reflect real-time market rates.
                Actual rates applied to transactions may differ based on market conditions, transaction size, and timing.
                Currency exchange involves risk, and rates can fluctuate significantly. We are not responsible for
                losses resulting from exchange rate movements.
              </p>

              <h2 className="text-2xl font-bold text-brand-dark mb-4">8. Tax Disclaimer</h2>
              <p className="text-brand-grayMed mb-6">
                Information provided regarding tax matters is general in nature and should not be considered as tax advice.
                Tax laws vary by jurisdiction and individual circumstances. You are responsible for understanding and
                complying with your tax obligations. We recommend consulting with qualified tax professionals for advice
                specific to your situation. Opulanz is not responsible for any tax liabilities you may incur.
              </p>

              <h2 className="text-2xl font-bold text-brand-dark mb-4">9. Insurance Coverage Disclaimer</h2>
              <p className="text-brand-grayMed mb-6">
                Insurance products offered through our platform are provided by licensed insurance companies. We act as
                an intermediary and are not the insurance provider. Coverage terms, conditions, and exclusions are determined
                by the insurance policy documents. You should carefully review all policy documents before purchasing insurance.
                We are not liable for claims disputes or coverage issues between you and the insurance provider.
              </p>

              <h2 className="text-2xl font-bold text-brand-dark mb-4">10. Company Formation Disclaimer</h2>
              <p className="text-brand-grayMed mb-6">
                Company formation services are provided for informational and administrative assistance purposes only.
                We do not provide legal advice regarding corporate structure, governance, or compliance. The suitability
                of a particular corporate structure depends on your specific circumstances and objectives. You should
                consult with legal and tax professionals before forming a company.
              </p>

              <h2 className="text-2xl font-bold text-brand-dark mb-4">11. Security Disclaimer</h2>
              <p className="text-brand-grayMed mb-6">
                While we implement industry-standard security measures, no system is completely secure. You are responsible
                for maintaining the confidentiality of your account credentials and for all activities under your account.
                We are not liable for unauthorized access resulting from your failure to maintain security, disclosure of
                credentials, or use of compromised devices or networks.
              </p>

              <h2 className="text-2xl font-bold text-brand-dark mb-4">12. Transaction Disclaimer</h2>
              <p className="text-brand-grayMed mb-6">
                Once a transaction is executed, it may not be reversible. You are responsible for verifying all transaction
                details before confirming. We are not liable for losses resulting from incorrect recipient information,
                amount errors, or transactions executed based on your instructions. Some transactions may be delayed or
                rejected due to compliance reviews, technical issues, or insufficient funds.
              </p>

              <h2 className="text-2xl font-bold text-brand-dark mb-4">13. Content Accuracy Disclaimer</h2>
              <p className="text-brand-grayMed mb-6">
                We make reasonable efforts to ensure information accuracy, but content on our platform may contain errors,
                omissions, or outdated information. Account balances, transaction history, and other data are provided
                "as is" without warranty. You should verify critical information independently. We reserve the right to
                correct errors and update information without prior notice.
              </p>

              <h2 className="text-2xl font-bold text-brand-dark mb-4">14. Limitation of Liability</h2>
              <p className="text-brand-grayMed mb-6">
                To the maximum extent permitted by law, Opulanz, its directors, employees, partners, and affiliates shall
                not be liable for any direct, indirect, incidental, consequential, or punitive damages arising from:
                your use or inability to use our services, unauthorized access to your account, errors or omissions in content,
                delays or interruptions in service, or any decisions made based on information provided on our platform.
              </p>

              <h2 className="text-2xl font-bold text-brand-dark mb-4">15. Changes to Disclaimers</h2>
              <p className="text-brand-grayMed mb-6">
                We reserve the right to modify these disclaimers at any time. Material changes will be communicated through
                our platform or via email. Your continued use of our services after changes are posted constitutes acceptance
                of the updated disclaimers. We recommend reviewing this page periodically.
              </p>

              <h2 className="text-2xl font-bold text-brand-dark mb-4">16. Contact Information</h2>
              <p className="text-brand-grayMed mb-4">
                If you have questions about these disclaimers, please contact us:
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
