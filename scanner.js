/**
 * PhishingGuard — scanner.js v9
 * Fixes: auto-close 10s, pas de bouton si safe, bug recherche, onglets/pagination
 */
(function () {
  "use strict";

  if (window.__pgScanner) return;
  window.__pgScanner = true;

  const DET = new PhishingDetector();
  let userWhitelist = new Set();

  chrome.storage.local.get("pgWhitelist", function(d) {
    userWhitelist = new Set(d.pgWhitelist || []);
  });

  function getDomain(email) {
    return email.includes("@") ? email.split("@").pop().toLowerCase() : email.toLowerCase();
  }

  function isUserTrusted(email) {
    var domain = getDomain(email);
    return userWhitelist.has(domain) || userWhitelist.has(email.toLowerCase());
  }

  function addToWhitelist(email, onDone) {
    var domain = getDomain(email);
    userWhitelist.add(domain);
    chrome.storage.local.set({ pgWhitelist: [...userWhitelist] }, onDone);
  }

  // ── CSS ─────────────────────────────────────────────────────
  (function injectCSS() {
    if (document.getElementById("pg-style")) return;
    var s = document.createElement("style");
    s.id = "pg-style";
    s.textContent = [
      "#pg-banner {",
      "  position: fixed !important;",
      "  top: 16px !important;",
      "  right: 16px !important;",
      "  width: 270px !important;",
      "  max-width: calc(100vw - 32px) !important;",
      "  background: #0f172a !important;",
      "  border-radius: 12px !important;",
      "  z-index: 2147483647 !important;",
      "  font-family: -apple-system,'Segoe UI',system-ui,sans-serif !important;",
      "  font-size: 13px !important;",
      "  color: #e2e8f0 !important;",
      "  overflow: hidden !important;",
      "  box-shadow: 0 12px 40px rgba(0,0,0,.75) !important;",
      "  animation: pg-slide .25s cubic-bezier(.34,1.4,.64,1) both !important;",
      "}",
      "@keyframes pg-slide {",
      "  from { transform: translateX(310px); opacity: 0; }",
      "  to   { transform: translateX(0);     opacity: 1; }",
      "}",
      "#pg-bar {",
      "  height: 3px !important;",
      "  width: 100% !important;",
      "  transform-origin: left center !important;",
      "}",
      "#pg-main {",
      "  display: flex !important;",
      "  align-items: center !important;",
      "  gap: 9px !important;",
      "  padding: 10px 12px !important;",
      "}",
      "#pg-icon {",
      "  width: 14px !important;",
      "  height: 14px !important;",
      "  border-radius: 50% !important;",
      "  flex-shrink: 0 !important;",
      "  box-shadow: 0 0 8px currentColor !important;",
      "}",
      "#pg-info  { flex: 1 !important; min-width: 0 !important; }",
      "#pg-state {",
      "  font-size: 11px !important;",
      "  font-weight: 800 !important;",
      "  text-transform: uppercase !important;",
      "  letter-spacing: .07em !important;",
      "  line-height: 1.2 !important;",
      "}",
      "#pg-addr {",
      "  font-family: monospace !important;",
      "  font-size: 10px !important;",
      "  color: #475569 !important;",
      "  white-space: nowrap !important;",
      "  overflow: hidden !important;",
      "  text-overflow: ellipsis !important;",
      "  margin-top: 1px !important;",
      "}",
      "#pg-reason {",
      "  font-size: 10px !important;",
      "  color: #64748b !important;",
      "  margin-top: 2px !important;",
      "  line-height: 1.3 !important;",
      "}",
      "#pg-close {",
      "  background: none !important;",
      "  border: none !important;",
      "  color: #334155 !important;",
      "  font-size: 18px !important;",
      "  line-height: 1 !important;",
      "  cursor: pointer !important;",
      "  padding: 2px 4px !important;",
      "  flex-shrink: 0 !important;",
      "}",
      "#pg-close:hover { color: #94a3b8 !important; }",
      "#pg-actions { padding: 0 10px 10px !important; }",
      "#pg-btn-wl {",
      "  width: 100% !important;",
      "  padding: 7px 10px !important;",
      "  border-radius: 7px !important;",
      "  font-size: 11px !important;",
      "  font-weight: 600 !important;",
      "  cursor: pointer !important;",
      "  text-align: center !important;",
      "  display: block !important;",
      "}",
      "#pg-btn-wl.add {",
      "  background: rgba(255,255,255,.05) !important;",
      "  border: 1px solid rgba(255,255,255,.1) !important;",
      "  color: #94a3b8 !important;",
      "}",
      "#pg-btn-wl.add:hover { background: rgba(255,255,255,.1) !important; }",
      "#pg-btn-wl.done {",
      "  background: rgba(34,197,94,.12) !important;",
      "  border: 1px solid rgba(34,197,94,.3) !important;",
      "  color: #4ade80 !important;",
      "  cursor: default !important;",
      "}",
      "#pg-toast {",
      "  position: fixed !important;",
      "  bottom: 16px !important;",
      "  right: 16px !important;",
      "  background: #0f172a !important;",
      "  border: 1px solid rgba(34,197,94,.4) !important;",
      "  color: #4ade80 !important;",
      "  border-radius: 8px !important;",
      "  padding: 8px 14px !important;",
      "  font-family: -apple-system,'Segoe UI',system-ui,sans-serif !important;",
      "  font-size: 12px !important;",
      "  font-weight: 600 !important;",
      "  z-index: 2147483647 !important;",
      "  animation: pg-slide .25s cubic-bezier(.34,1.4,.64,1) both !important;",
      "}",
      "a.pg-link-ok  { border-bottom: 2px solid rgba(34,197,94,.5) !important; }",
      "a.pg-link-bad { border-bottom: 2px solid rgba(239,68,68,.5) !important; }",
      "a.pg-link-unk { border-bottom: 2px solid rgba(245,158,11,.5) !important; }",
      "#pg-auth-warn {",
      "  margin: 0 10px 8px !important;",
      "  background: rgba(239,68,68,.1) !important;",
      "  border: 1px solid rgba(239,68,68,.3) !important;",
      "  border-radius: 6px !important;",
      "  padding: 5px 8px !important;",
      "  font-size: 9.5px !important;",
      "  color: #fca5a5 !important;",
      "  line-height: 1.4 !important;",
      "}",
      "#pg-auth-ok {",
      "  margin: 0 10px 8px !important;",
      "  background: rgba(34,197,94,.08) !important;",
      "  border: 1px solid rgba(34,197,94,.25) !important;",
      "  border-radius: 6px !important;",
      "  padding: 5px 8px !important;",
      "  font-size: 9.5px !important;",
      "  color: #86efac !important;",
      "  line-height: 1.4 !important;",
      "}",
      "#pg-auth-line {",
      "  display: flex !important;",
      "  align-items: center !important;",
      "  gap: 5px !important;",
      "  padding: 3px 12px 6px !important;",
      "  font-size: 9px !important;",
      "  color: #94a3b8 !important;",
      "  letter-spacing: .02em !important;",
      "}",
      "#pg-auth-line.ok  { color: #86efac !important; }",
      "#pg-auth-line.bad { color: #fca5a5 !important; font-weight: 600 !important; }"
    ].join("\n");
    (document.head || document.documentElement).appendChild(s);
  })();

  // ── Lecture DKIM/SPF depuis le DOM de Gmail ─────────────────
  //
  // Gmail affiche "mailed-by" et "signed-by" dans les détails de l'email.
  // On ne peut PAS faire de requêtes DNS directement depuis une extension,
  // mais Gmail a déjà vérifié DKIM/SPF et expose le résultat dans le DOM.
  //
  // Cas détectables :
  //  • "mailed-by" différent du domaine expéditeur → SPF suspect (email spoofing potentiel)
  //  • "signed-by" absent alors que le domaine est connu → DKIM manquant
  //  • "via autredomain.com" affiché par Gmail → expéditeur relayé par un tiers
  function readGmailAuthInfo() {
    var info = { mailedBy: null, signedBy: null, via: null, raw: "" };

    // ── Stratégie A : "via" visible sans expansion ───────────────
    // Gmail affiche "via autredomain.com" en clair quand SPF échoue,
    // même avant que l'utilisateur ait ouvert les détails.
    try {
      // Chercher n'importe quel nœud texte contenant "via " suivi d'un domaine
      var allEls = document.querySelectorAll(
        ".gar, .gK span, .go span, .aef span, [email] ~ span, .iN span"
      );
      allEls.forEach(function(el) {
        if (el.closest("#pg-banner")) return;
        var txt = el.textContent.trim();
        if (/^via\s+\S+\.\S+/i.test(txt)) {
          info.via = txt.replace(/^via\s+/i, "").trim();
        }
      });
    } catch(e) {}

    // ── Stratégie B : scan de TOUT le texte de la zone de détails ─
    // Après expansion, Gmail insère une table ou des spans avec des labels
    // comme "mailed-by" / "signé par". On parse le texte brut pour être
    // indépendant des classes CSS qui changent souvent.
    try {
      // Cibler la zone email visible (pas la sidebar, pas les onglets)
      var emailBody = document.querySelector(
        ".h7, .ii.gt, .a3s, .nH .if, [role=main] .a3s"
      );
      var root = emailBody
        ? emailBody.closest(".nH") || document.body
        : document.body;

      // Collecter tous les éléments ayant du texte court (probablement des labels)
      var spans = root.querySelectorAll(
        "span, td, div.aef, div.hb, [data-hovercard-owner-id] ~ *"
      );
      spans.forEach(function(el) {
        if (el.closest("#pg-banner")) return;
        var txt = el.textContent.trim().toLowerCase();
        if (!txt || txt.length > 120) return;

        // Détection label + valeur adjacente
        var isMailedBy = txt === "mailed-by" || txt === "envoyé par";
        var isSignedBy = txt === "signed-by" || txt === "signé par";

        if (isMailedBy || isSignedBy) {
          // La valeur est soit dans le nœud frère suivant, soit un enfant direct
          var next = el.nextElementSibling;
          var val  = next ? next.textContent.trim() : "";
          // Sinon chercher dans le même élément parent
          if (!val) {
            var parent = el.parentElement;
            val = parent ? parent.textContent.replace(el.textContent, "").trim() : "";
          }
          if (val && val.includes(".")) {
            if (isMailedBy && !info.mailedBy) info.mailedBy = val;
            if (isSignedBy && !info.signedBy) info.signedBy = val;
          }
        }

        // Détection inline "mailed-by: domain.com" dans une seule chaîne
        var mbMatch = txt.match(/mailed[\s-]by[:\s]+([a-z0-9._-]+\.[a-z]{2,})/i);
        var sbMatch = txt.match(/signed[\s-]by[:\s]+([a-z0-9._-]+\.[a-z]{2,})/i);
        if (mbMatch && !info.mailedBy) info.mailedBy = mbMatch[1];
        if (sbMatch && !info.signedBy) info.signedBy = sbMatch[1];
      });
    } catch(e) {}

    // ── Stratégie C : tableaux HTML classiques (ancienne vue Gmail) ─
    try {
      document.querySelectorAll("tr").forEach(function(row) {
        if (row.closest("#pg-banner")) return;
        var cells = row.querySelectorAll("td");
        if (cells.length < 2) return;
        var label = cells[0].textContent.toLowerCase().trim();
        var value = cells[1].textContent.trim();
        if (!value || !value.includes(".")) return;
        if (label.includes("mailed-by") || label.includes("envoyé par"))
          info.mailedBy = info.mailedBy || value;
        if (label.includes("signed-by") || label.includes("signé par"))
          info.signedBy = info.signedBy || value;
      });
    } catch(e) {}

    return info;
  }

  // ── Expansion des en-têtes Gmail (sans OAuth) ────────────────
  //
  // Gmail n'affiche mailed-by/signed-by dans le DOM QUE quand l'utilisateur
  // a cliqué sur "afficher les détails". Cette fonction simule ce clic
  // programmatiquement pour déclencher le rendu sans interaction manuelle.
  //
  // Zéro donnée envoyée à Google — on manipule uniquement la page déjà ouverte.
  function expandGmailHeaders(callback) {
    var btn = null;

    // ── Stratégie 1 : chercher par tooltip/aria-label contenant "détail" ou "detail"
    // C'est la méthode la plus robuste car Gmail traduit ses labels mais garde
    // le même texte sémantique, même quand les classes CSS changent.
    var candidates = document.querySelectorAll(
      "[data-tooltip], [aria-label], [title]"
    );
    for (var i = 0; i < candidates.length; i++) {
      var el = candidates[i];
      if (el.closest("#pg-banner")) continue;  // ignorer nos propres éléments
      var tip = (
        el.getAttribute("data-tooltip") ||
        el.getAttribute("aria-label")   ||
        el.getAttribute("title")        || ""
      ).toLowerCase();
      // fr: "afficher les détails"  en: "show details"  → on cherche "étail" ou "etail"
      if (tip.includes("\u00e9tail") || tip.includes("etail")) {
        btn = el;
        break;
      }
    }

    // ── Stratégie 2 : zone expéditeur → chercher un élément cliquable avec ">"
    // Gmail affiche parfois une flèche/chevron dans .gE .ajR ou .gE .T-I
    if (!btn) {
      var senderZone = document.querySelector(".gE, .go, .iN.iN");
      if (senderZone) {
        var clickables = senderZone.querySelectorAll(
          "span[role=button], div[role=button], button, .ajR, .T-I"
        );
        for (var j = 0; j < clickables.length; j++) {
          var c = clickables[j];
          if (!c.closest("#pg-banner") && c.getAttribute("aria-expanded") !== "true") {
            btn = c;
            break;
          }
        }
      }
    }

    // ── Stratégie 3 : cliquer directement sur la zone des détails expéditeur
    // Dans Gmail moderne, l'élément .go est la ligne "De:" cliquable elle-même
    if (!btn) {
      var goEl = document.querySelector(".go");
      if (goEl && !goEl.closest("#pg-banner")) btn = goEl;
    }

    if (btn) {
      try { btn.click(); } catch(e) {}
      // Laisser 800ms à Gmail pour re-rendre le DOM
      setTimeout(callback, 800);
    } else {
      callback();
    }
  }

  // Analyse les infos auth et retourne une liste d'alertes
  function checkAuth(senderEmail, authInfo) {
    var alerts = [];
    var senderDomain = getDomain(senderEmail);

    // SPF : mailed-by doit correspondre au domaine expéditeur
    if (authInfo.mailedBy) {
      var mb = authInfo.mailedBy.toLowerCase().replace(/^@/, "");
      if (!mb.endsWith(senderDomain) && !senderDomain.endsWith(mb)) {
        alerts.push("SPF suspect : envoyé via \"" + mb + "\" (expéditeur : " + senderDomain + ")");
      }
    }

    // DKIM : signed-by doit correspondre au domaine expéditeur
    if (authInfo.signedBy) {
      var sb = authInfo.signedBy.toLowerCase().replace(/^@/, "");
      if (!sb.endsWith(senderDomain) && !senderDomain.endsWith(sb)) {
        alerts.push("DKIM suspect : signé par \"" + sb + "\" (expéditeur : " + senderDomain + ")");
      }
    }

    // Via : expéditeur relayé par un tiers
    if (authInfo.via) {
      var via = authInfo.via.toLowerCase();
      if (!via.endsWith(senderDomain) && !senderDomain.endsWith(via)) {
        alerts.push("Relayé via \"" + authInfo.via + "\" — domaine tiers détecté");
      }
    }

    return alerts;
  }

  // ── Toast ────────────────────────────────────────────────────
  function showToast(msg) {
    var old = document.getElementById("pg-toast");
    if (old) old.remove();
    var t = document.createElement("div");
    t.id = "pg-toast";
    t.textContent = msg;
    document.body.appendChild(t);
    setTimeout(function() { if (t.parentNode) t.remove(); }, 2800);
  }

  // ── Bannière ─────────────────────────────────────────────────
  var autoCloseTimer = null;

  function showBanner(email) {
    var old = document.getElementById("pg-banner");
    if (old) old.remove();
    clearTimeout(autoCloseTimer);

    chrome.storage.local.get("pgWhitelist", function(d) {
      userWhitelist = new Set(d.pgWhitelist || []);

      var inList = isUserTrusted(email);
      var domain = getDomain(email);

      var result;
      if (inList) {
        result = { state: "safe", reason: "Dans votre liste de confiance" };
      } else {
        result = DET.analyze(email);
      }

      var palette = {
        safe:     { bar: "#22c55e", color: "#4ade80", dot: "#22c55e", label: "Email connu et sur" },
        unknown:  { bar: "#f59e0b", color: "#fbbf24", dot: "#f59e0b", label: "Email inconnu" },
        phishing: { bar: "#ef4444", color: "#f87171", dot: "#ef4444", label: "Phishing detecte" }
      };
      var p = palette[result.state] || palette.unknown;

      // Bouton "Ajouter à ma liste" uniquement si email NON sûr
      var wlHtml = result.state !== "safe"
        ? '<button id="pg-btn-wl" class="add">＋ Ajouter a ma liste de confiance</button>'
        : "";

      var b = document.createElement("div");
      b.id = "pg-banner";

      b.innerHTML =
        '<div id="pg-bar" style="background:' + p.bar + '"></div>' +
        '<div id="pg-main">' +
          '<span id="pg-icon" style="background:' + p.dot + ';color:' + p.dot + '"></span>' +
          '<div id="pg-info">' +
            '<div id="pg-state" style="color:' + p.color + '">' + p.label + '</div>' +
            '<div id="pg-addr" title="' + email + '">' + email + '</div>' +
            '<div id="pg-reason">' + result.reason + '</div>' +
          '</div>' +
          '<button id="pg-close" title="Fermer">&times;</button>' +
        '</div>' +
        '<div id="pg-auth-line">⟳ Vérification DKIM / SPF…</div>' +
        '<div id="pg-auth-zone"></div>' +
        (wlHtml ? '<div id="pg-actions">' + wlHtml + '</div>' : '');

      document.body.appendChild(b);

      // Barre de progression animée en JS (évite les conflits !important CSS)
      var bar = b.querySelector("#pg-bar");
      var DURATION = 10000; // 10 secondes
      var startTime = Date.now();
      var barInterval = setInterval(function() {
        var elapsed = Date.now() - startTime;
        var ratio = Math.max(0, 1 - elapsed / DURATION);
        bar.style.transform = "scaleX(" + ratio + ")";
        if (ratio <= 0) clearInterval(barInterval);
      }, 50);

      function closeBanner() {
        clearInterval(barInterval);
        clearTimeout(autoCloseTimer);
        if (b.parentNode) b.remove();
      }

      b.querySelector("#pg-close").onclick = closeBanner;

      // Fermeture automatique après 10 secondes
      autoCloseTimer = setTimeout(closeBanner, DURATION);

      // ── Bouton "Ajouter à ma liste" ──────────────────────────
      var wlBtn = b.querySelector("#pg-btn-wl");
      if (wlBtn) {
        wlBtn.onclick = function() {
          addToWhitelist(email, function() {
            wlBtn.className = "done";
            wlBtn.textContent = "Ajoute a votre liste ✓";
            wlBtn.onclick = null;
            showToast("✅ \"" + domain + "\" ajoute a votre liste");
          });
        };
      }

      // ── Vérification DKIM / SPF automatique et silencieuse ──────
      // Étapes :
      //  1. Lecture passive (si Gmail a déjà rendu les détails)
      //  2. Si rien trouvé → expansion silencieuse (clic programmatique)
      //  3. Lecture après 800 ms
      //  4. Refermeture du panneau Gmail (clic à nouveau pour replier)
      //  5. Affichage du résultat en une petite ligne discrète
      var authLine = b.querySelector("#pg-auth-line");
      var authZone = b.querySelector("#pg-auth-zone");

      function showAuthResult(authInfo, authAlerts) {
        var hasData = authInfo.mailedBy || authInfo.signedBy || authInfo.via;

        if (!hasData) {
          // En-têtes non accessibles → ligne neutre discrète
          authLine.className = "";
          authLine.textContent = "DKIM / SPF : données non disponibles";
          return;
        }

        if (authAlerts.length) {
          // Anomalie détectée → ligne rouge + bloc d'alerte
          authLine.className = "bad";
          authLine.textContent = "⚠ Expéditeur douteux — anomalie DKIM / SPF";
          authZone.innerHTML =
            '<div id="pg-auth-warn">' + authAlerts.join("<br>") + '</div>';
        } else {
          // Tout OK → ligne verte discrète
          authLine.className = "ok";
          authLine.textContent = "✓ DKIM / SPF : expéditeur authentifié";
        }
      }

      // Étape 1 : lecture passive (0 ms de délai)
      (function runAuthCheck() {
        var info1 = readGmailAuthInfo();
        var alerts1 = checkAuth(email, info1);

        if (info1.mailedBy || info1.signedBy || info1.via) {
          // Données déjà disponibles → résultat immédiat, rien à cliquer
          showAuthResult(info1, alerts1);
          return;
        }

        // Étape 2 : expansion silencieuse
        expandGmailHeaders(function() {
          // Étape 3 : lecture après expansion
          var info2   = readGmailAuthInfo();
          var alerts2 = checkAuth(email, info2);

          // Étape 4 : refermeture — on reclique le même bouton pour replier
          // (Gmail bascule ouvert/fermé au même endroit)
          expandGmailHeaders(function() {
            // Étape 5 : affichage du résultat (le panneau Gmail est refermé)
            showAuthResult(info2, alerts2);
          });

          // Si pas de données non plus après expansion, on affiche quand même
          if (!info2.mailedBy && !info2.signedBy && !info2.via) {
            showAuthResult(info2, alerts2);
          }
        });
      })();

    });
  }

  // ── Détection email ouvert dans Gmail ────────────────────────
  //
  // URLs Gmail connues :
  //   #inbox/FMfcgz...              → email boîte de réception
  //   #category/purchases/FMfcgz... → email onglet Achats
  //   #category/social/FMfcgz...    → email onglet Réseau
  //   #search/motclé                → recherche (PAS un email)
  //   #search/motclé/FMfcgz...      → email dans résultats de recherche
  //   #compose                      → rédaction (ignoré)
  //
  // FIX #3 & #4 : on vérifie que le DERNIER segment du hash est
  // un ID Gmail valide (>= 12 caractères alphanumériques).
  // "google" fait 6 chars → ne déclenche PAS. ✓
  // "FMfcgzQVwrfD..." fait 26 chars → déclenche. ✓
  function isEmailOpen() {
    var h = location.hash;
    if (!h || h.includes("compose")) return false;
    var parts = h.split("/");
    var last = parts[parts.length - 1];
    // Un ID Gmail est une longue chaîne alphanumérique (min 12 chars)
    return last.length >= 12 && /^[a-zA-Z0-9]+$/.test(last);
  }

  function readGmailSender() {
    var selectors = [
      function() { var el = document.querySelector(".ha .go .gD"); return el && el.getAttribute("email"); },
      function() { var el = document.querySelector(".gD");          return el && el.getAttribute("email"); },
      function() { var el = document.querySelector(".h7 [email]");  return el && el.getAttribute("email"); },
      function() { var el = document.querySelector('[data-hovercard-id*="@"]'); return el && el.getAttribute("data-hovercard-id"); },
    ];
    for (var i = 0; i < selectors.length; i++) {
      try {
        var e = selectors[i]();
        if (e && e.includes("@")) return e.trim();
      } catch(err) {}
    }
    return null;
  }

  var currentUrl   = location.href;
  var lastAnalyzed = null;
  var retryTimer   = null;

  function onUrlChange() {
    clearTimeout(retryTimer);

    if (!isEmailOpen()) {
      // FIX #3 : on ferme la bannière quand on quitte un email
      var b = document.getElementById("pg-banner");
      if (b) b.remove();
      clearTimeout(autoCloseTimer);
      lastAnalyzed = null;
      return;
    }

    // FIX #4 : on reset lastAnalyzed à chaque changement d'URL
    // pour forcer la re-détection même sur pagination/onglets
    lastAnalyzed = null;

    var attempts = 0;
    function tryRead() {
      var email = readGmailSender();
      if (email && email !== lastAnalyzed) {
        lastAnalyzed = email;
        showBanner(email);
        return;
      }
      if (++attempts < 16) retryTimer = setTimeout(tryRead, 200);
    }
    tryRead();
  }

  // ── Liens mailto ─────────────────────────────────────────────
  function scanMailto() {
    document.querySelectorAll('a[href^="mailto:"]').forEach(function(link) {
      if (link.dataset.pg) return;
      link.dataset.pg = "1";
      var email = decodeURIComponent(
        link.getAttribute("href").replace(/^mailto:/i, "").split("?")[0]
      ).trim();
      if (!email.includes("@")) return;
      var res = DET.analyze(email);
      if (isUserTrusted(email)) res.state = "safe";
      var cls = res.state === "safe" ? "pg-link-ok" : res.state === "phishing" ? "pg-link-bad" : "pg-link-unk";
      link.classList.add(cls);
      link.addEventListener("click", function(e) { e.preventDefault(); showBanner(email); });
    });
  }

  // ── Observer + init ──────────────────────────────────────────
  new MutationObserver(function() {
    if (location.href !== currentUrl) {
      currentUrl = location.href;
      onUrlChange();
    }
    scanMailto();
  }).observe(document.body, { childList: true, subtree: true });

  function init() {
    scanMailto();
    onUrlChange();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

})();
