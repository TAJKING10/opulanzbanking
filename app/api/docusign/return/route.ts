import { NextRequest, NextResponse } from "next/server";

/**
 * DocuSign embedded signing return URL.
 * After the client signs (or declines/cancels), DocuSign redirects here
 * with ?event=signing_complete (or other events).
 * We return an HTML page that sends a postMessage to the parent modal window.
 */
export async function GET(req: NextRequest) {
  const event = req.nextUrl.searchParams.get("event") ?? "unknown";

  const html = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Signature — Advensys Insurance Finance</title>
  <style>
    body {
      margin: 0;
      font-family: Arial, sans-serif;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      background: #f9f9f9;
      color: #252623;
    }
    .box {
      text-align: center;
      padding: 40px 24px;
    }
    .icon {
      font-size: 48px;
      margin-bottom: 16px;
    }
    h2 { margin: 0 0 8px; font-size: 20px; }
    p  { margin: 0; font-size: 14px; color: #888; }
  </style>
</head>
<body>
  <div class="box">
    ${event === "signing_complete"
      ? '<div class="icon">✅</div><h2>Signature complétée</h2><p>Fermeture en cours…</p>'
      : event === "cancel"
      ? '<div class="icon">↩️</div><h2>Signature annulée</h2><p>Fermeture en cours…</p>'
      : '<div class="icon">⏳</div><h2>Traitement…</h2><p>Veuillez patienter.</p>'
    }
  </div>
  <script>
    // Notify the parent window (our modal)
    try {
      window.parent.postMessage(
        { type: 'docusign_event', event: '${event}' },
        '*'
      );
    } catch(e) {}
    // Also try opener (if opened in new tab)
    try {
      if (window.opener) {
        window.opener.postMessage(
          { type: 'docusign_event', event: '${event}' },
          '*'
        );
        window.close();
      }
    } catch(e) {}
  </script>
</body>
</html>`;

  return new NextResponse(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      // Allow DocuSign to load this page in their redirect
      "X-Frame-Options": "ALLOWALL",
    },
  });
}
