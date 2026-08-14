# Treppenhausreinigung Rostock – Website

Onepager, umgesetzt aus dem Figma-Design. Statische Seite mit **Eleventy** (Generator) und **Decap CMS** (Inhalte pflegen ohne Code). Alle Texte und Bilder sind über das CMS editierbar.

## Struktur

```
src/
  _data/site.json      → Kontakt, Navigation, Öffnungszeiten, Footer
  _data/home.json      → alle Inhalte der Startseite (Texte, Bilder, Buttons)
  index.njk            → Aufbau der Startseite
  impressum.md         → Impressum (editierbar)
  datenschutz.md       → Datenschutzerklärung (editierbar)
  css/style.css        → komplettes Styling (Farben/Design aus Figma)
  assets/uploads/      → alle Bilder
  admin/               → CMS (erreichbar unter /admin/)
```

## Lokal starten

Voraussetzung: [Node.js](https://nodejs.org) installiert.

```bash
npm install
npm start          # Seite auf http://localhost:8080
```

## Inhalte bearbeiten (CMS)

**Lokal** (ohne Login, direkt am Rechner):

```bash
npm run cms        # in einem Terminal
npm start          # in einem zweiten Terminal
```

Dann http://localhost:8080/admin/ öffnen. Änderungen werden direkt in die Dateien geschrieben.

**Online** (empfohlen, nach dem Deploy auf Netlify):

1. Projekt in ein GitHub-Repository pushen
2. Bei [netlify.com](https://netlify.com) anmelden → "Import from Git" → Repository wählen (Build-Einstellungen werden aus `netlify.toml` gelesen)
3. In Netlify: **Site configuration → Identity → Enable Identity**
4. Identity → **Registration: Invite only** setzen und dich selbst einladen
5. Identity → Services → **Enable Git Gateway**
6. Danach ist das CMS unter `deine-domain.de/admin/` erreichbar — Login mit der Einladung aus Schritt 4

Jede Änderung im CMS erzeugt automatisch einen Commit, Netlify baut die Seite neu (ca. 1 Minute).

## Kontaktformular

Das Formular nutzt **Netlify Forms** — funktioniert automatisch nach dem Deploy auf Netlify (bis 100 Einsendungen/Monat kostenlos). Eingänge findest du im Netlify-Dashboard unter "Forms"; dort lässt sich auch eine E-Mail-Benachrichtigung an info@thr-rostock.de einrichten. Bei anderem Hosting muss ein Form-Dienst (z. B. Formspree) eingebunden werden.

## Hosting-Kosten

Netlify Free-Tier reicht für diese Seite vollständig aus (Hosting, CMS-Login, Formulare). Es fällt nur die Domain an (~10–15 €/Jahr). Eigene Domain in Netlify unter "Domain management" verbinden.

## Hinweise

- Schriften: Poppins und Cousine, lokal eingebunden (keine Google-Server, DSGVO-freundlich).
- Bilder werden beim Build automatisch optimiert (WebP + mehrere Größen via @11ty/eleventy-img) — auch alle späteren CMS-Uploads. Im CMS können also bedenkenlos große Fotos hochgeladen werden.
- Die Karte ist ein statisches Bild mit Link zu Google Maps (DSGVO-freundlicher als ein eingebettetes iframe).
- Social-Media-Links in `src/_data/site.json` bzw. im CMS unter "Allgemein" anpassen (aktuell Platzhalter).
