# Extension-Google-pour-protection-anti-phishing-100-local
Extension Chrome de détection de phishing dans Gmail. Fonctionne en arrière-plan, sans compte, sans OAuth, sans envoyer la moindre donnée.

Pourquoi ce projet :

Les attaques par phishing sont de plus en plus difficiles à repérer à l'oeil nu. Un domaine comme paypa1.com ou support-amazon.net peut tromper n'importe qui au premier coup d'oeil. Ce projet est une tentative concrète de combler ce manque directement là où on reçoit ses emails, sans passer par un service tiers.

Ce que ça fait :

Quand vous ouvrez un email dans Gmail, l'extension analyse silencieusement l'expéditeur et affiche une petite bannière en haut à droite avec son verdict :

L'email est connu et sûr
L'email est inconnu — à traiter avec prudence
L'email est identifié comme phishing
La bannière se ferme automatiquement au bout de 10 secondes.

Voici ce que l'extension vérifie concrètement :

Analyse du domaine Compare l'adresse de l'expéditeur avec une base de 80+ domaines phishing connus : faux PayPal, faux Amazon, faux Microsoft, fausses banques françaises, etc.

Détection des sous-domaines frauduleux Un expéditeur comme contact@paypal.secure-login.ru a l'air d'appartenir à PayPal, mais le vrai domaine est secure-login.ru. L'extension détecte ce type de manipulation même si le domaine ne figure pas dans la base.

Vérification DKIM / SPF Gmail vérifie à la réception si l'email a bien été envoyé depuis un serveur autorisé (SPF) et si son contenu n'a pas été modifié en transit (DKIM). L'extension lit ces résultats directement dans la page, sans aucun appel réseau supplémentaire. Si quelque chose cloche, une ligne d'alerte apparaît dans la bannière.

Blacklist et whitelist personnelles Vous pouvez ajouter manuellement des domaines à faire confiance depuis le popup de l'extension. Ces listes sont stockées localement dans le navigateur.

Installation :

1- Téléchargez le ZIP

2- Décompressez-le dans un dossier

3- Dans Chrome, allez sur chrome://extensions

4- Activez le mode développeur (interrupteur en haut à droite)

5- Cliquez sur "Charger l'extension non empaquetée"

6- Sélectionnez le dossier décompressé

7- L'icône apparaît dans la barre Chrome. Ouvrez n'importe quel email dans Gmail pour voir l'extension en action.

Structure du projet    

├── phishing-guard/

├── manifest.json      — déclaration de l'extension (Manifest V3)

├── phishingDB.js      — base de domaines phishing

├── detector.js        — moteur d'analyse

├── scanner.js         — script injecté dans Gmail

├── background.js      — service worker

├── popup.html         — interface du popup

├── popup.js           — logique popup

└── icons/             — icônes 16 / 48 / 128 px

Le popup s'ouvre en cliquant sur l'icône dans la barre Chrome. Il contient deux onglets :

Analyser — entrez n'importe quelle adresse email pour l'analyser manuellement sans avoir à ouvrir Gmail.

Confiance — ajoutez les domaines de vos contacts habituels. Les emails venant de ces domaines seront automatiquement marqués comme sûrs.


Confidentialité
L'extension ne contacte aucun serveur externe. Toute l'analyse se fait dans le navigateur, sur la page Gmail déjà ouverte. La whitelist et la blacklist sont stockées dans chrome.storage.local, sur votre machine uniquement.

Aucun compte, aucune authentification, aucune télémétrie.

Ce qui est détecté :

Type d'attaque	Pris en charge

Faux domaine (paypa1.com)	Oui

Sous-domaine frauduleux	Oui

Serveur d'envoi non autorisé (SPF)	Oui

Email modifié en transit (DKIM)	Oui

Relayeur tiers suspect	Oui

Domaine bloqué manuellement	Oui

URLs raccourcies dans le corps	En cours

Vérification en temps réel via serveur	En cours

Contribuer

Pour ajouter des domaines phishing à la base, ouvrez une pull request en modifiant phishingDB.js. Merci d'inclure une source (signalement, scan VirusTotal, article de presse, etc.).

Licence
CC BY-NC-SA 4.0
