# Google Extension for 100% Local Anti-Phishing Protection
A Chrome extension that detects phishing attempts directly inside Gmail. Runs entirely in the background, with no account, no OAuth, and without sending any data whatsoever.

Why this project?

Phishing attacks are becoming increasingly difficult to spot with the naked eye. A domain such as paypa1.com or support-amazon.net can fool almost anyone at first glance.

This project is a practical attempt to address that problem directly where emails are received, without relying on any third-party service.

What it does

When you open an email in Gmail, the extension silently analyzes the sender and displays a small banner in the top-right corner with its verdict:

Email is known and safe
Email is unknown — proceed with caution
Email is identified as phishing

The banner automatically closes after 10 seconds.

Recent Updates
Multilingual Support

The extension now supports multiple languages:

🇫🇷 French (default)
🇬🇧 English
🇪🇸 Spanish
🇩🇪 German

The language can be changed directly from the popup through an integrated language selector.

The change is applied instantly to both the popup and the Gmail banner.

All interface elements are translated:

Buttons
Analysis messages
Security statuses
Detection reasons
URL analysis results
SPF / DKIM messages
URL Link Analysis

The extension can now automatically analyze links found inside Gmail emails.

When an email contains URLs, a "Links" button appears in the banner to display a detailed analysis.

Each link receives one of the following verdicts:

Safe
Unknown
Dangerous

The analysis is performed entirely locally in the browser, without sending URLs to any external server.

The extension can detect:

Shortened URLs (bit.ly, tinyurl, t.co, etc.)
Punycode domains (xn--)
Fake subdomains impersonating known brands
Suspicious TLDs (.xyz, .zip, .tk, etc.)
Links whose displayed text does not match the actual destination
URLs containing a raw IP address

Shortened links are flagged as "unknown destination" because the extension does not automatically expand URLs, preserving privacy and avoiding any dependency on external services.

What the extension checks
Domain Analysis

The sender's address is compared against a database of more than 80 known phishing domains, including fake:

PayPal
Amazon
Microsoft
French banks
And other commonly impersonated services
Fraudulent Subdomain Detection

A sender such as:

contact@paypal.secure-login.ru

may appear to belong to PayPal, while the actual domain is secure-login.ru.

The extension detects this type of manipulation even if the domain is not yet present in the database.

DKIM / SPF Verification

When Gmail receives an email, it verifies:

Whether the email was sent from an authorized server (SPF)
Whether the message content was modified during transit (DKIM)

The extension reads these results directly from Gmail without making any additional network requests.

If something is suspicious, a warning message appears in the banner.

Personal Blacklists and Whitelists

You can manually add trusted domains through the extension popup.

These lists are stored locally in the browser.

Installation
Download the ZIP file
Extract it into a folder
Open Chrome and go to chrome://extensions
Enable Developer Mode (toggle in the top-right corner)
Click Load unpacked
Select the extracted folder
The extension icon will appear in the Chrome toolbar. Open any Gmail email to see it in action.
Project Structure
phishing-guard/

├── manifest.json      — extension declaration (Manifest V3)

├── phishingDB.js      — phishing domain database

├── detector.js        — detection engine

├── scanner.js         — script injected into Gmail

├── background.js      — service worker

├── popup.html         — popup interface

├── popup.js           — popup logic

└── icons/             — 16 / 48 / 128 px icons

The popup opens when clicking the extension icon in Chrome.

It contains two tabs:

Analyze

Enter any email address to analyze it manually without opening Gmail.

Trust

Add domains from your regular contacts.

Emails originating from these domains will automatically be marked as safe.

Privacy

The extension does not contact any external server.

All analysis is performed locally inside the browser on the Gmail page already open.

The whitelist and blacklist are stored in chrome.storage.local on your machine only.

No account
No authentication
No telemetry
Detection Capabilities
Attack Type	Supported
Fake domain (paypa1.com)	Yes
Fraudulent subdomain	Yes
Unauthorized sending server (SPF)	Yes
Email modified in transit (DKIM)	Yes
Suspicious third-party relay	Yes
Manually blocked domain	Yes
Shortened URLs in email body	Yes
Heuristic URL analysis	Yes
Real-time server verification	In progress
Contributing

To add phishing domains to the database, open a pull request and modify phishingDB.js.

Please include a source for each submission (user report, VirusTotal scan, news article, etc.).

License

CC BY-NC-SA 4.0
