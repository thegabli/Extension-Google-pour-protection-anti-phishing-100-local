/**
 * PhishingGuard — popup.js
 * Gestion des onglets, analyse manuelle, whitelist, stats
 */
document.addEventListener("DOMContentLoaded", () => {

  const DET = new PhishingDetector();

  // ── Onglets ──────────────────────────────────────────────
  document.querySelectorAll(".tab").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
      document.querySelectorAll(".panel").forEach(p => p.classList.remove("active"));
      btn.classList.add("active");
      document.getElementById("tab-" + btn.dataset.tab).classList.add("active");
      if (btn.dataset.tab === "whitelist") renderWhitelist();
    });
  });

  // ── Analyser ─────────────────────────────────────────────
  document.getElementById("analyzeBtn").addEventListener("click", analyze);
  document.getElementById("emailInput").addEventListener("keydown", e => {
    if (e.key === "Enter") analyze();
  });

  function analyze() {
    const email = document.getElementById("emailInput").value.trim();
    if (!email) return;

    // Charger la whitelist avant d'analyser
    chrome.storage.local.get("pgWhitelist", d => {
      const wl = new Set(d.pgWhitelist || []);
      const domain = email.includes("@") ? email.split("@").pop().toLowerCase() : email.toLowerCase();
      const userTrusted = wl.has(domain) || wl.has(email.toLowerCase());

      const res    = DET.analyze(email, []);
      const isBad  = res.isPhishing && !userTrusted;
      const color  = isBad ? "#ef4444" : "#22c55e";
      const label  = isBad ? "🚨 PHISHING DÉTECTÉ" : "✅ EMAIL LÉGITIME";
      const bg     = isBad ? "#1f0000" : "#052e16";

      const head = document.getElementById("resultHead");
      head.style.borderColor = color;
      head.style.background  = bg;

      const v = document.getElementById("resultVerdict");
      v.textContent = label;
      v.style.color = color;

      document.getElementById("resultEmail").textContent = email;

      const ul = document.getElementById("resultReasons");
      if (userTrusted) {
        ul.innerHTML = `<li style="color:#4ade80">✅ Dans votre liste de confiance personnelle</li>`;
      } else if (res.reasons.length) {
        ul.innerHTML = res.reasons.map(r => `<li>⚠️ ${r}</li>`).join("");
      } else {
        ul.innerHTML = `<li style="color:#4ade80">✅ Domaine reconnu et sûr</li>`;
      }

      document.getElementById("result").classList.add("show");

    });
  }

  // ── Whitelist ─────────────────────────────────────────────
  document.getElementById("wlAddBtn").addEventListener("click", addEntry);
  document.getElementById("wlInput").addEventListener("keydown", e => {
    if (e.key === "Enter") addEntry();
  });

  function addEntry() {
    const val = document.getElementById("wlInput").value.trim().toLowerCase();
    if (!val) return;

    // Accepte un email complet ou un domaine
    const entry = val.includes("@") ? val.split("@").pop() : val;
    if (!entry) return;

    chrome.storage.local.get("pgWhitelist", d => {
      const wl = new Set(d.pgWhitelist || []);
      wl.add(entry);
      chrome.storage.local.set({ pgWhitelist: [...wl] }, () => {
        document.getElementById("wlInput").value = "";
        renderWhitelist();
      });
    });
  }

  function removeEntry(entry) {
    chrome.storage.local.get("pgWhitelist", d => {
      const wl = new Set(d.pgWhitelist || []);
      wl.delete(entry);
      chrome.storage.local.set({ pgWhitelist: [...wl] }, renderWhitelist);
    });
  }

  function renderWhitelist() {
    chrome.storage.local.get("pgWhitelist", d => {
      const wl   = d.pgWhitelist || [];
      const cont = document.getElementById("wlList");

      if (!wl.length) {
        cont.innerHTML = `<div class="wl-empty">Aucun domaine ajouté pour l'instant.<br>Ajoutez l'email ou le domaine d'un contact de confiance.</div>`;
        return;
      }

      cont.innerHTML = `<div class="wl-list">
        ${wl.map(entry => `
          <div class="wl-item">
            <span class="wl-item-icon">✅</span>
            <span class="wl-item-domain">${entry}</span>
            <button class="wl-item-del" data-entry="${entry}" title="Supprimer">✕</button>
          </div>
        `).join("")}
      </div>`;

      cont.querySelectorAll(".wl-item-del").forEach(btn => {
        btn.addEventListener("click", () => removeEntry(btn.dataset.entry));
      });
    });
  }

  // Chargement initial
  renderWhitelist();
});
