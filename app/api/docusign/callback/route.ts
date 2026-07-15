import { NextRequest, NextResponse } from "next/server";

/**
 * DocuSign OAuth consent callback.
 * DocuSign redirects here after the admin clicks "Allow Access".
 * For JWT grant, we don't need to exchange the code — consent is already saved.
 * Just show a confirmation page.
 */
export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");
  const error = req.nextUrl.searchParams.get("error");

  if (error) {
    const html = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8"/>
  <title>DocuSign — Erreur</title>
  <style>body{font-family:Arial,sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;background:#fff9f9;margin:0;}.box{text-align:center;padding:40px;}</style>
</head>
<body>
  <div class="box">
    <div style="font-size:48px;margin-bottom:16px;">❌</div>
    <h2 style="color:#c00;margin:0 0 8px;">Autorisation refusée</h2>
    <p style="color:#888;font-size:14px;">Erreur : ${error}</p>
    <p style="color:#888;font-size:13px;">Vous pouvez fermer cet onglet et réessayer.</p>
  </div>
</body>
</html>`;
    return new NextResponse(html, { headers: { "Content-Type": "text/html; charset=utf-8" } });
  }

  // Consent granted (code is present but we don't need to use it for JWT)
  const html = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8"/>
  <title>DocuSign — Autorisation accordée</title>
  <style>
    body{font-family:Arial,sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;background:#f0fff4;margin:0;}
    .box{text-align:center;padding:40px;max-width:480px;}
    h2{color:#166534;margin:0 0 12px;}
    p{color:#555;font-size:14px;line-height:1.6;}
    .badge{display:inline-block;background:#dcfce7;border:1px solid #86efac;color:#166534;border-radius:999px;padding:6px 16px;font-size:13px;font-weight:600;margin-bottom:16px;}
  </style>
</head>
<body>
  <div class="box">
    <div style="font-size:52px;margin-bottom:16px;">✅</div>
    <div class="badge">Autorisation accordée</div>
    <h2>DocuSign connecté avec succès</h2>
    <p>
      L'application Opulanz est maintenant autorisée à créer des envelopes DocuSign
      en votre nom. Vous pouvez fermer cet onglet et retourner sur la plateforme.
    </p>
    <p style="margin-top:16px;font-size:12px;color:#aaa;">
      ${code ? `Code reçu : ${code.substring(0, 8)}…` : ""}
      Cliquez sur <strong>"Réessayer"</strong> dans la fenêtre de signature.
    </p>
  </div>
</body>
</html>`;

  return new NextResponse(html, { headers: { "Content-Type": "text/html; charset=utf-8" } });
}
