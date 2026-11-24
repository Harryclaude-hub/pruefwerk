/* Laenderliste: MRZ-Code (ICAO 9303, Deutschland = "D<<"), Name, Region.
   noIdMrz: Laender, in denen es ueblicherweise keine nationale ID-Karte mit MRZ gibt (Hinweis, kein Urteil). */
window.COUNTRIES = [
  { c: "AUT", n: "Oesterreich", r: "EU" }, { c: "BEL", n: "Belgien", r: "EU" },
  { c: "BGR", n: "Bulgarien", r: "EU" }, { c: "HRV", n: "Kroatien", r: "EU" },
  { c: "CYP", n: "Zypern", r: "EU" }, { c: "CZE", n: "Tschechien", r: "EU" },
  { c: "DNK", n: "Daenemark", r: "EU", noIdMrz: true }, { c: "EST", n: "Estland", r: "EU" },
  { c: "FIN", n: "Finnland", r: "EU" }, { c: "FRA", n: "Frankreich", r: "EU" },
  { c: "D<<", n: "Deutschland", r: "EU" }, { c: "GRC", n: "Griechenland", r: "EU" },
  { c: "HUN", n: "Ungarn", r: "EU" }, { c: "IRL", n: "Irland", r: "EU", noIdMrz: true },
  { c: "ITA", n: "Italien", r: "EU" }, { c: "LVA", n: "Lettland", r: "EU" },
  { c: "LTU", n: "Litauen", r: "EU" }, { c: "LUX", n: "Luxemburg", r: "EU" },
  { c: "MLT", n: "Malta", r: "EU" }, { c: "NLD", n: "Niederlande", r: "EU" },
  { c: "POL", n: "Polen", r: "EU" }, { c: "PRT", n: "Portugal", r: "EU" },
  { c: "ROU", n: "Rumaenien", r: "EU" }, { c: "SVK", n: "Slowakei", r: "EU" },
  { c: "SVN", n: "Slowenien", r: "EU" }, { c: "ESP", n: "Spanien", r: "EU" },
  { c: "SWE", n: "Schweden", r: "EU" },
  { c: "IND", n: "Indien", r: "Asien", noIdMrz: true }, { c: "BGD", n: "Bangladesch", r: "Asien", noIdMrz: true },
  { c: "PAK", n: "Pakistan", r: "Asien", noIdMrz: true },
  { c: "USA", n: "USA", r: "Nordamerika" }, { c: "CAN", n: "Kanada", r: "Nordamerika", noIdMrz: true },
  { c: "MEX", n: "Mexiko", r: "Nordamerika", noIdMrz: true }
];
/* Hoechste uebliche Gueltigkeit eines Reisepasses fuer Erwachsene in Jahren (Obergrenze fuer die Plausibilitaet). */
window.MAX_PASSPORT_YEARS = 10;
