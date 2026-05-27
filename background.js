// ============================================================
//  PhishingGuard — background.js (Service Worker)
// ============================================================

chrome.runtime.onInstalled.addListener(() => {
  console.log("PhishingGuard installé !");
  // Stats initiales
  chrome.storage.local.set({
    stats: { scanned: 0, safe: 0, suspicious: 0, phishing: 0, unknown: 0 }
  });
});

// Écoute les messages du content script pour mettre à jour les stats
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === "UPDATE_STATS") {
    chrome.storage.local.get("stats", (data) => {
      const stats = data.stats || { scanned:0, safe:0, suspicious:0, phishing:0, unknown:0 };
      stats.scanned++;
      if (stats[msg.verdict] !== undefined) stats[msg.verdict]++;
      chrome.storage.local.set({ stats });
    });
    sendResponse({ ok: true });
  }
  return true;
});
