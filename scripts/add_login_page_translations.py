import json

page_en = {
  "branding": {
    "tagline": "Business Banking Made Simple",
    "description": "Manage your business finances with powerful tools for payments, invoicing, and multi-currency accounts.",
    "stats": {
      "volume": "Processed annually",
      "clients": "Business clients",
      "countries": "Countries"
    },
    "compliance": {
      "acpr": "Regulated by ACPR",
      "sepa": "SEPA Licensed",
      "pci": "PCI DSS Compliant"
    }
  },
  "credentials": {
    "title": "Welcome Back",
    "subtitle": "Sign in to your account",
    "emailLabel": "Email Address",
    "emailPlaceholder": "name@company.com",
    "passwordLabel": "Password",
    "passwordPlaceholder": "Enter your password",
    "twoFactor": "Two-factor authentication required",
    "forgotPassword": "Forgot Password?",
    "signIn": "Sign In",
    "orContinueWith": "Or continue with",
    "apple": "Apple",
    "appleComingSoon": "Apple Sign-In coming soon",
    "noAccount": "Don't have an account?",
    "signUp": "Sign Up"
  },
  "emailOtp": {
    "title": "Check your email",
    "description": "We sent a verification code to",
    "verify": "Verify",
    "resend": "Resend code",
    "resent": "Code resent!",
    "back": "← Back"
  },
  "phoneOtp": {
    "title": "Phone verification",
    "descriptionSms": "Enter the 6-digit code sent to your phone via SMS",
    "descriptionFallback": "Enter the 6-digit code sent to your phone or email",
    "signIn": "Sign In",
    "resend": "Resend code",
    "resent": "Code resent!"
  },
  "security": "Secured with 256-bit SSL encryption",
  "errors": {
    "invalidCredentials": "Invalid email or password",
    "invalidCode": "Invalid code",
    "googleFailed": "Google sign-in failed",
    "googleCancelled": "Google sign-in was cancelled or failed."
  }
}

page_fr = {
  "branding": {
    "tagline": "La banque d'entreprise simplifiée",
    "description": "Gérez vos finances d'entreprise avec des outils puissants pour les paiements, la facturation et les comptes multidevises.",
    "stats": {
      "volume": "Traité annuellement",
      "clients": "Clients entreprises",
      "countries": "Pays"
    },
    "compliance": {
      "acpr": "Régulé par l'ACPR",
      "sepa": "Agréé SEPA",
      "pci": "Conforme PCI DSS"
    }
  },
  "credentials": {
    "title": "Bon retour",
    "subtitle": "Connectez-vous à votre compte",
    "emailLabel": "Adresse e-mail",
    "emailPlaceholder": "nom@entreprise.com",
    "passwordLabel": "Mot de passe",
    "passwordPlaceholder": "Entrez votre mot de passe",
    "twoFactor": "Authentification à deux facteurs requise",
    "forgotPassword": "Mot de passe oublié ?",
    "signIn": "Se connecter",
    "orContinueWith": "Ou continuer avec",
    "apple": "Apple",
    "appleComingSoon": "Connexion Apple bientôt disponible",
    "noAccount": "Vous n'avez pas de compte ?",
    "signUp": "S'inscrire"
  },
  "emailOtp": {
    "title": "Vérifiez votre e-mail",
    "description": "Nous avons envoyé un code de vérification à",
    "verify": "Vérifier",
    "resend": "Renvoyer le code",
    "resent": "Code renvoyé !",
    "back": "← Retour"
  },
  "phoneOtp": {
    "title": "Vérification du téléphone",
    "descriptionSms": "Entrez le code à 6 chiffres envoyé sur votre téléphone par SMS",
    "descriptionFallback": "Entrez le code à 6 chiffres envoyé sur votre téléphone ou par e-mail",
    "signIn": "Se connecter",
    "resend": "Renvoyer le code",
    "resent": "Code renvoyé !"
  },
  "security": "Sécurisé avec un chiffrement SSL 256 bits",
  "errors": {
    "invalidCredentials": "E-mail ou mot de passe invalide",
    "invalidCode": "Code invalide",
    "googleFailed": "Échec de la connexion Google",
    "googleCancelled": "La connexion Google a été annulée ou a échoué."
  }
}

en = json.load(open("messages/en.json", encoding="utf-8"))
en["login"] = {"page": page_en}
with open("messages/en.json", "w", encoding="utf-8") as f:
    json.dump(en, f, ensure_ascii=False, indent=2)
print("en.json updated")

fr = json.load(open("messages/fr.json", encoding="utf-8"))
fr["login"] = {"page": page_fr}
with open("messages/fr.json", "w", encoding="utf-8") as f:
    json.dump(fr, f, ensure_ascii=False, indent=2)
print("fr.json updated")
