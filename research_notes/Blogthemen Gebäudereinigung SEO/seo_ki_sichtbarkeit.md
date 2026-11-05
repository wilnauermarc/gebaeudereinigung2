# SEO und KI-Suchsichtbarkeit (GEO/AEO) für eine kleine deutsche B2B-Produktseite mit Blog (statisch, Netlify), Stand 2026

Hinweis zur Methodik: Recherche am 2026-11-04. Primärquellen (Google, OpenAI, Anthropic, Perplexity, Ahrefs, arXiv) wurden direkt abgerufen. Alles, was nur aus Sekundärquellen oder Suchsnippets stammt, ist als solches markiert. Wo nichts belegt werden konnte, steht es unter Gaps oder Inferences (als allgemeines Fachwissen, nicht belegt, gekennzeichnet).

## 1. On-Page-Grundlagen für Blogartikel (Title, Meta, Struktur, Bilder, Sitemap, robots.txt)

### Takeaway
Google nennt für KI-Funktionen keine Zusatzanforderungen: Indexierbar, snippet-fähig, crawlbar, intern verlinkt, gute Seitenerfahrung, Text als Text. Konkrete Zeichenlängen für Title/Meta gibt Google nicht vor; Titel werden bei Bedarf gekürzt oder umgeschrieben. Sitemap-lastmod zählt nur, wenn es verlässlich stimmt.

### Cited Findings
- Google: "Es gibt keine zusätzlichen Anforderungen, um in AI Overviews oder AI Mode zu erscheinen, und keine besonderen Optimierungen." Voraussetzung ist, dass die Seite indexiert und mit Snippet in der Suche zulässig ist; Indexierung ist nie garantiert. — [Google: AI features and your website](https://developers.google.com/search/docs/appearance/ai-features)
- Googles technische Empfehlungen für KI-Funktionen: Crawling in robots.txt und über CDN/Hosting erlauben, Inhalte über interne Links auffindbar machen, gute Seitenerfahrung, wichtige Inhalte als Text, Text durch hochwertige Bilder/Videos ergänzen, Business-Profil aktuell halten, Seite in Search Console verifizieren. — [Google: AI features and your website](https://developers.google.com/search/docs/appearance/ai-features)
- Vorschau-Steuerung (nosnippet, data-nosnippet, max-snippet, noindex) wirkt auch auf KI-Funktionen; Recrawl kann "mehrere Tage bis mehrere Monate" dauern. Traffic aus AI Overviews/AI Mode ist im Search-Console-Bericht "Web" enthalten (kein separater Bericht). — [Google: AI features and your website](https://developers.google.com/search/docs/appearance/ai-features)
- Google-Leitfaden "Optimizing your website for generative AI features on Google Search" (laut Berichterstattung vom 15.05.2026): "non-commodity content" mit eigenem Erkenntniswert, Indexierung/Snippet-Eignung, saubere Crawl-Praxis, semantisches HTML, JavaScript-SEO-Praxis, gute Seitenerfahrung, weniger Duplicate Content; für lokale Sichtbarkeit Google Business Profile. Als Mythen für Google genannt: llms.txt/Markdown-Spezialdateien, künstliches Chunking, Umschreiben für KI, "unechte" Erwähnungen aufbauen, spezielles Schema, getrennte AEO/GEO-Disziplin ("still SEO"). — [Search Engine Journal, Mai 2026](https://www.searchenginejournal.com/googles-new-ai-search-guide-calls-aeo-and-geo-still-seo/575026/) (Sekundärbericht; Googles Original laut SEJ unter developers.google.com/search/docs/fundamentals/ai-optimization-guide, von mir nicht direkt abgerufen)
- Title-Links: Keine feste Längenvorgabe; kurz halten; Kürzung nach Gerätebreite; Google ersetzt Titel bei leeren, veralteten (z. B. alte Jahreszahlen), ungenauen, boilerplate-lastigen Titeln oder fehlender H1; Quellen für Umschreibung sind u. a. title, H1/Überschriften, og:title, Ankertexte. — [Google: Title links](https://developers.google.com/search/docs/appearance/title-link)
- Sitemap: lastmod wird nur genutzt, wenn "konsistent und überprüfbar" korrekt; zählt bei inhaltlichen Änderungen (Haupttext, strukturierte Daten, Links), nicht bei Copyright-Jahr; priority und changefreq werden von Google ignoriert; Limit 50 MB bzw. 50.000 URLs pro Datei; "Sitemap:"-Zeile in robots.txt ist nur ein Hinweis. — [Google: Build a sitemap](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap)
- Bing/Microsoft: IndexNow hilft, geänderte Seiten schneller zu entdecken, damit KI-Systeme aktuelle Versionen nutzen; Bing Places für Unternehmensdaten. — [PPC Land über Bing Webmaster Blog](https://ppc.land/bing-gives-publishers-first-look-at-how-ai-systems-cite-their-content/) (Sekundärquelle)

### Inferences
- Mythos (aus Googles Sicht): Feste Zeichenzahlen als Rankingfaktor. Praktisch gilt nur: Title knapp und eindeutig, mit passender H1, damit Google ihn nicht umschreibt. Gängige Faustwerte (ca. 50-60 Zeichen Title, ca. 150-160 Meta) sind Pixel-Heuristiken ohne Google-Beleg; Meta-Description beeinflusst Ranking nicht, kann aber als Snippet dienen (allgemeines Fachwissen, hier nicht neu belegt).
- Für eine statische Seite folgt daraus: Pro Artikel genau eine H1 (deckungsgleich mit Title), saubere H2/H3-Hierarchie, eigenständige Antwort im ersten Absatz, Canonical auf sich selbst, Sitemap-lastmod nur bei echten inhaltlichen Änderungen aus dem Build setzen (Git-Datum), priority/changefreq weglassen. hreflang entfällt bei einsprachiger DE-Seite (nicht belegt, Fachwissen).
- "Antwort-zuerst"/TL;DR, Inhaltsverzeichnis, Themencluster: Google verlangt das nicht; Nutzen ergibt sich über Nutzerfreundlichkeit und interne Verlinkung (plausibel, nicht kausal belegt). Semrush-Korrelationen unter Frage 5 stützen Struktur/Zusammenfassungen, aber nur korrelativ.

### Gaps
- Bild-SEO (Alt-Text, Dateinamen, AVIF/WebP, width/height, Lazy-Loading) und Open Graph wurden nicht gegen Google-Dokumentation geprüft; hier nur Fachwissen. Nachrecherche: developers.google.com/search/docs/appearance/google-images.
- Google-Seite zu Meta-Descriptions/Snippets nicht abgerufen; Aussagen zu Meta-Länge nicht belegt.
- Googles Original-KI-Leitfaden (Mai 2026) nicht direkt abgerufen, nur über SEJ; Datumsangaben in Sekundärquellen widersprüchlich (15.05., 05.06., 15.06.2026).

## 2. Structured Data (schema.org-Typen, Google-Unterstützung, Wirkung auf KI)

### Takeaway
Für Blogartikel unterstützt Google weiterhin BlogPosting/Article; keine Pflichtfelder. FAQ-Rich-Results sind seit Mai 2026 komplett eingestellt, Dokumentation entfernt. Ein kontrollierter Ahrefs-Test (Mai 2026) fand keinen Citation-Zuwachs durch nachträglich ergänztes JSON-LD; Google sagt, es gibt kein spezielles Schema für KI-Funktionen.

### Cited Findings
- Google unterstützt Article, NewsArticle, BlogPosting. Keine Pflichtfelder; empfohlen: headline (knapp), image (mehrere, 16:9, 4:3, 1:1, mind. 50.000 Pixel), datePublished und dateModified (ISO 8601 mit Zeitzone), author als Person/Organization mit name (nur Name) und url oder sameAs; jeden sichtbaren Autor einzeln auflisten. — [Google: Article structured data](https://developers.google.com/search/docs/appearance/structured-data/article)
- FAQ-Rich-Result: Deprecation-Hinweis, "erscheint ab 7. Mai 2026 nicht mehr in der Google-Suche"; Dokumentation am 15. Juni 2026 entfernt. — [Google: Search Gallery / FAQ-Seite mit Änderungshistorie](https://developers.google.com/search/docs/appearance/structured-data/faqpage)
- Weitere Einstellungen/Entfernungen: Practice Problem (Doku entfernt 6.1.2026), Course info, Estimated salary, Learning video, Special announcement, Vehicle listing (Doku entfernt 9.9.2025). HowTo taucht in dem abgerufenen Teil der Seite nicht auf (siehe Gaps). — [Google: Search Gallery / Änderungshistorie](https://developers.google.com/search/docs/appearance/structured-data/faqpage)
- Google zu KI-Funktionen: "Es gibt auch kein spezielles schema.org-Markup, das Sie hinzufügen müssen"; strukturierte Daten müssen zum sichtbaren Text passen. — [Google: AI features and your website](https://developers.google.com/search/docs/appearance/ai-features)
- Ahrefs (11.05.2026): Korrelation: KI-zitierte Seiten haben fast 3-mal häufiger JSON-LD (6 Mio. URLs). Kausaltest: 1.885 Seiten, die zwischen Aug. 2025 und Mär. 2026 JSON-LD ergänzten, gegen ca. 4.000 Kontrollseiten, 30 Tage vor/nach, Difference-in-Differences. Ergebnis: AI Overviews -4,6 % (signifikant, Ursache unklar), AI Mode +2,4 % und ChatGPT +2,2 % (nicht von null unterscheidbar). Fazit: kein großer Zuwachs. Einschränkungen: nur Seiten mit bereits 100+ AI-Overview-Zitaten, Typen gepoolt, nur 30 Tage, nur statisches JSON-LD. — [Ahrefs: Schema & AI citations](https://ahrefs.com/blog/schema-ai-citations/)
- Gegenbehauptung eines Anbieters (AirOps: Seiten mit reichem Schema 13 % wahrscheinlicher zitiert) — nur Korrelation, nur via Suchsnippet gesehen, nicht verifiziert. — [AirOps Report](https://www.airops.com/report/structuring-content-for-llms)

### Inferences
- JSON-LD bleibt sinnvoll für Rich-Result-Eignung, Entitäts-Klarheit (Organization, Person, sameAs) und Konsistenz von Autor/Datum, nicht als KI-Hebel. Sinnvolle Typen für die Seite: BlogPosting (mit author Person, publisher Organization, image, datePublished, dateModified), Organization (Startseite/Impressum, sameAs), BreadcrumbList, SoftwareApplication nur wenn Seite es sichtbar abbildet (Google bietet dafür Rich Result mit Bewertungsvoraussetzungen; hier nicht verifiziert). FAQPage nicht mehr aus SEO-Gründen einbauen; FAQ-Inhalte als sichtbarer Text bleiben nützlich.
- Minimalbeispiel (angelehnt an Googles Doku-Beispiel, Felder gemäß Doku):
```json
{
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  "headline": "Reinigungsprotokolle digital führen: So gehen Betriebe vor",
  "image": ["https://example.de/img/protokoll-16x9.jpg","https://example.de/img/protokoll-4x3.jpg","https://example.de/img/protokoll-1x1.jpg"],
  "datePublished": "2026-03-10T08:00:00+01:00",
  "dateModified": "2026-10-02T09:30:00+01:00",
  "author": [{"@type":"Person","name":"Vorname Nachname","url":"https://example.de/autoren/vorname-nachname"}],
  "publisher": {"@type":"Organization","name":"Firmenname","url":"https://example.de/"},
  "mainEntityOfPage": "https://example.de/blog/reinigungsprotokolle-digital"
}
```
  (publisher und mainEntityOfPage sind schema.org-Standardfelder; in Googles Beispiel nicht enthalten.) Wichtig: dateModified nur bei echten inhaltlichen Änderungen ändern und sichtbar auf der Seite anzeigen.

### Gaps
- HowTo-Einstellung (Google reduzierte HowTo-Rich-Results 2023 und stellte sie ein): in den abgerufenen Seiten nicht bestätigt; nicht belegt. FAQ-Einschränkung 2023 (nur Behörden/Gesundheit) nicht in abgerufenem Seitenteil gefunden.
- Googles Doku zu Organization, BreadcrumbList, SoftwareApplication, Person nicht abgerufen.
- Wirkung von JSON-LD in ChatGPT/Perplexity/Claude jenseits des Ahrefs-Tests: keine Primärevidenz gefunden.

## 3. E-E-A-T und Vertrauenssignale

### Takeaway
E-E-A-T ist laut Quellenlage ein Qualitätsrahmen, kein einzelner Rankingfaktor; für KI-Zitate gibt es nur Korrelationsevidenz (Semrush). Googles aktueller KI-Leitfaden betont einzigartige, nicht austauschbare Inhalte und warnt vor künstlich erzeugten Erwähnungen.

### Cited Findings
- Semrush (Auswertung von über 300.000 KI-zitierten URLs, 2026): zitierte Seiten haben stärkere E-E-A-T-Signale (Korrelation 30,64 %), klare Zusammenfassungen (+32,83 % wahrscheinlicher), starke Abschnittsstruktur (+22,91 %), Q&A-Format (Korrelation 25,45 %). Autoren des Berichts bzw. Sekundärquellen betonen: Korrelationen, kein Kausalbeweis. — [Semrush Studie](https://semrush.com/blog/content-optimization-ai-search-study) (Zahlen aus Suchergebnis-Zusammenfassung, Studienseite selbst nicht abgerufen; Sekundär: [MarketingProfs](https://www.marketingprofs.com/chirp/2026/54504/the-content-qualities-correlated-with-ai-citations-infographic))
- Google: Fokus auf "non-commodity content", Business-Profil pflegen; manufactured mentions bringen laut Google wenig, da Ranking-Systeme Qualität bewerten und Spam blockiert wird. — [SEJ zu Googles Leitfaden, Mai 2026](https://www.searchenginejournal.com/googles-new-ai-search-guide-calls-aeo-and-geo-still-seo/575026/)
- Google-Article-Doku: Autor mit Name und eindeutiger Profil-URL/sameAs. — [Google Article](https://developers.google.com/search/docs/appearance/structured-data/article)

### Inferences
- Praktisch: Autorenseite mit Rolle/Erfahrung im Reinigungsbetrieb, Quellenangaben mit Link (BG BAU, DIN 77400, Tarifverträge o. ä. je nach Thema), sichtbares "Zuletzt aktualisiert", vollständiges Impressum, eigene Daten/Praxisbeispiele (das ist der "non-commodity"-Hebel für ein Nischenprodukt).
- Dass Autor/E-E-A-T direkt KI-Zitate verursachen, ist nicht belegt (Plausible Annahme).

### Gaps
- Impressumspflicht (§ 5 DDG, ehem. TMG) und Datenschutz: nicht recherchiert; juristische Prüfung nötig.
- Google Quality Rater Guidelines nicht abgerufen.

## 4. KI-Crawler und Zugriff (robots.txt, llms.txt)

### Takeaway
Die Anbieter trennen Training, Suchindex und nutzerausgelöste Abrufe. Für eine Seite, die gefunden werden will: OAI-SearchBot, Claude-SearchBot, PerplexityBot, Googlebot, Bingbot zulassen; Training-Bots (GPTBot, ClaudeBot, Google-Extended) sind eine separate Entscheidung ohne Einfluss auf Suchsichtbarkeit. llms.txt: keine belegte Wirkung, Google lehnt es ab.

### Cited Findings
- OpenAI: OAI-SearchBot = Suche in ChatGPT (OpenAI empfiehlt Zulassen inkl. IP-Bereiche; Opt-out führt zum Ausschluss aus ChatGPT-Suchantworten, evtl. nur noch Navigationslinks; Änderungen brauchen ca. 24 h). GPTBot = Training; Disallow signalisiert Nicht-Nutzung fürs Training, unabhängig von OAI-SearchBot. ChatGPT-User = nutzerausgelöste Abrufe, robots.txt-Regeln "may not apply", bestimmt nicht die Suchsichtbarkeit. — [OpenAI Crawler-Übersicht](https://developers.openai.com/api/docs/bots)
- Anthropic: ClaudeBot (Training), Claude-User (Abruf bei Nutzerfrage), Claude-SearchBot (Suchindex); alle respektieren robots.txt; Crawl-delay unterstützt; IP-Blocking kein verlässliches Opt-out; IP-Liste unter claude.com/crawling/bots.json. Deaktivieren von Claude-SearchBot/Claude-User "kann Sichtbarkeit verringern". — [Anthropic Support](https://support.claude.com/en/articles/8896518-does-anthropic-crawl-data-from-the-web-and-how-can-site-owners-block-the-crawler)
- Perplexity: PerplexityBot = Suchindex/Links, nicht für Foundation-Model-Training; Perplexity-User = nutzerausgelöst, ignoriert robots.txt im Allgemeinen; WAF-Freigaben per User-Agent plus IP, Cloudflare Bot Fight Mode lässt sich nicht per WAF-Regel umgehen. — [Perplexity Docs](https://docs.perplexity.ai/guides/bots)
- Google-Extended ist ein robots.txt-Token (kein eigener Crawler), steuert Gemini-Training/Grounding in Gemini Apps und Vertex AI; beeinflusst weder Suche noch AI Overviews; AI Overviews steuert man über nosnippet/max-snippet/noindex. — Google bestätigt Verweis auf Google-Extended in [AI features](https://developers.google.com/search/docs/appearance/ai-features); Details nur über Sekundärquellen ([ppc.land](https://ppc.land/google-extended/))
- llms.txt: SE Ranking (300.000 Domains, SEJ 20.11.2025): llms.txt auf 10,13 % der Domains; keine signifikante Korrelation mit Zitierhäufigkeit; "at least not yet". — [Search Engine Journal](https://www.searchenginejournal.com/llms-txt-shows-no-clear-effect-on-ai-citations-based-on-300k-domains/561542/)
- Google: Keine llms.txt oder spezielle KI-Dateien nötig (Leitfaden Mai 2026). Gary Illyes (Juli 2025): Google unterstützt llms.txt nicht; John Mueller verglich es mit Meta-Keywords — nur über Sekundärquellen belegt. — [SEJ, Mai 2026](https://www.searchenginejournal.com/googles-new-ai-search-guide-calls-aeo-and-geo-still-seo/575026/); Mueller/Illyes: [Search Engine Land](https://searchengineland.com/llm-only-pages-ai-search-467690) (nur Suchsnippet gesehen)
- Search Engine Land-Experiment (laut Suchsnippet-Zusammenfassung, nicht verifiziert): von ca. 18.000 Zitaten verwiesen nur 6 auf llms.txt-Dateien.

### Inferences
- Empfohlene robots.txt für auffindbare Seite (Fachwissen auf Basis der obigen Doku): Standardmäßig alles erlauben, Sitemap-Zeile; Training-Bots nach Geschäftsentscheid. Wer in ChatGPT/Claude/Perplexity zitiert werden will, darf OAI-SearchBot, Claude-SearchBot, PerplexityBot nicht blocken. Blocken von GPTBot/ClaudeBot nimmt laut Dokumentation nicht die Suchsichtbarkeit.
- Wichtig für Netlify: Keine Bot-Blockaden/WAF/Challenges, die diese Bots aussperren.
- llms.txt: Aufwand gering (Markdown-Datei mit H1, Kurzbeschreibung, Linklisten, Format laut llmstxt.org — Format nicht abgerufen), Nutzen unbelegt: optional, niedrige Priorität. Mythos: "llms.txt steigert KI-Zitate".

### Gaps
- Applebot-Extended: keine Quelle gefunden.
- llmstxt.org-Spezifikation und Verbreitung außerhalb SE Ranking nicht geprüft. Bing-Crawlerdoku/Copilot-Steuerung nicht geprüft.
- Behauptung "Google-Extended deaktiviert nicht AI Overviews" nur teils primär belegt.

## 5. Was KI-Systeme bevorzugt zitieren (Studien 2023-2026)

### Takeaway
Princeton-GEO-Paper (KDD 2024) zeigt Sichtbarkeitsgewinne durch Zitate, Quellenangaben, Statistiken in einer Benchmark; Keyword-Stuffing hilft kaum. Ahrefs zeigt, dass Top-10-Ranking als Prädiktor für AI-Overview-Zitate schwächer wird (38 % im März 2026). Industrie-Studien zu Formaten sind überwiegend korrelativ.

### Cited Findings
- GEO-Paper (Aggarwal et al., arXiv 2311.09735, v1 16.11.2023, v3 28.06.2024, KDD 2024): Black-Box-Framework und GEO-bench (10.000 Queries); Abstract: bis zu 40 % mehr Sichtbarkeit; Wirkung domänenabhängig. — [arXiv](https://arxiv.org/abs/2311.09735). Wirksame Methoden laut Abstract: Zitate, Zitierungen von Quellen, Statistiken (>40 %); Perplexity-Test bis 37 %; Keyword-Stuffing wenig/kein Effekt — Details aus [arXiv HTML v3](https://arxiv.org/html/2311.09735v3) nur über Suchzusammenfassung, Einzelwerte pro Taktik nicht geprüft.
- Ahrefs (02.03.2026; 863.000 Keywords, ca. 4 Mio. AIO-URLs, Brand Radar): 37,9 % der zitierten URLs ranken in den Top 10 (organisch: 37,1 %); 11-100: 26,2-31,2 %; nicht in Top 100: 31,0-36,7 %. Anteil fiel von ca. 76 % (Juli 2025, 1,9 Mio. Zitate), Methodik teils verbessert, Ursache (Query Fan-out, Gemini 3) ist Vermutung des Autors. YouTube ist meistzitierte Domain in AIO. — [Ahrefs](https://ahrefs.com/blog/ai-overview-citations-top-10)
- Ahrefs (Aug. 2025, 75.000 Marken): Markenerwähnungen im Web korrelieren mit AI-Overview-Sichtbarkeit 0,664, Backlinks 0,218 — nur aus Sekundärzusammenfassung, nicht verifiziert. — [Search Engine Journal Zusammenfassung](https://www.searchenginejournal.com/google-ai-overview/515286/) (Snippet-Ebene)
- BrightEdge: Überlappung ca. 17 % (andere Methodik) — nur über Ahrefs-Sekundärbericht, nicht geprüft.
- Semrush (2026, >300.000 zitierte URLs): siehe Frage 3 (Struktur, Zusammenfassungen, Q&A, E-E-A-T; alles Korrelation). — [Semrush](https://semrush.com/blog/content-optimization-ai-search-study)

### Inferences
- Plausibel, aber nur korrelativ belegt: kurze definitorische Antwortabsätze, Listen/Tabellen, Fragen als Überschriften, Statistiken mit Quelle (letzteres durch Princeton-Experiment gestützt, Benchmark ist jedoch Labor, nicht Live-Systeme).
- Für Nischen-B2B-Seiten bedeutet sinkende Ranking-Überlappung: Abdeckung der Fan-out-Teilfragen (Preis, Vergleich, Anleitung, Rechtliches) in Clustern und Präsenz auf Drittquellen (Verzeichnisse, YouTube, Branchenmedien) kann wichtiger sein als reines Top-10-Ranking. Das ist Interpretation.
- Seer, Profound: keine Primärdaten gefunden.

### Gaps
- Seer-, Profound-, BrightEdge-Primärstudien nicht abgerufen. Per-Taktik-Zahlen des GEO-Papers nicht verifiziert (Sekundärquellen widersprüchlich: 41 % vs. 28 %).
- Keine Studien speziell zu deutschsprachigen B2B-Nischen gefunden.

## 6. Lokale und branchenspezifische Aspekte (Deutschland)

### Takeaway
Belegt ist nur, dass Google für lokale Sichtbarkeit Business Profile empfiehlt und Bing Places analog. Verbands-Backlinks, Gastbeiträge, Cookie-Freiheit und Core Web Vitals wurden in dieser Recherche nicht quellenbasiert geprüft.

### Cited Findings
- Google: Für lokale Sichtbarkeit Google Business Profile aktuell halten. — [Google: AI features](https://developers.google.com/search/docs/appearance/ai-features); [SEJ zu Google-Leitfaden](https://www.searchenginejournal.com/googles-new-ai-search-guide-calls-aeo-and-geo-still-seo/575026/)
- Microsoft: Bing Places für Unternehmensdaten pflegen. — [PPC Land über Bing](https://ppc.land/bing-gives-publishers-first-look-at-how-ai-systems-cite-their-content/)
- Ahrefs: Markenerwähnungen und YouTube korrelieren stärker mit KI-Sichtbarkeit als Backlinks (siehe 5; Korrelation).

### Inferences
- Für ein B2B-Softwareprodukt ist Google Business Profile nur relevant, wenn ein lokaler Standort/Anlaufstelle besteht (Annahme). Verzeichnisse (Softwarevergleichsportale), Verbands-/Innungsseiten (z. B. Gebäudereiniger-Innung/BIV), Gastbeiträge: plausible Quellen für Erwähnungen und Links, nicht belegt für KI-Zitate.
- Cookie-freie Seite vermeidet Consent-Banner (Datenschutz, Core Web Vitals) — Fachwissen, nicht belegt.

### Gaps
- Impressumspflicht, TDDDG/Cookie-Recht, Core-Web-Vitals-Schwellen (LCP, INP, CLS) und deren Rankingwirkung: nicht abgerufen. Verbandsrecherche (BIV) fehlt.

## 7. Technische Checkliste für statische Seiten (Netlify)

### Takeaway
Aus Primärquellen belegt: crawlbar, Sitemap mit verlässlichem lastmod, Sitemap-Zeile in robots.txt, Bots nicht per WAF aussperren. Netlify-spezifische Details (_redirects, _headers, Caching, 404) wurden nicht recherchiert.

### Cited Findings
- Sitemap-Regeln (lastmod, 50 MB / 50.000 URLs, priority/changefreq ignoriert): — [Google: Build a sitemap](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap)
- Crawling auch über CDN/Hosting zulassen. — [Google: AI features](https://developers.google.com/search/docs/appearance/ai-features)
- Bot-Zugang: Offizielle IP-JSONs von OpenAI (searchbot.json), Anthropic (bots.json) und Perplexity; User-Agent plus IP prüfen, wenn WAF genutzt wird. — [OpenAI](https://developers.openai.com/api/docs/bots), [Anthropic](https://support.claude.com/en/articles/8896518-does-anthropic-crawl-data-from-the-web-and-how-can-site-owners-block-the-crawler), [Perplexity](https://docs.perplexity.ai/guides/bots)
- IndexNow für schnellere Entdeckung (Bing/Copilot). — [PPC Land über Bing Webmaster Blog](https://ppc.land/bing-gives-publishers-first-look-at-how-ai-systems-cite-their-content/)
- Bing Webmaster Tools "AI Performance" (Public Preview ab 10.02.2026) zeigt Zitate in Copilot und Bing-KI-Zusammenfassungen. — [PPC Land](https://ppc.land/bing-gives-publishers-first-look-at-how-ai-systems-cite-their-content/), [Bing Webmaster Blog](https://blogs.bing.com/webmaster/February-2026/Introducing-AI-Performance-in-Bing-Webmaster-Tools-Public-Preview)

### Inferences
- Vorschlag (Fachwissen, nicht belegt): Netlify Build erzeugt sitemap.xml mit lastmod aus Git; 301-Redirects in `_redirects`; kurze Cache-Dauer für HTML, lange mit Hash für Assets (`_headers`); eigene 404.html mit Links; RSS/Atom-Feed als Entdeckungshilfe; Canonical mit Trailing-Slash-Konsistenz; keine Pagination-Indexierungsprobleme durch klare Links (Google wertet rel=next/prev nicht mehr aus — nicht in dieser Recherche belegt).
- Analytics-Prüfung: KI-Referrer separat in Logs/Analytics beobachten; Search Console zeigt AIO-Traffic nicht getrennt.

### Gaps
- Keine Netlify-Dokumentation, kein Core-Web-Vitals-Quellenabruf, keine Feed- und Pagination-Belege.
