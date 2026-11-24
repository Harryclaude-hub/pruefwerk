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
