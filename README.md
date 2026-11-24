# Pruefwerk

Plausibilitaetspruefung fuer Ausweisfotos, gedacht fuer Unternehmen, die Kundschaft verifizieren. Laeuft komplett im Browser, es wird nichts hochgeladen. Start: `START.cmd` (nur 127.0.0.1), Adresse http://127.0.0.1:8780/index.html. Startseite mit Laendersuche (250 Staaten und Gebiete, ISO 3166), Favoriten, Dokumentart je Land. `pruefen.html` prueft, `info.html` erklaert jede Pruefung.

## Was geprueft wird
- MRZ nach ICAO 9303 (TD1, TD2, TD3): Format, Zeichen, alle Pruefziffern (7-3-1), Gesamt-Pruefziffer
- Aussteller-Code gegen gewaehltes Land (EU-27, Indien, Bangladesch, Pakistan, USA, Kanada, Mexiko)
- Datumslogik: Geburt, Ablauf, Ausstellung, Gueltigkeitsdauer
- Abgleich Sichtzone gegen MRZ (freiwillig eingetippt)
- OCR lokal (Tesseract in vendor/): liest MRZ und Sichtzone, markiert gefundene Felder im Bild, meldet fehlende
- Datei: Bearbeitungssoftware und KI-Kennungen, Kameradaten, Aufloesung, Schaerfe, Reflexion, Fehlerniveau-Analyse (nur JPG)

## Was nicht geprueft wird
Gesicht/Selfie, Hologramme, NFC-Chip, amtliche Register, Layout je Land. Dafuer braucht es Partner und Server. Das Ergebnis ist ein Risikohinweis mit Gruenden, nie ein Echtheitsurteil.

## Regeln
- Bericht nur fuer die pruefende Firma, nie fuer die geprueft Person.
- Nicht oeffentlich hosten (sonst wird es ein Pruefstand fuer Faelscher).
- Ausweisbilder und Gesichter sind besonders geschuetzte Daten (DSGVO Art. 9): fuer den echten Betrieb Auftragsverarbeitung, EU-Server und Loeschfristen klaeren.
- Laenderspezifische Besonderheiten (ungueltig erklaerte Passmodelle) nur aus amtlichen Quellen wie PRADO eintragen, nicht raten.

## Dokumentarten
Reisepass, ID-Karte, Aufenthaltstitel, Visum (Typ A und B) mit MRZ-Pruefziffern; Fuehrerschein ohne MRZ (nur Datumslogik und Bildhinweise).

## Bewusst nicht enthalten
Keine nachgebauten Ausweise oder Muster-Dokumente (Fuer Vergleich: amtliche Muster bei PRADO). Keine Behauptung, Echtheit oder 100 % Sicherheit zu liefern.

## Als App installieren
Auf der Live-Seite im Browser: Knopf "App installieren" oben rechts oder Browser-Menue > App installieren (Desktop) bzw. Zum Startbildschirm hinzufuegen (Handy; iPhone: Teilen > Zum Home-Bildschirm). Danach auch offline nutzbar. Flaggen: flag-icons 7.6.0 (MIT) in flags/.

## Kommandozentrum, Verlauf, Werkbank
`index.html`: Laender links, Arbeitsflaeche rechts (Land, Verlauf, Werkzeuge). Verlauf lokal gespeichert (ohne Bilder, Namen, Ausweisnummern), CSV-Export. `vergleich.html`: Kundenbild neben amtlichem Muster (selbst hochgeladen, z. B. aus PRADO), gemeinsamer Zoom, Ueberblenden, Differenz, Kompressionskarte, Ausschnitte fuer Schriftvergleich. Das Programm erzeugt selbst keine Hologramme oder Ausweismuster.

## Oberflaeche (Umbau 24.11.2026)
- Gemeinsame Huelle fuer alle Seiten (`js/shell.js`): Kopfzeile mit Logo, Suche (Strg K oder /, Pfeiltasten, Enter; findet Laender nach Name, ISO- und MRZ-Code sowie die Bereiche), Seitenleiste links (ein- und ausklappbar auf Symbole), am Handy Tableiste unten.
- Laender-Panel rechts auf der Startseite: ein- und ausklappbar, auf volle Breite vergroesserbar, am Handy ein Vollbild-Blatt.
- Profil ohne Login (`js/theme.js`, Schluessel `pw_profiles`): mehrere Profile je Geraet, Name (fuellt Pruefer/in vor, wie bisher ueber `pw_who`), Rolle, Farbe, Erscheinungsbild Automatisch/Hell/Dunkel, Kontrast Automatisch/Standard/Erhoeht, Schriftgroesse, Bewegung, Seitenleiste.
- Design-Schicht nur in `style.css` (Tokens fuer hell, dunkel und erhoehten Kontrast). Logo: `icons/zeichen.svg` (Ausweiskarte mit MRZ-Zeile, das gruene Feld ist die Pruefziffer), einfarbig `icons/zeichen-einfarbig.svg`.
- Pruef-Logik unberuehrt: `app.js`, `mrz.js`, `forensics.js`, `ocr.js`, `vergleich.js`, `hist.js`, `countries.js` sind nicht geaendert, alle Element-IDs gleich.
- Rueckweg: `_sicherung_vor-redesign_2026-11-24\` enthaelt die alten HTML-Seiten, `style.css`, `start.js`, `theme.js`, `pwa.js`, Icons, Manifest und `sw.js`. Zurueckkopieren, `js/shell.js` loeschen.
