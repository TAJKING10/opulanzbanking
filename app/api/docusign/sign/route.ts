import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

// Read env vars lazily inside functions so missing vars throw inside the handler
// (not at module load time, which would return HTML error pages)
function getEnv() {
  const raw = process.env.DOCUSIGN_PRIVATE_KEY ?? "";
  return {
    CLIENT_ID: process.env.DOCUSIGN_CLIENT_ID ?? "",
    USER_ID: process.env.DOCUSIGN_USER_ID ?? "",
    ACCOUNT_ID: process.env.DOCUSIGN_ACCOUNT_ID ?? "",
    BASE_URI: process.env.DOCUSIGN_BASE_URI ?? "https://demo.docusign.net",
    AUTH_SERVER: process.env.DOCUSIGN_AUTH_SERVER ?? "account-d.docusign.com",
    // dotenv may keep \n as literal two chars — convert to real newlines
    PRIVATE_KEY: raw.replace(/\\n/g, "\n"),
  };
}

async function getAccessToken(): Promise<string> {
  const { CLIENT_ID, USER_ID, AUTH_SERVER, PRIVATE_KEY } = getEnv();
  const now = Math.floor(Date.now() / 1000);
  const jwtToken = jwt.sign(
    {
      iss: CLIENT_ID,
      sub: USER_ID,
      aud: AUTH_SERVER,
      iat: now,
      exp: now + 3600,
      scope: "signature impersonation",
    },
    PRIVATE_KEY,
    { algorithm: "RS256" }
  );

  const resp = await fetch(`https://${AUTH_SERVER}/oauth/token`, {  // AUTH_SERVER from getEnv()
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwtToken}`,
  });

  if (!resp.ok) {
    const body = await resp.text();
    throw new Error(`AUTH_FAILED:${body}`);
  }

  const data = await resp.json() as { access_token: string };
  return data.access_token;
}

export async function POST(req: NextRequest) {
  try {
    const {
      pdfBase64,
      clientName,
      clientEmail,
      returnUrl,
    } = (await req.json()) as {
      pdfBase64: string;
      clientName: string;
      clientEmail: string;
      returnUrl: string;
    };

    const { CLIENT_ID, ACCOUNT_ID, BASE_URI, AUTH_SERVER } = getEnv();

    // ── 1. Get JWT access token ──────────────────────────────────────────
    let accessToken: string;
    try {
      accessToken = await getAccessToken();
    } catch (err) {
      const msg = String(err);
      if (msg.includes("consent_required")) {
        const consentUrl =
          `https://${AUTH_SERVER}/oauth/auth?response_type=code` +
          `&scope=signature%20impersonation` +
          `&client_id=${CLIENT_ID}` +
          `&redirect_uri=http://localhost:3002/api/docusign/callback`;
        return NextResponse.json(
          { success: false, error: "consent_required", consentUrl },
          { status: 401 }
        );
      }
      throw err;
    }

    const apiBase = `${BASE_URI}/restapi/v2.1/accounts/${ACCOUNT_ID}`;
    const headers = {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    };

    // ── 2. Create envelope ───────────────────────────────────────────────
    const envelopeBody = {
      emailSubject: `Questionnaire QCC — ${clientName} — Advensys Insurance Finance`,
      status: "sent",
      documents: [
        {
          documentBase64: pdfBase64,
          name: `QCC-${clientName}.pdf`,
          fileExtension: "pdf",
          documentId: "1",
        },
      ],
      recipients: {
        signers: [
          {
            email: clientEmail || "client@opulanz.com",
            name: clientName,
            recipientId: "1",
            clientUserId: "1001", // required for embedded signing
            routingOrder: "1",
            tabs: {
              signHereTabs: [
                {
                  documentId: "1",
                  pageNumber: "1",
                  xPosition: "100",
                  yPosition: "680",
                  scaleValue: "1",
                },
              ],
              dateSignedTabs: [
                {
                  documentId: "1",
                  pageNumber: "1",
                  xPosition: "100",
                  yPosition: "720",
                },
              ],
            },
          },
        ],
      },
    };

    const envelopeResp = await fetch(`${apiBase}/envelopes`, {
      method: "POST",
      headers,
      body: JSON.stringify(envelopeBody),
    });

    if (!envelopeResp.ok) {
      const err = await envelopeResp.text();
      throw new Error(`Envelope creation failed: ${err}`);
    }

    const envelopeData = (await envelopeResp.json()) as { envelopeId: string };
    const envelopeId = envelopeData.envelopeId;

    // ── 3. Create recipient (embedded) signing view ──────────────────────
    const viewResp = await fetch(
      `${apiBase}/envelopes/${envelopeId}/views/recipient`,
      {
        method: "POST",
        headers,
        body: JSON.stringify({
          returnUrl,
          authenticationMethod: "none",
          email: clientEmail || "client@opulanz.com",
          userName: clientName,
          recipientId: "1",
          clientUserId: "1001",
        }),
      }
    );

    if (!viewResp.ok) {
      const err = await viewResp.text();
      throw new Error(`Recipient view failed: ${err}`);
    }

    const viewData = (await viewResp.json()) as { url: string };

    return NextResponse.json({
      success: true,
      signingUrl: viewData.url,
      envelopeId,
    });
  } catch (err) {
    console.error("[docusign/sign]", err);
    return NextResponse.json(
      { success: false, error: String(err) },
      { status: 500 }
    );
  }
}
