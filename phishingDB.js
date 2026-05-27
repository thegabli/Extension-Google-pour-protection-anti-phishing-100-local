/**
 * PhishingGuard — phishingDB.js
 * Base de données de domaines et emails de phishing connus
 * Chargé EN PREMIER (avant detector.js)
 */
const PHISHING_DB = new Set([
  // --- Faux PayPal ---
  "paypal-secure.com", "paypal-support.com", "paypal-update.com",
  "paypal-account.com", "paypal-verification.com", "paypal-confirm.net",
  "paypal-alert.com", "paypall.com", "paypa1.com", "paypa-l.com",
  "secure-paypal.com", "paypal-login.net", "paypal-resolution.com",
  "paypal-service.net", "paypalcustomersupport.com",

  // --- Faux Amazon ---
  "amazon-security.com", "amazon-support.net", "amazon-verify.com",
  "amazon-update.com", "amazon-account.net", "amazon-prime.net",
  "amazon-login.com", "amazon-order.net", "amazonsupport.net",
  "amazon-prime-video.net", "amazonn.com", "amazon-billing.com",

  // --- Faux Microsoft / Office ---
  "microsoft-support.com", "microsoft-account.net", "microsoftverify.com",
  "microsoft-security.net", "office365-login.com", "office-365.net",
  "outlook-verify.com", "microsoft-helpdesk.com", "microsoftalert.com",
  "ms-secure.com", "microsoft-update.net", "office-verification.com",

  // --- Faux Google ---
  "google-security.com", "google-account.net", "google-verify.com",
  "google-support.net", "googIe.com", "g00gle.com", "google-alert.com",
  "google-signin.net", "accounts-google.com", "google-accounts.net",

  // --- Faux Apple ---
  "apple-id.net", "apple-support.com", "apple-security.net",
  "apple-verify.com", "apple-account.com", "icloud-verify.com",
  "apple-login.net", "appleid-confirm.com", "my-apple.com",
  "apple-id-verify.com", "apple-helpdesk.net",

  // --- Faux banques françaises ---
  "bnpparibas-secure.com", "bnpparibas-login.net", "bnp-paribas.net",
  "credit-agricole-secure.com", "ca-bank.net", "credit-agricole.net",
  "societegenerale-secure.com", "sg-bank.net", "lcl-secure.com",
  "caisseepargne-secure.com", "credit-mutuel.net", "labanquepostale-secure.com",
  "boursorama-secure.com", "hsbc-france.net", "axa-banque.net",

  // --- Faux services français ---
  "ameli-secure.com", "amelifr.com", "ameli-remboursement.com",
  "impots-gouv.net", "impots-service.com", "dgfip-secure.com",
  "caf-allocation.com", "caf-aide.net", "pole-emploi-aide.com",
  "cpam-secure.com", "securite-sociale.net", "assurance-maladie.net",
  "chronopost-livraison.com", "laposte-colis.com", "dpd-delivery.net",
  "colissimo-secure.com", "gls-delivery.net",

  // --- Faux Netflix / Streaming ---
  "netflix-secure.com", "netflix-billing.net", "netflix-account.com",
  "netflix-update.net", "netflixlogin.com", "netflix-help.net",
  "disneyplus-secure.com", "spotify-billing.net", "spotify-account.com",
  "amazon-prime-secure.com",

  // --- Domaines suspects génériques ---
  "secure-login-verify.com", "account-verification-center.com",
  "verify-account-secure.net", "update-billing-info.com",
  "account-suspended-verify.com", "security-alert-center.com",
  "login-verification-secure.net", "urgent-account-update.com",
  "billing-update-required.com", "confirm-your-identity.net",
  "refund-claim-center.com", "payment-failed-retry.com",
  "invoice-download.net", "tax-refund-claim.com",

  // --- Techniques courantes ---
  "free-gift-claim.com", "you-won.net", "prize-claim-center.com",
  "survey-reward.com", "lucky-winner.net", "coupon-reward.com",
  "click-here-now.com", "earn-money-fast.net", "work-from-home-profit.com",

  // --- TLD suspects avec marques ---
  "paypal.phishing.net", "amazon.scam.com", "apple.fake.net"
]);

/**
 * Retourne true si le domaine est dans la base phishing
 * Vérifie aussi les sous-domaines
 */
function isKnownPhishing(email) {
  const domain = email.includes("@")
    ? email.split("@").pop().toLowerCase().trim()
    : email.toLowerCase().trim();

  if (PHISHING_DB.has(domain)) return true;

  // Vérifie les sous-domaines (ex: mail.paypal-secure.com)
  const parts = domain.split(".");
  for (let i = 1; i < parts.length - 1; i++) {
    const sub = parts.slice(i).join(".");
    if (PHISHING_DB.has(sub)) return true;
  }
  return false;
}
