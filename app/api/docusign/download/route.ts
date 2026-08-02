import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

function getEnv() {
  const raw = process.env.DOCUSIGN_PRIVATE_KEY ?? "";
  return {
    CLIENT_ID: process.env.DOCUSIGN_CLIENT_ID ?? "",
    USER_ID: process.env.DOCUSIGN_USER_ID ?? "",
    ACCOUNT_ID: process.env.DOCUSIGN_ACCOUNT_ID ?? "",
    BASE_URI: process.env.DOCUSIGN_BASE_URI ?? "https://demo.docusign.net",
    AUTH_SERVER: process.env.DOCUSIGN_AUTH_SERVER ?? "account-d.docusign.com",
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

  const resp = await fetch(`https://${AUTH_SERVER}/oauth/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwtToken}`,
  });

  if (!resp.ok) throw new Error(`AUTH_FAILED:${await resp.text()}`);
  return ((await resp.json()) as { access_token: string }).access_token;
}

export async function POST(req: NextRequest) {
  try {
    const { envelopeId } = (await req.json()) as { envelopeId: string };
    if (!envelopeId) {
      return NextResponse.json({ success: false, error: "envelopeId required" }, { status: 400 });
    }

    const { ACCOUNT_ID, BASE_URI } = getEnv();
    const accessToken = await getAccessToken();
    const apiBase = `${BASE_URI}/restapi/v2.1/accounts/${ACCOUNT_ID}`;

    // Download the combined (signed) document from DocuSign
    const docResp = await fetch(
      `${apiBase}/envelopes/${envelopeId}/documents/combined`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/pdf",
        },
      }
    );

    if (!docResp.ok) {
      throw new Error(`DocuSign download failed (${docResp.status}): ${await docResp.text()}`);
    }

    const bytes = await docResp.arrayBuffer();
    const pdfBase64 = Buffer.from(bytes).toString("base64");

    return NextResponse.json({ success: true, pdfBase64 });
  } catch (err) {
    console.error("[docusign/download]", err);
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 });
  }
}
