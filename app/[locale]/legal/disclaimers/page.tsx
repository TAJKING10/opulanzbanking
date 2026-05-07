"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Hero } from "@/components/hero";
import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";

export default function DisclaimersPage() {
  const p = useTranslations("legal.disclaimers");
  const bullets: string[] = p.raw("s3.bullets") as string[];

  return (
    <>
      <Hero
        title={p("hero.title")}
        subtitle={p("hero.subtitle")}
      />

      <section className="bg-white py-12">
        <div className="container mx-auto max-w-4xl px-6">
          <div className="mb-8 rounded-lg border-l-4 border-brand-gold bg-brand-goldLight/20 p-6">
            <div className="flex items-start gap-4">
              <AlertTriangle className="h-6 w-6 flex-shrink-0 text-brand-goldDark" />
              <div>
                <h3 className="mb-2 text-lg font-bold text-brand-dark">{p("notice.title")}</h3>
                <p className="text-sm text-brand-grayMed">{p("notice.description")}</p>
              </div>
            </div>
          </div>

          <Card className="border-none shadow-sm">
            <CardContent className="prose prose-lg max-w-none p-8">

              <h2 className="text-2xl font-bold text-brand-dark mb-4">{p("s1.title")}</h2>
              <p className="text-brand-grayMed mb-6">{p("s1.content")}</p>

              <h2 className="text-2xl font-bold text-brand-dark mb-4">{p("s2.title")}</h2>
              <p className="text-brand-grayMed mb-6">{p("s2.content")}</p>

              <h2 className="text-2xl font-bold text-brand-dark mb-4">{p("s3.title")}</h2>
              <p className="text-brand-grayMed mb-4">{p("s3.intro")}</p>
              <ul className="list-disc pl-6 text-brand-grayMed mb-6 space-y-2">
                {bullets.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
              <p className="text-brand-grayMed mb-6">{p("s3.outro")}</p>

              <h2 className="text-2xl font-bold text-brand-dark mb-4">{p("s4.title")}</h2>
              <p className="text-brand-grayMed mb-6">{p("s4.content")}</p>

              <h2 className="text-2xl font-bold text-brand-dark mb-4">{p("s5.title")}</h2>
              <p className="text-brand-grayMed mb-6">{p("s5.content")}</p>

              <h2 className="text-2xl font-bold text-brand-dark mb-4">{p("s6.title")}</h2>
              <p className="text-brand-grayMed mb-6">{p("s6.content")}</p>

              <h2 className="text-2xl font-bold text-brand-dark mb-4">{p("s7.title")}</h2>
              <p className="text-brand-grayMed mb-6">{p("s7.content")}</p>

              <h2 className="text-2xl font-bold text-brand-dark mb-4">{p("s8.title")}</h2>
              <p className="text-brand-grayMed mb-6">{p("s8.content")}</p>

              <h2 className="text-2xl font-bold text-brand-dark mb-4">{p("s9.title")}</h2>
              <p className="text-brand-grayMed mb-6">{p("s9.content")}</p>

              <h2 className="text-2xl font-bold text-brand-dark mb-4">{p("s10.title")}</h2>
              <p className="text-brand-grayMed mb-6">{p("s10.content")}</p>

              <h2 className="text-2xl font-bold text-brand-dark mb-4">{p("s11.title")}</h2>
              <p className="text-brand-grayMed mb-6">{p("s11.content")}</p>

              <h2 className="text-2xl font-bold text-brand-dark mb-4">{p("s12.title")}</h2>
              <p className="text-brand-grayMed mb-6">{p("s12.content")}</p>

              <h2 className="text-2xl font-bold text-brand-dark mb-4">{p("s13.title")}</h2>
              <p className="text-brand-grayMed mb-6">{p("s13.content")}</p>

              <h2 className="text-2xl font-bold text-brand-dark mb-4">{p("s14.title")}</h2>
              <p className="text-brand-grayMed mb-6">{p("s14.content")}</p>

              <h2 className="text-2xl font-bold text-brand-dark mb-4">{p("s15.title")}</h2>
              <p className="text-brand-grayMed mb-6">{p("s15.content")}</p>

              <h2 className="text-2xl font-bold text-brand-dark mb-4">{p("s16.title")}</h2>
              <p className="text-brand-grayMed mb-4">{p("s16.intro")}</p>
              <ul className="list-none text-brand-grayMed mb-6 space-y-2">
                <li><strong>{p("s16.email")}:</strong> legal@opulanz.com</li>
                <li><strong>{p("s16.phone")}:</strong> +352 20 30 40 50</li>
                <li><strong>{p("s16.address")}:</strong> 1 Avenue de la Liberté, L-1931 Luxembourg</li>
              </ul>

              <p className="text-sm text-brand-grayMed mt-8 pt-6 border-t border-brand-grayLight">
                {p("lastUpdated")}
              </p>
            </CardContent>
          </Card>
        </div>
      </section>
    </>
  );
}
