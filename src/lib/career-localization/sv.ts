import type { CareerLocalizationEntry } from "./types";

/**
 * Sweden per-career overrides (Approach A). Real, CITED data only — any figure
 * that cannot be verified is OMITTED (suppressed), never invented. Careers with
 * no entry render with `isLocalized: false` (salary + Norwegian education path
 * suppressed). See docs/superpowers/specs/2026-06-16-nordic-salary-data.md
 *
 * salary: APPROXIMATE gross MONTHLY ranges (kr/mån) from Swedish salary sources
 *   (SCB register data via allaloner.se, union surveys, lönestatistik portals).
 *   Ranges vary by region, sector and experience. PENDING OWNER REVIEW.
 * educationPath: the typical Swedish route (gymnasium → högskola/universitet/YH),
 *   from official programme / study-guide pages.
 *
 * Held back (no salary shown until verified): `doctor` (the salary source could
 * not be confirmed — education path kept; card shows no salary).
 */
export const SV_CAREER_LOCALIZATION: Record<string, CareerLocalizationEntry> = {
  "software-developer": {
    description:
      "Du designar, skriver och underhåller programvara – från appar och webbtjänster till system som driver företag och samhälle.",
    salary: {
      value: "38 800–72 500 kr/mån (median ca 52 500 kr/mån)",
      source: "https://allaloner.se/yrken/systemutvecklare-och-programmerare",
    },
    educationPath: {
      value:
        "Gymnasiet (naturvetenskap eller teknik) följt av civilingenjör i datateknik (300 hp, 5 år) eller högskoleingenjör (180 hp, 3 år), t.ex. vid KTH, Chalmers eller LTH.",
      source:
        "https://www.kth.se/utbildning/civilingenjor/datateknik/behorighet-och-antagning-1.924447",
    },
  },
  "registered-nurse": {
    description:
      "Du vårdar och stödjer patienter genom sjukdom och tillfrisknande och samarbetar med läkare för säker, personcentrerad vård.",
    salary: {
      value: "27 500–47 400 kr/mån (genomsnitt ca 42 900 kr/mån)",
      source: "https://lonestatistik.se/sjukskoterska-lon/",
    },
    educationPath: {
      value:
        "Gymnasium (naturvetenskap eller vård- och omsorg) följt av sjuksköterskeprogrammet (180 hp, 3 år) med examen som legitimerad sjuksköterska.",
      source:
        "https://www.shh.se/sv/utbildningar/grundniva/sjukskoterskeprogrammet/sjukskoterskeprogrammet-behorighet-och-urval/",
    },
  },
  electrician: {
    description:
      "Du installerar, underhåller och felsöker elektriska system i allt från bostäder och kontor till industri och infrastruktur.",
    salary: {
      value: "27 700–47 300 kr/mån (median ca 37 900 kr/mån)",
      source: "https://allaloner.se/yrken/elektriker",
    },
    educationPath: {
      value:
        "Treårigt El- och energiprogram på gymnasiet (inriktning Elteknik) med APL; därefter kan man vidareutbilda sig via YH inom automation eller elteknik.",
      source:
        "https://utbildningsguiden.skolverket.se/gymnasieskolan/gymnasieskolans-program/el--och-energiprogrammet",
    },
  },
  plumber: {
    description:
      "Du installerar och underhåller rör-, värme- och ventilationssystem samt vatten och avlopp i byggnader.",
    salary: {
      value: "31 900–54 000 kr/mån (SCB-genomsnitt ca 41 400 kr/mån 2024)",
      source:
        "https://www.byggnadsarbetaren.se/blogginlagg/41-400-enligt-scb-men-i-vast-nar-ackordet-over-54-000/",
    },
    educationPath: {
      value:
        "Treårigt VVS- och fastighetsprogram på gymnasiet (inriktning VVS) med APL; YH-utbildning inom VVS-teknik finns för specialisering.",
      source:
        "https://utbildningsguiden.skolverket.se/gymnasieskolan/gymnasieskolans-program/vvs--och-fastighetsprogrammet",
    },
  },
  carpenter: {
    description:
      "Du bygger, renoverar och bygger om hus och lokaler – från stomme och tak till inredning och fönster.",
    salary: {
      value: "31 800–42 200 kr/mån (median ca 37 900 kr/mån)",
      source: "https://allaloner.se/yrken/hantverkare",
    },
    educationPath: {
      value:
        "Treårigt Bygg- och anläggningsprogram (inriktning Husbyggnad); efter gymnasiet en lärlingsfas (ca 36 månader) för yrkesbevis från BYN.",
      source:
        "https://utbildningsguiden.skolverket.se/gymnasieskolan/gymnasieskolans-program/bygg--och-anlaggningsprogrammet",
    },
  },
  doctor: {
    description:
      "Du utreder, diagnostiserar och behandlar sjukdomar och skador och bär det medicinska ansvaret för patienters hälsa.",
    // salary held back — source could not be confirmed; card shows no salary.
    educationPath: {
      value:
        "Gymnasium (naturvetenskap) följt av läkarprogrammet (360 hp, 6 år), därefter AT/BT-tjänstgöring för legitimation och valfri ST-utbildning till specialist.",
      source: "https://utbildning.ki.se/program/2la21-lakarprogrammet",
    },
  },
  solicitor: {
    description:
      "Som jurist eller advokat företräder du klienter, tolkar lagar och hjälper människor och organisationer att navigera rättssystemet.",
    salary: {
      value: "35 000–67 000 kr/mån",
      source:
        "https://xn--lnexperten-ecb.se/ekonomi/yrken-loner/advokat-lon/advokat-lon-i-sverige-2024-2025/",
    },
    educationPath: {
      value:
        "Juristprogrammet (4,5 år, 270 hp) vid t.ex. Lund, Stockholm eller Göteborg; advokattiteln kräver ytterligare praktik och advokatexamen.",
      source: "https://www.lu.se/studera/juristprogrammet-JAJUS",
    },
  },
  accountant: {
    description:
      "Du sköter företags löpande bokföring, bokslut och deklarationer – en nyckelroll för att hålla ekonomin i ordning.",
    salary: {
      value: "32 600–58 200 kr/mån (median ca 42 400 kr/mån)",
      source: "https://allaloner.se/yrken/redovisningsekonom",
    },
    educationPath: {
      value:
        "Ekonomiprogrammet på gymnasiet följt av en 2-årig YH-utbildning till redovisningsekonom, eller en högskoleutbildning i ekonomi.",
      source: "https://www.gymnasium.se/yrkesguiden/redovisningsekonom-22053",
    },
  },
  psychologist: {
    description:
      "Du utreder, bedömer och behandlar psykisk ohälsa och stödjer människor att förstå och hantera tankar, känslor och beteenden.",
    salary: {
      value: "36 200–48 900 kr/mån (genomsnitt ca 42 800 kr/mån)",
      source: "https://lonstatistik.se/psykolog-lon/",
    },
    educationPath: {
      value:
        "Femåriga psykologprogrammet vid universitet, följt av ett års handledd praktik (PTP) för psykologlegitimation.",
      source: "https://hpguiden.se/allt-om-hogskoleprovet/bli-psykolog",
    },
  },
  "police-officer": {
    description:
      "Du skyddar allmänheten, förebygger brott och upprätthåller lag och ordning i samhället.",
    salary: {
      value: "31 000–55 000 kr/mån (genomsnitt ca 42 400 kr/mån)",
      source: "https://8till5.se/artiklar/polis-lon/",
    },
    educationPath: {
      value:
        "Högskoleförberedande gymnasium, därefter polisutbildningen (2,5 år) vid t.ex. Södertörn, Umeå eller Växjö, avslutad med aspirantpraktik.",
      source: "https://www.gymnasium.se/yrkesguiden/polis-11183",
    },
  },
  chef: {
    description:
      "Du skapar måltidsupplevelser på restauranger, hotell och storkök och omvandlar råvaror till mat som berör.",
    salary: {
      value: "27 300–36 300 kr/mån (median ca 31 000 kr/mån)",
      source: "https://allaloner.se/yrken/kock",
    },
    educationPath: {
      value:
        "Restaurang- och livsmedelsprogrammet (inriktning Kök och servering) med APL; vidareutbildning via YH eller folkhögskola.",
      source:
        "https://www.gymnasium.se/om-gymnasiet/restaurang-och-livsmedelsprogrammet-rl-20723",
    },
  },
  hairdresser: {
    description:
      "Du klipper, färgar och stylar hår och skapar både stil och självförtroende hos dina kunder i salongen.",
    salary: {
      value: "27 200–31 000 kr/mån",
      source: "https://raknalon.se/lon/frisor",
    },
    educationPath: {
      value:
        "Hantverksprogrammet med inriktning frisör (3 år), följt av ca 3 000 timmars betald praktik på salong och gesällprov.",
      source: "https://www.gymnasium.se/yrkesguiden/frisor-11082",
    },
  },
  "data-analyst": {
    description:
      "Du samlar in, bearbetar och tolkar data för att hjälpa organisationer fatta välgrundade beslut.",
    salary: {
      value: "41 800–77 700 kr/mån",
      source: "https://allaloner.se/yrken/dataanalytiker",
    },
    educationPath: {
      value:
        "Vanligast en kandidatexamen (180 hp) i statistik, datavetenskap eller matematik, alternativt en tvåårig YH-utbildning som dataanalytiker.",
      source: "https://allastudier.se/utbildningar/dataanalys",
    },
  },
  "civil-engineer": {
    description:
      "Du löser komplexa tekniska problem inom allt från bygg och infrastruktur till energi och IT.",
    salary: {
      value: "50 300–73 300 kr/mån",
      source: "https://www.sverigesingenjorer.se/lon/civilingenjor-lon/",
    },
    educationPath: {
      value:
        "Civilingenjörsexamen (300 hp, 5 år) vid t.ex. KTH, Chalmers eller LTH, med inriktningar som bygg, maskinteknik eller datateknik.",
      source:
        "https://www.kth.se/utbildning/civilingenjor/oppen-ingang/oppen-ingang-civilingenjor-300-hp-1.4276",
    },
  },
  "graphic-designer": {
    description:
      "Du skapar visuell kommunikation – logotyper, trycksaker, digitala gränssnitt och varumärkesidentiteter.",
    salary: {
      value: "36 900–49 800 kr/mån",
      source: "https://allaloner.se/yrken/grafisk-formgivare",
    },
    educationPath: {
      value:
        "Kandidatexamen i grafisk design (180 hp) eller en tvåårig YH-utbildning inom grafisk produktion och form.",
      source: "https://www.yhutbildningar.se/utbildning/yh-utbildning-grafisk-design",
    },
  },
  "marketing-manager": {
    description:
      "Du leder företagets marknadsföringsstrategi, driver varumärkesarbete och ansvarar för kampanjer och marknadsanalys.",
    salary: {
      value: "43 600–114 900 kr/mån",
      source: "https://jobbland.se/lon/marknadschef",
    },
    educationPath: {
      value:
        "Kandidatexamen (180 hp) i marknadsföring eller företagsekonomi, gärna kompletterad med master och flera års erfarenhet från marknadsroller.",
      source: "https://www.studentum.se/yrkesguiden/marknadschef-24642",
    },
  },
  dentist: {
    description:
      "Du undersöker, diagnostiserar och behandlar tänder och munhälsa för patienter i alla åldrar.",
    salary: {
      value: "44 000–76 600 kr/mån",
      source: "https://allaloner.se/yrken/tandlakare",
    },
    educationPath: {
      value:
        "Tandläkarprogrammet (300 hp, 5 år) vid Karolinska Institutet, Göteborg, Malmö eller Umeå.",
      source: "https://utbildning.ki.se/program/2tl19-tandlakarprogrammet",
    },
  },
  pharmacist: {
    description:
      "Du säkerställer korrekt läkemedelsanvändning, ger rådgivning och arbetar med läkemedelsutveckling eller apoteksverksamhet.",
    salary: {
      value: "42 100–88 800 kr/mån",
      source: "https://allaloner.se/yrken/apotekare",
    },
    educationPath: {
      value:
        "Apotekarprogrammet (300 hp, 5 år) vid Göteborg, Uppsala eller Umeå, med krav på kemi 2, biologi 2 och matematik 4.",
      source: "https://www.gu.se/studera/hitta-utbildning/apotekarprogrammet-f2app",
    },
  },
  "social-worker": {
    description:
      "Du stödjer individer och familjer i utsatta situationer och arbetar med rådgivning, myndighetsutövning och socialt arbete.",
    salary: {
      value: "37 000–43 100 kr/mån",
      source: "https://allaloner.se/yrken/socialsekreterare",
    },
    educationPath: {
      value:
        "Socionomprogrammet (210 hp, 3,5 år) vid svenska lärosäten som Umeå, Stockholm eller Göteborg.",
      source: "https://www.saco.se/studier/studieval/yrken-a-o/socionom/",
    },
  },
  journalist: {
    description:
      "Du undersöker, skriver och rapporterar nyheter och samhällsfrågor för press, radio, tv och digitala medier.",
    salary: {
      value: "33 300–58 300 kr/mån",
      source: "https://jobbland.se/lon/journalist",
    },
    educationPath: {
      value:
        "Journalistprogrammet (180 hp, 3 år) vid t.ex. Stockholm eller Göteborg, med en termins praktik på ett mediehus.",
      source: "https://www.su.se/sok-kurser-och-program/hjook-1.411871",
    },
  },
  architect: {
    description:
      "Du gestaltar och projekterar byggnader och stadsrum – från skiss och bygglov till färdigt hus.",
    salary: {
      value: "38 900–62 400 kr/mån",
      source: "https://allaloner.se/yrken/arkitekt",
    },
    educationPath: {
      value:
        "Arkitektutbildningen (300 hp, 5 år) vid KTH, LTH, Chalmers eller Umeå, med antagning via betyg och/eller arkitektprov.",
      source: "https://www.saco.se/studier/studieval/yrken-a-o/arkitekt-byggnadsarkitekt/",
    },
  },
  "preschool-teacher": {
    description:
      "Du planerar och leder pedagogisk verksamhet för barn 1–5 år och skapar en trygg och stimulerande miljö.",
    salary: {
      value: "34 100–39 200 kr/mån",
      source: "https://allaloner.se/yrken/forskollarare",
    },
    educationPath: {
      value:
        "Förskollärarprogrammet (210 hp, 3,5 år) vid lärarutbildande högskolor, med 20 veckors verksamhetsförlagd utbildning (VFU).",
      source: "https://www.umu.se/utbildning/program/forskollararprogrammet/",
    },
  },

  // ── Batch 2 ──────────────────────────────────────────────────────────
  physiotherapist: {
    description:
      "Som fysioterapeut hjälper du människor att återfå och bevara rörelseförmåga – ett meningsfullt yrke inom vård och hälsa.",
    salary: { value: "35 000–42 200 kr/mån", source: "https://allaloner.se/yrken/fysioterapeut" },
    educationPath: {
      value:
        "Gymnasium (naturkunskap) följt av fysioterapeutprogrammet (180 hp, 3 år) och legitimation hos Socialstyrelsen.",
      source: "https://www.saco.se/studier/studieval/yrken-a-o/fysioterapeut/",
    },
  },
  veterinarian: {
    description:
      "Du värnar djurs hälsa och välmående – från husdjur till lantbruksdjur – och arbetar även med livsmedelssäkerhet och smittskydd.",
    salary: { value: "ca 51 500 kr/mån (genomsnitt 2025)", source: "https://lonstatistik.se/veterinar-lon/" },
    educationPath: {
      value:
        "Gymnasium (naturvetenskap) följt av veterinärprogrammet (330 hp, 5,5 år) vid SLU i Uppsala och legitimation hos Jordbruksverket.",
      source: "https://www.slu.se/utbildning/studera/program-pa-grundniva/veterinar/",
    },
  },
  "mechanical-engineer": {
    description:
      "Du konstruerar och förbättrar tekniska system och produkter – en bred roll med möjligheter inom allt från fordon till energi.",
    salary: {
      value: "36 000–54 900 kr/mån",
      source: "https://www.unionen.se/rad-och-stod/om-lon/marknadsloner/ingenjor-tekniker-maskinteknik",
    },
    educationPath: {
      value:
        "Gymnasiets teknik- eller naturvetenskapsprogram följt av högskoleingenjör (180 hp) eller civilingenjör (300 hp) i maskinteknik.",
      source: "https://www.gymnasium.se/yrkesguiden/maskiningenjor-11176",
    },
  },
  "electrical-engineer": {
    description:
      "Du gestaltar framtidens energisystem, elnät och inbyggda system – ett yrke i stark tillväxt drivet av elektrifiering.",
    salary: { value: "40 700–54 500 kr/mån", source: "https://allaloner.se/yrken/elingenjor" },
    educationPath: {
      value:
        "Gymnasiets teknikprogram följt av högskoleingenjör (180 hp) eller civilingenjör i elektroteknik vid t.ex. KTH eller Chalmers.",
      source:
        "https://www.kth.se/utbildning/hogskoleingenjor/elektroteknik/elektroteknik-hogskoleingenjor-180-hp-1.53990",
    },
  },
  "web-developer": {
    description:
      "Du bygger de digitala upplevelser som miljontals människor använder varje dag – ett kreativt och tekniskt yrke med stor frihet.",
    salary: {
      value: "36 000–60 800 kr/mån",
      source: "https://www.unionen.se/rad-och-stod/om-lon/marknadsloner/systemutvecklare",
    },
    educationPath: {
      value:
        "Gymnasieexamen följt av en 2-årig YH-utbildning inom webbutveckling eller en högskoleutbildning i systemutveckling.",
      source: "https://allastudier.se/utbildningar/webbutvecklare-utbildning",
    },
  },
  "cybersecurity-analyst": {
    description:
      "Du skyddar organisationer mot cyberhot och intrång – ett av marknadens hetaste yrken med stark och växande efterfrågan.",
    salary: { value: "44 400–62 000 kr/mån", source: "https://allaloner.se/yrken/it-sakerhetsanalytiker" },
    educationPath: {
      value:
        "Gymnasieexamen följt av en 2-årig YH-utbildning som IT-säkerhetsspecialist eller akademisk utbildning i informationssäkerhet.",
      source: "https://kyh.se/utbildningar/it-sakerhetsanalytiker-soc/",
    },
  },
  "cloud-engineer": {
    description:
      "Du bygger och förvaltar skalbar molninfrastruktur – en roll i hjärtat av företagens digitala transformation.",
    salary: { value: "35 000–65 000 kr/mån", source: "https://www.randstad.se/arbetssokande/yrkesroller/cloud-utvecklare/" },
    educationPath: {
      value:
        "Gymnasieexamen följt av en 2-årig YH-utbildning som molnutvecklare eller högskoleexamen i datateknik, ofta kompletterad med molncertifieringar (AWS/Azure).",
      source: "https://www.lernia.se/utbildning/yrkeshogskoleutbildning/cloud-ict-engineer/",
    },
  },
  "ux-designer": {
    description:
      "Du skapar digitala upplevelser som känns självklara och enkla att använda – där empati och kreativitet möter teknik.",
    salary: { value: "38 900–67 000 kr/mån", source: "https://www.unionen.se/rad-och-stod/om-lon/marknadsloner/ux-designer" },
    educationPath: {
      value:
        "Gymnasieexamen följt av en 2-årig YH-utbildning inom UX-design eller högskoleutbildning i människa–datorinteraktion eller kognitionsvetenskap.",
      source: "https://kyh.se/utbildningar/ux-designer/",
    },
  },
  "product-manager": {
    description:
      "Du leder utvecklingen av digitala produkter från idé till lansering och balanserar användarbehov, affärsmål och teknik.",
    salary: { value: "44 950–84 400 kr/mån", source: "https://www.unionen.se/rad-och-stod/om-lon/marknadsloner/produktchef" },
    educationPath: {
      value:
        "Gymnasieexamen följt av högskoleutbildning i t.ex. industriell ekonomi, systemvetenskap eller företagsekonomi (3–5 år).",
      source: "https://ledningsjobb.se/sv/guide/produktchef-utbildningsvagar-och-specialiseringar",
    },
  },
  "project-manager": {
    description:
      "Du driver komplexa uppdrag från start till mål och samordnar team, resurser och intressenter för att leverera i tid.",
    salary: { value: "40 000–70 000 kr/mån", source: "https://lonstatistik.se/projektledare-lon/" },
    educationPath: {
      value:
        "Gymnasieexamen följt av högskoleutbildning (3–5 år) eller en 2-årig YH-utbildning inom projektledning; certifieringar som PMP eller PRINCE2 stärker karriären.",
      source: "https://www.yhutbildningar.se/utbildning/yh-utbildning-projektledning",
    },
  },
  "sales-representative": {
    description:
      "Du bygger relationer och hjälper kunder att hitta rätt lösningar – ett yrke med stor frihet och tydliga resultat.",
    salary: { value: "39 000–58 900 kr/mån", source: "https://www.astaagency.se/verktyg/lonekoll/saljare" },
    educationPath: {
      value:
        "Gymnasieexamen är grunden; många vidareutbildar sig via en 2-årig YH-utbildning inom försäljning och account management.",
      source: "https://www.yrkeshogskolan.se/hitta-utbildning/sok/utbildning/?id=10255",
    },
  },
  "real-estate-agent": {
    description:
      "Du hjälper människor att köpa och sälja hem – ett ansvarsfyllt yrke som kräver juridisk kunskap och social skicklighet.",
    salary: { value: "42 000–48 000 kr/mån", source: "https://raknalon.se/lon/fastighetsmaklare" },
    educationPath: {
      value:
        "Högskoleutbildning (minst 120 hp) inom fastighetsförmedling, juridik och ekonomi, följt av tio veckors praktik och registrering hos Fastighetsmäklarinspektionen.",
      source: "https://www.maklarsamfundet.se/utbildning/hur-blir-jag-fastighetsmaklare",
    },
  },
  "bus-driver": {
    description:
      "Du transporterar passagerare säkert varje dag och är en viktig del av samhällets kollektivtrafik.",
    salary: { value: "29 800–35 600 kr/mån", source: "https://jobbland.se/lon/bussforare" },
    educationPath: {
      value:
        "Efter gymnasiet en yrkesförarutbildning via komvux/yrkesvux som ger körkortsbehörighet D och yrkeskompetensbevis (YKB); minst 21 år.",
      source:
        "https://www.transportstyrelsen.se/sv/vagtrafik/Yrkestrafik/Gods-och-buss/Yrkesforarkompetens/Speciella-regler-for-den-som-genomgar-yrkesforarutbildning/",
    },
  },
  "truck-driver": {
    description:
      "Du håller Sveriges logistikflöden igång och kör gods till alla delar av landet.",
    salary: { value: "30 000–37 000 kr/mån", source: "https://jobbland.se/lon/lastbilschauffor" },
    educationPath: {
      value:
        "Via gymnasiets fordons- och transportprogram eller yrkesvux tar du C/CE-körkort och yrkeskompetensbevis (YKB), som krävs för yrkestrafik.",
      source: "https://www.akeri.se/kunskapsbank/lastbilschauffor-ett-framtidsyrke/sa-blir-du-lastbilschauffor",
    },
  },
  "flight-attendant": {
    description:
      "Du skapar en trygg och trevlig reseupplevelse och ansvarar för passagerarnas säkerhet ombord.",
    salary: { value: "23 300–42 500 kr/mån", source: "https://jobbland.se/lon/kabinpersonal" },
    educationPath: {
      value:
        "Gymnasieexamen krävs; ingen specifik högskoleutbildning – flygbolaget utbildar antagen personal i säkerhet och service (Cabin Crew Attestation enligt EASA).",
      source: "https://se.indeed.com/karriarrad/karriarutveckling/hur-blir-flygvardinna",
    },
  },
  firefighter: {
    description:
      "Du räddar liv och egendom vid olyckor och bränder och är en av samhällets viktigaste yrkesgrupper.",
    salary: { value: "32 500–44 000 kr/mån", source: "https://jobbland.se/lon/brandman" },
    educationPath: {
      value:
        "Efter gymnasiet söker du den tvååriga utbildningen Skydd mot olyckor (SMO) vid MSB; B-körkort och simkunnighet krävs.",
      source: "https://www.skolinitiativet.se/yrken/brandman-utbildning-krav/",
    },
  },
  paramedic: {
    description:
      "Du ger akut vård utanför sjukhuset och är ofta den första vårdpersonal som möter en patient i kris.",
    salary: { value: "32 100–43 700 kr/mån (median ca 36 900)", source: "https://allaloner.se/yrken/ambulanssjukvardare" },
    educationPath: {
      value:
        "Först undersköterskeutbildning (gymnasium/vuxenutbildning), sedan en ettårig YH-utbildning till ambulanssjukvårdare med krav på erfarenhet inom akut-/slutenvård.",
      source: "https://www.lerniautbildning.se/utbildning/yrkeshogskoleutbildning/ambulanssjukvardare/",
    },
  },
  midwife: {
    description:
      "Du stöttar kvinnor och familjer genom graviditet, förlossning och eftervård med medicinsk kunskap och empati.",
    salary: { value: "40 500–58 900 kr/mån", source: "https://jobbland.se/lon/barnmorska" },
    educationPath: {
      value:
        "Sjuksköterskeexamen (180 hp) och legitimation, följt av barnmorskeprogrammet på avancerad nivå (90 hp) och barnmorskelegitimation hos Socialstyrelsen.",
      source: "https://se.indeed.com/karriarrad/karriarutveckling/barnmorska-behorighet",
    },
  },
  "dental-hygienist": {
    description:
      "Du arbetar förebyggande med munhälsa och möter patienter i alla åldrar för att förhindra tandsjukdomar.",
    salary: { value: "40 200–40 900 kr/mån", source: "https://allaloner.se/yrken/tandhygienist" },
    educationPath: {
      value:
        "Treårig högskoleutbildning (180 hp) till tandhygienistexamen, följt av legitimation hos Socialstyrelsen.",
      source: "https://www.studentum.se/yrkesguiden/tandhygienist-23232",
    },
  },
  "occupational-therapist": {
    description:
      "Du hjälper människor att klara vardagen trots sjukdom eller funktionsnedsättning och skapar förutsättningar för ett aktivt liv.",
    salary: { value: "33 000–42 800 kr/mån", source: "https://jobbland.se/lon/arbetsterapeut" },
    educationPath: {
      value:
        "Treårig högskoleutbildning (180 hp) till arbetsterapeutexamen, följt av legitimation hos Socialstyrelsen.",
      source: "https://www.studentum.se/yrkesguiden/arbetsterapeut-23247",
    },
  },
  radiographer: {
    description:
      "Du utför bilddiagnostiska undersökningar och ger läkare det underlag de behöver för att ställa rätt diagnos.",
    salary: { value: "33 500–51 900 kr/mån", source: "https://allaloner.se/yrken/rontgensjukskoterska" },
    educationPath: {
      value:
        "Röntgensjuksköterskeprogrammet (180 hp, 3 år) vid t.ex. KI, LU eller GU, följt av legitimation hos Socialstyrelsen.",
      source: "https://utbildning.ki.se/program/1rs13-rontgensjukskoterskeprogrammet",
    },
  },
  dietitian: {
    description:
      "Du förebygger och behandlar sjukdomar genom kostbehandling och nutritionsrådgivning, ofta inom vården.",
    salary: { value: "31 100–43 300 kr/mån", source: "https://allaloner.se/yrken/dietist" },
    educationPath: {
      value:
        "Dietistprogrammet (180–240 hp) vid t.ex. GU, Umeå eller Uppsala, följt av dietistexamen och legitimation hos Socialstyrelsen.",
      source: "https://www.gu.se/studera/hitta-utbildning/dietistprogrammet-m1dip",
    },
  },
  optician: {
    description:
      "Du undersöker syn och anpassar glasögon och kontaktlinser – ett legitimationsyrke där vetenskap möter omsorg om ögonhälsan.",
    salary: { value: "39 100–56 300 kr/mån", source: "https://jobbland.se/lon/optiker" },
    educationPath: {
      value:
        "Gymnasium (naturvetenskap) följt av treårig optikerexamen (KI eller Linnéuniversitetet) och legitimation hos Socialstyrelsen.",
      source: "https://www.studentum.se/yrkesguiden/sa-blir-du-optiker-23480",
    },
  },
  "personal-trainer": {
    description:
      "Du skapar individanpassade träningsprogram och coachar klienter mot sina hälso- och fitnessmål, ofta i gym eller utomhus.",
    salary: { value: "28 700–41 500 kr/mån", source: "https://jobbland.se/lon/personlig-tranare" },
    educationPath: {
      value:
        "Gymnasieexamen följt av PT-utbildning (yrkeshögskola, folkhögskola eller certifieringsprogram, t.ex. GIH Tränarprogrammet); inget legitimationskrav, men branschcertifiering rekommenderas.",
      source: "https://www.studentum.se/jobb-lon/personlig-tranare",
    },
  },
  welder: {
    description:
      "Du sammanfogar metall med precision och skicklighet – ett yrke med stark efterfrågan inom industri, offshore och tillverkning.",
    salary: { value: "29 000–43 000 kr/mån", source: "https://xn--lnestatistik-4ib.se/svetsare-lon" },
    educationPath: {
      value:
        "Gymnasiets Industritekniska program (inriktning Svetsteknik, 3 år); vidare möjligheter via YH inom avancerad svetsteknik eller svetsinspektion.",
      source: "https://syllabuswebb.skolverket.se/syllabuscw/jsp/program.htm?programCode=IN001",
    },
  },
  baker: {
    description:
      "Du skapar allt från dagligt bröd till hantverksmässiga specialiteter – ett kreativt hantverk med stark lokal efterfrågan.",
    salary: { value: "24 000–35 000 kr/mån", source: "https://raknalon.se/lon/bagare" },
    educationPath: {
      value:
        "Gymnasiets Restaurang- och livsmedelsprogram (inriktning Bageri och konditori, 3 år) ger direkt inträde på arbetsmarknaden.",
      source: "https://bageri.se/utbildning/bli-bagare/grundutbildning-gymnasieniva/",
    },
  },
  painter: {
    description:
      "Du behandlar och målar både invändiga och utvändiga ytor, från bostäder till industrilokaler, och skyddar och förskönar byggnader.",
    salary: { value: "32 300–40 000 kr/mån", source: "https://allaloner.se/yrken/malare" },
    educationPath: {
      value:
        "Gymnasiets Bygg- och anläggningsprogram (inriktning Måleri, 3 år inkl. APL), ev. följt av lärlingsprogram med yrkesbevis via gesällprov.",
      source:
        "https://utbildningsguiden.skolverket.se/gymnasieskolan/gymnasieskolans-program/bygg--och-anlaggningsprogrammet",
    },
  },
  bricklayer: {
    description:
      "Du uppför och renoverar väggar, skorstenar och konstruktioner i tegel, lättbetong och natursten – ett hantverksyrke med god efterfrågan.",
    salary: { value: "33 000–42 000 kr/mån", source: "https://jobbland.se/lon/murare" },
    educationPath: {
      value:
        "Gymnasiets Bygg- och anläggningsprogram (inriktning Husbyggnad, 3 år inkl. APL), med mureriinriktning via lärlingsprogram eller yrkeskurs.",
      source:
        "https://utbildningsguiden.skolverket.se/gymnasieskolan/gymnasieskolans-program/bygg--och-anlaggningsprogrammet",
    },
  },
  "financial-analyst": {
    description:
      "Du analyserar företags och marknaders ekonomiska data för att ge investeringsrekommendationer och stödja strategiska beslut.",
    salary: { value: "45 000–80 000 kr/mån", source: "https://www.studentum.se/jobb-lon/finansanalytiker" },
    educationPath: {
      value:
        "Gymnasieexamen (ekonomi/matematik) följt av ekonomprogrammet (180 hp) eller civilekonomprogrammet (240 hp); valfri vidareutbildning som CFA.",
      source: "https://www.studentum.se/yrkesguiden/finansanalytiker-25510",
    },
  },
  auditor: {
    description:
      "Du granskar och intygar företags årsredovisningar och räkenskaper, med lagstadgat ansvar för korrekt ekonomisk rapportering.",
    salary: { value: "65 000–80 000 kr/mån (auktoriserad)", source: "https://xn--lnestatistik-4ib.se/revisor-lon" },
    educationPath: {
      value:
        "Kandidatexamen (180 hp) med ekonomi/revisionsämnen, minst 3 års praktik på revisionsbyrå, revisorsexamen hos Revisorsinspektionen och auktorisation.",
      source: "https://www.far.se/utbildning/auktorisation/auktorisation-revisor/",
    },
  },
};
