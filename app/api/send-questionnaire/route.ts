import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

const ADMIN_EMAIL = "tax-ad@opulanz.com";

function makeTransporter() {
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { clientName, clientType, clientEmail, pdfBase64, formSummary, date, signatureDate, signedName } = body as {
      clientName: string;
      clientType: string;
      clientEmail: string;
      pdfBase64: string;
      formSummary: string;
      date: string;
      signatureDate: string;
      signedName?: string;
    };

    const transporter = makeTransporter();
    const from = `"Advensys Insurance Finance — Opulanz" <${process.env.EMAIL_USER}>`;
    const safeName = (clientName || "Client").replace(/\s+/g, "-");
    const docPrefix = (clientType?.toLowerCase().includes("morale") || clientType?.toLowerCase().includes("pm")) ? "DCE" : "QCC";
    const pdfFilename = `${docPrefix}-${safeName}-${date}.pdf`;

    const attachments = pdfBase64
      ? [{ filename: pdfFilename, content: pdfBase64, encoding: "base64" as const }]
      : [];

    // Determine document type tag: DCE for legal entity, QCC for natural person
    const isLegalEntity = clientType?.toLowerCase().includes("morale") || clientType?.toLowerCase().includes("pm");
    const docTag = isLegalEntity ? "[DCE]" : "[QCC]";

    // ── 1. Email to admin ─────────────────────────────────────────────────────
    await transporter.sendMail({
      from,
      to: ADMIN_EMAIL,
      subject: `${docTag} Nouveau questionnaire signé — ${clientName} — ${date}`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:640px;color:#252623;">
          <div style="background:#b59354;padding:24px 28px;border-radius:12px 12px 0 0;">
            <h1 style="margin:0;color:#fff;font-size:20px;font-weight:700;">
              Nouveau Questionnaire de Connaissance du Client
            </h1>
            <p style="margin:6px 0 0;color:rgba(255,255,255,0.85);font-size:13px;">
              Advensys Insurance Finance · Plateforme Opulanz
            </p>
          </div>

          <div style="background:#fff;border:1px solid #e5e7eb;border-top:none;padding:28px;border-radius:0 0 12px 12px;">
            <table style="width:100%;border-collapse:collapse;margin-bottom:20px;">
              <tr>
                <td style="padding:8px 0;border-bottom:1px solid #f0f0f0;font-size:13px;font-weight:600;color:#888;width:160px;">Client</td>
                <td style="padding:8px 0;border-bottom:1px solid #f0f0f0;font-size:14px;font-weight:700;color:#252623;">${clientName}</td>
              </tr>
              <tr>
                <td style="padding:8px 0;border-bottom:1px solid #f0f0f0;font-size:13px;font-weight:600;color:#888;">Type de client</td>
                <td style="padding:8px 0;border-bottom:1px solid #f0f0f0;font-size:13px;color:#252623;">${clientType}</td>
              </tr>
              <tr>
                <td style="padding:8px 0;border-bottom:1px solid #f0f0f0;font-size:13px;font-weight:600;color:#888;">Email client</td>
                <td style="padding:8px 0;border-bottom:1px solid #f0f0f0;font-size:13px;color:#252623;">${clientEmail || "Non renseigné"}</td>
              </tr>
              <tr>
                <td style="padding:8px 0;border-bottom:1px solid #f0f0f0;font-size:13px;font-weight:600;color:#888;">Date de soumission</td>
                <td style="padding:8px 0;border-bottom:1px solid #f0f0f0;font-size:13px;color:#252623;">${date}</td>
              </tr>
              <tr>
                <td style="padding:8px 0;border-bottom:1px solid #f0f0f0;font-size:13px;font-weight:600;color:#888;">Date de signature</td>
                <td style="padding:8px 0;border-bottom:1px solid #f0f0f0;font-size:13px;color:#252623;">${signatureDate || date}</td>
              </tr>
              <tr>
                <td style="padding:8px 0;font-size:13px;font-weight:600;color:#888;">Signé sous le nom</td>
                <td style="padding:8px 0;font-size:14px;font-style:italic;font-weight:700;color:#252623;">${signedName || clientName}</td>
              </tr>
            </table>

            <div style="background:#f9f9f9;border-radius:8px;padding:16px;margin-bottom:20px;">
              <p style="margin:0 0 10px;font-size:13px;font-weight:700;color:#252623;">
                📋 Résumé du questionnaire
              </p>
              <pre style="font-size:11px;color:#555;white-space:pre-wrap;margin:0;font-family:monospace;line-height:1.5;">${formSummary}</pre>
            </div>

            <p style="font-size:13px;color:#555;margin:0 0 6px;">
              Le questionnaire QCC complet est joint en pièce jointe au format PDF (<strong>${pdfFilename}</strong>).
            </p>
            <p style="font-size:13px;color:#555;margin:0;">
              Le client a également réservé un créneau de consultation via Calendly (Conseil en Investissement — 60 min).
              Vous recevrez une notification Calendly séparée avec les détails du rendez-vous.
            </p>

            <hr style="border:none;border-top:1px solid #eee;margin:24px 0;" />
            <p style="font-size:11px;color:#aaa;margin:0;">
              Advensys Insurance Finance · Envoyé via la plateforme Opulanz · ${date}
            </p>
          </div>
        </div>
      `,
      attachments,
    });

    // ── 2. Confirmation email to client (if email known) ──────────────────────
    if (clientEmail && clientEmail.includes("@")) {
      await transporter.sendMail({
        from,
        to: clientEmail,
        subject: `Confirmation — Votre questionnaire ${isLegalEntity ? "DCE" : "QCC"} a été reçu · Advensys Insurance Finance`,
        html: `
          <div style="font-family:Arial,sans-serif;max-width:600px;color:#252623;">
            <div style="background:#b59354;padding:24px 28px;border-radius:12px 12px 0 0;">
              <h1 style="margin:0;color:#fff;font-size:20px;font-weight:700;">
                Votre questionnaire a été reçu
              </h1>
              <p style="margin:6px 0 0;color:rgba(255,255,255,0.85);font-size:13px;">
                Advensys Insurance Finance · Conseil en Investissement
              </p>
            </div>

            <div style="background:#fff;border:1px solid #e5e7eb;border-top:none;padding:28px;border-radius:0 0 12px 12px;">
              <p style="font-size:15px;color:#252623;font-weight:700;margin:0 0 12px;">
                Bonjour ${clientName},
              </p>
              <p style="font-size:13px;color:#555;line-height:1.6;margin:0 0 16px;">
                Nous avons bien reçu votre Questionnaire de Connaissance du Client (QCC) signé
                électroniquement le <strong>${signatureDate || date}</strong>.
              </p>

              <div style="background:#f9f7f2;border:1px solid #e8d9b8;border-radius:8px;padding:16px;margin-bottom:20px;">
                <p style="margin:0 0 8px;font-size:13px;font-weight:700;color:#252623;">
                  ✅ Ce que nous avons reçu
                </p>
                <ul style="margin:0;padding:0 0 0 18px;font-size:13px;color:#555;line-height:2;">
                  <li>Questionnaire de Connaissance du Client (QCC) complété</li>
                  <li>Type de client : ${clientType}</li>
                  <li>Signature électronique apposée le ${signatureDate || date}</li>
                  <li>Rendez-vous de consultation réservé (Conseil en Investissement — 60 min)</li>
                </ul>
              </div>

              <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:8px;padding:16px;margin-bottom:20px;">
                <p style="margin:0 0 6px;font-size:13px;font-weight:700;color:#1e40af;">
                  📅 Votre rendez-vous de conseil
                </p>
                <p style="margin:0 0 14px;font-size:13px;color:#374151;line-height:1.6;">
                  Réservez votre consultation de 60 minutes avec un conseiller en
                  investissements certifié AMF via le lien ci-dessous. Vous recevrez
                  une confirmation par email avec le lien de la visioconférence (Teams).
                </p>
                <a href="https://calendly.com/opulanz-banking/conseil-en-investissement"
                   target="_blank"
                   style="display:inline-block;background:#b59354;color:#fff;font-size:13px;font-weight:700;padding:11px 24px;border-radius:8px;text-decoration:none;">
                  📅 Réserver ma consultation — Conseil en Investissement (60 min)
                </a>
              </div>

              <div style="background:#f0fff4;border:1px solid #86efac;border-radius:8px;padding:14px;margin-bottom:20px;">
                <p style="margin:0 0 4px;font-size:13px;font-weight:700;color:#166534;">
                  ✍️ Votre signature électronique
                </p>
                <p style="margin:0;font-size:13px;color:#374151;line-height:1.6;">
                  Document signé sous le nom : <strong style="font-style:italic;">${signedName || clientName}</strong><br/>
                  Le : <strong>${signatureDate || date}</strong><br/>
                  Le questionnaire QCC signé est joint en pièce jointe à cet email (PDF).
                </p>
              </div>

              <p style="font-size:13px;color:#555;line-height:1.6;margin:0 0 16px;">
                Votre conseiller étudiera votre questionnaire avant la consultation afin de
                préparer des recommandations adaptées à votre profil et à vos objectifs
                d'investissement.
              </p>
              <p style="font-size:13px;color:#555;line-height:1.6;margin:0 0 20px;">
                Si vous avez des questions avant votre rendez-vous, n'hésitez pas à nous contacter
                à l'adresse <a href="mailto:tax-ad@opulanz.com" style="color:#b59354;">tax-ad@opulanz.com</a>.
              </p>

              <p style="font-size:13px;color:#252623;font-weight:600;margin:0 0 4px;">
                L'équipe Advensys Insurance Finance
              </p>
              <p style="font-size:12px;color:#aaa;margin:0;">Via la plateforme Opulanz</p>

              <hr style="border:none;border-top:1px solid #eee;margin:24px 0;" />
              <p style="font-size:11px;color:#aaa;margin:0;line-height:1.5;">
                Ce message est envoyé automatiquement suite à la soumission de votre questionnaire.
                Les informations que vous avez fournies sont traitées conformément à notre politique
                de protection des données personnelles (RGPD).
              </p>
            </div>
          </div>
        `,
        attachments,
      });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[send-questionnaire]", err);
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 });
  }
}
