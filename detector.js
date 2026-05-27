/**
 * PhishingGuard — detector.js
 * Retourne 3 états : "safe" | "unknown" | "phishing"
 * Dépend de phishingDB.js (chargé avant lui)
 */
class PhishingDetector {

  constructor() {
    this.trusted = new Set([
      // Email grand public
      "gmail.com","googlemail.com","outlook.com","hotmail.com","hotmail.fr",
      "live.com","live.fr","yahoo.com","yahoo.fr","icloud.com","me.com",
      "mac.com","protonmail.com","proton.me","tutanota.com","laposte.net",
      "orange.fr","sfr.fr","free.fr","wanadoo.fr","numericable.fr",
      // Google
      "google.com","google.fr","google.es","google.de","google.co.uk",
      "youtube.com","googleapis.com","gstatic.com","googleusercontent.com",
      "googlevideo.com","ytimg.com",
      // Microsoft
      "microsoft.com","microsoft.fr","office.com","office365.com",
      "windows.com","bing.com","skype.com","msn.com","azure.com",
      "github.com","linkedin.com","sharepoint.com","teams.microsoft.com",
      // Apple
      "apple.com","apple.fr","icloud.com","me.com","mac.com",
      // Amazon
      "amazon.com","amazon.fr","amazon.de","amazon.co.uk","amazon.es","amazon.it",
      "primevideo.com","amazonaws.com","amazon.ca",
      // Meta
      "facebook.com","fb.com","instagram.com","whatsapp.com","wa.me",
      "messenger.com","meta.com","fbcdn.net","cdninstagram.com","twimg.com",
      // Streaming
      "netflix.com","netflix.fr","spotify.com","spotify.fr","disneyplus.com",
      "disney.com","hulu.com","max.com","twitch.tv","tiktok.com",
      "deezer.com","crunchyroll.com","soundcloud.com","dailymotion.com","vimeo.com",
      // Réseaux sociaux
      "twitter.com","x.com","reddit.com","discord.com","discordapp.com",
      "snapchat.com","pinterest.com","tumblr.com","telegram.org","signal.org","slack.com","zoom.us",
      // Paiement
      "paypal.com","paypal.fr","stripe.com","paypalobjects.com",
      "visa.com","mastercard.com","americanexpress.com",
      // Banques françaises
      "bnpparibas.fr","bnpparibas.com","societegenerale.fr","sg.fr",
      "credit-agricole.fr","lcl.fr","lcl.com","caissedepargne.fr",
      "banquepopulaire.fr","bpce.fr","hellobank.fr","boursorama.com",
      "boursorama-banque.com","fortuneo.fr","monabanq.fr","ing.fr",
      "hsbc.fr","hsbc.com","barclays.fr","labanquepostale.fr",
      "bred.fr","cic.fr","axa.fr","macif.fr","maif.fr","groupama.fr","mma.fr",
      // Services publics FR
      "impots.gouv.fr","ameli.fr","assurance-maladie.fr","caf.fr",
      "pole-emploi.fr","francetravail.fr","service-public.fr","gouv.fr",
      "franceconnect.gouv.fr","ants.gouv.fr","parcoursup.fr","cpam.fr",
      // Telecom FR
      "orange.com","bouyguestelecom.fr","free-mobile.fr","sosh.fr","red-by-sfr.fr",
      // Livraison
      "laposte.fr","colissimo.fr","chronopost.fr","dhl.com","fedex.com",
      "ups.com","dpd.fr","gls-france.fr","mondialrelay.fr",
      // Transport
      "sncf.com","sncf-connect.com","ratp.fr","airfrance.fr","airfrance.com",
      "klm.com","easyjet.com","ryanair.com","transavia.com","blablacar.fr","uber.com",
      // E-commerce FR
      "fnac.com","cdiscount.com","darty.com","boulanger.com","leroymerlin.fr",
      "ikea.com","ikea.fr","decathlon.fr","decathlon.com","zalando.fr",
      "veepee.fr","vente-privee.com","showroomprive.com","leboncoin.fr",
      "ebay.fr","ebay.com","etsy.com","aliexpress.com","shopify.com",
      // Tech / SaaS
      "dropbox.com","notion.so","figma.com","canva.com","adobe.com",
      "wordpress.com","cloudflare.com","salesforce.com","hubspot.com",
      "wetransfer.com","booking.com","airbnb.fr","airbnb.com",
      // Médias FR
      "lemonde.fr","lefigaro.fr","liberation.fr","leparisien.fr",
      "bfmtv.com","france24.com","francetvinfo.fr","20minutes.fr",
      // Autres
      "wikipedia.org","wikimedia.org","stackoverflow.com",
    ]);

    this.suspiciousKeywords = [
      "secure","login","verify","update","confirm","billing","support",
      "helpdesk","alert","suspended","urgent","payment","invoice",
      "refund","claim","prize","winner","reward","free","gift","account",
    ];

    this.suspiciousTLDs = new Set([
      "xyz","top","click","link","work","loan","download","stream",
      "gq","ml","cf","tk","buzz","site","online","club","win","bid","review"
    ]);
  }

  /**
   * Analyse un email.
   * Retourne : { state: "safe"|"unknown"|"phishing", reason: string }
   */
  analyze(email) {
    const lower  = email.toLowerCase().trim();
    const domain = lower.includes("@") ? lower.split("@").pop() : lower;

    // 1. Dans la base phishing connue ?
    if (typeof isKnownPhishing === "function" && isKnownPhishing(email)) {
      return { state: "phishing", reason: "Référencé dans notre base phishing" };
    }

    // 2. Dans la whitelist personnelle ? (gérée dans scanner.js)
    // → Traité en amont dans scanner.js

    // 3. Dans la base de confiance ?
    if (this._isTrusted(domain)) {
      return { state: "safe", reason: "Domaine répertorié comme fiable" };
    }

    // 4. Analyse heuristique
    const flags = this._heuristics(domain);
    if (flags.length >= 2) {
      return { state: "phishing", reason: flags[0] };
    }
    if (flags.length === 1) {
      return { state: "unknown", reason: flags[0] };
    }

    // 5. Inconnu mais pas de signal d'alarme
    return { state: "unknown", reason: "Domaine non répertorié dans notre base" };
  }

  _isTrusted(domain) {
    const d = domain.replace(/^www\./, "");
    if (this.trusted.has(d)) return true;
    const parts = d.split(".");
    // Vérifie les domaines parents : mail.google.com → google.com ✓
    for (let i = 1; i < parts.length - 1; i++) {
      if (this.trusted.has(parts.slice(i).join("."))) return true;
    }
    return false;
  }

  /**
   * Détecte les attaques par sous-domaine :
   * "paypal.com.evil.com" → root = evil.com (non fiable) mais label "paypal.com" imite PayPal
   * "paypal.evil.com"     → root = evil.com (non fiable) mais label "paypal" imite PayPal
   * "mail.paypal.com"     → root = paypal.com (fiable) → légitime ✓
   */
  _isSubdomainSpoofing(domain) {
    if (this._isTrusted(domain)) return false; // sous-domaine légitime, pas un spoofing
    const parts = domain.split(".");
    if (parts.length < 3) return false;
    // Racine du domaine = 2 dernières parties (ex: "evil.com")
    const root = parts.slice(-2).join(".");
    if (this.trusted.has(root)) return false; // racine fiable = sous-domaine légitime
    // Cherche une marque connue dans les labels du sous-domaine
    const subLabels = parts.slice(0, -2).join(".");
    const brands = [
      "paypal","amazon","google","apple","microsoft","netflix","facebook",
      "instagram","whatsapp","ameli","impots","banque","bank","credit","sfr",
      "orange","bouygues","la-poste","laposte","chronopost","bnp","societe-generale"
    ];
    for (const b of brands) {
      if (subLabels.includes(b)) return b;
    }
    return false;
  }

  _heuristics(domain) {
    const flags = [];

    // 1. Attaque par sous-domaine (ex: paypal.com.evil.com)
    const spoofedBrand = this._isSubdomainSpoofing(domain);
    if (spoofedBrand) {
      // Double flag → immédiatement PHISHING
      flags.push('Usurpation de sous-domaine : "' + spoofedBrand + '" dans un domaine non fiable');
      flags.push("Technique classique de phishing par sous-domaine");
      return flags;
    }

    // 2. Marque connue dans un domaine non fiable
    const brands = [
      "paypal","amazon","google","apple","microsoft","netflix",
      "facebook","instagram","whatsapp","ameli","impots","banque","bank"
    ];
    for (const b of brands) {
      if (domain.includes(b) && !this._isTrusted(domain)) {
        flags.push('Imitation probable de "' + b + '"');
        break;
      }
    }

    // 3. Mots-clés suspects
    for (const kw of this.suspiciousKeywords) {
      if (domain.includes(kw)) { flags.push('Mot-clé suspect : "' + kw + '"'); break; }
    }

    // 4. TLD suspect
    const tld = domain.split(".").pop();
    if (this.suspiciousTLDs.has(tld)) {
      flags.push("Extension de domaine suspecte : ." + tld);
    }

    // 5. Tirets excessifs
    if ((domain.match(/-/g) || []).length >= 2) {
      flags.push("Domaine avec plusieurs tirets");
    }

    // 6. Chiffres remplaçant des lettres
    if (/[0-9]/.test(domain.split(".")[0])) {
      flags.push("Chiffres suspects dans le domaine");
    }

    return flags;
  }
}
