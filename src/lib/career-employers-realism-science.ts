/**
 * Career-employer REALISM overrides — earth/natural/paleontology + archaeology,
 * museums & science-communication careers (2026-06-24). Norway-first, real
 * employers for the 26 science/heritage careers added in the catalogue
 * expansion. Wired into getCareerEmployers() in career-employers.ts.
 */
import type { Employer } from "./career-employers";

export const REALISM_EMPLOYERS_SCIENCE: Record<string, Employer[]> = {
  // ── Paleontology & earth sciences ───────────────────────────────────
  "paleontologist": [
    { name: "Natural History Museum Oslo (NHM/UiO)", industry: "Museum & Research", size: "500+", careersUrl: "https://www.nhm.uio.no" },
    { name: "University of Oslo (UiO)", industry: "Higher Education", size: "1,000+", careersUrl: "https://www.uio.no" },
    { name: "University Museum of Bergen (UiB)", industry: "Museum & Research", size: "500+", careersUrl: "https://www.uib.no" },
    { name: "NTNU University Museum", industry: "Museum & Research", size: "500+", careersUrl: "https://www.ntnu.edu" },
    { name: "Norsk Polarinstitutt", industry: "Polar Research", size: "100+", careersUrl: "https://www.npolar.no" },
  ],
  "paleobiologist": [
    { name: "Natural History Museum Oslo (NHM/UiO)", industry: "Museum & Research", size: "500+", careersUrl: "https://www.nhm.uio.no" },
    { name: "University of Oslo (UiO)", industry: "Higher Education", size: "1,000+", careersUrl: "https://www.uio.no" },
    { name: "University of Bergen (UiB)", industry: "Higher Education", size: "1,000+", careersUrl: "https://www.uib.no" },
    { name: "University of Tromsø (UiT)", industry: "Higher Education", size: "1,000+", careersUrl: "https://www.uit.no" },
    { name: "Norsk Polarinstitutt", industry: "Polar Research", size: "100+", careersUrl: "https://www.npolar.no" },
  ],
  "vertebrate-paleontologist": [
    { name: "Natural History Museum Oslo (NHM/UiO)", industry: "Museum & Research", size: "500+", careersUrl: "https://www.nhm.uio.no" },
    { name: "University of Oslo (UiO)", industry: "Higher Education", size: "1,000+", careersUrl: "https://www.uio.no" },
    { name: "NTNU University Museum", industry: "Museum & Research", size: "500+", careersUrl: "https://www.ntnu.edu" },
    { name: "Natural History Museum (London)", industry: "Museum & Research", size: "1,000+" },
    { name: "American Museum of Natural History", industry: "Museum & Research", size: "1,000+" },
  ],
  "fossil-preparation-technician": [
    { name: "Natural History Museum Oslo (NHM/UiO)", industry: "Museum & Research", size: "500+", careersUrl: "https://www.nhm.uio.no" },
    { name: "University Museum of Bergen (UiB)", industry: "Museum & Research", size: "500+", careersUrl: "https://www.uib.no" },
    { name: "NTNU University Museum", industry: "Museum & Research", size: "500+", careersUrl: "https://www.ntnu.edu" },
    { name: "University of Stavanger Museum (UiS)", industry: "Museum & Research", size: "100+", careersUrl: "https://www.uis.no" },
    { name: "Natural History Museum (London)", industry: "Museum & Research", size: "1,000+" },
  ],
  "geologist": [
    { name: "NGU (Geological Survey of Norway)", industry: "Earth Science & Government", size: "200+", careersUrl: "https://www.ngu.no" },
    { name: "NGI (Norwegian Geotechnical Institute)", industry: "Geotechnical Engineering", size: "500+", careersUrl: "https://www.ngi.no" },
    { name: "NVE (Water Resources & Energy Directorate)", industry: "Energy & Government", size: "1,000+", careersUrl: "https://www.nve.no" },
    { name: "SINTEF", industry: "Research", size: "1,000+", careersUrl: "https://www.sintef.no" },
    { name: "Equinor", industry: "Energy", size: "1,000+", careersUrl: "https://www.equinor.com" },
  ],
  "geochemist": [
    { name: "NGU (Geological Survey of Norway)", industry: "Earth Science & Government", size: "200+", careersUrl: "https://www.ngu.no" },
    { name: "University of Oslo (UiO)", industry: "Higher Education", size: "1,000+", careersUrl: "https://www.uio.no" },
    { name: "SINTEF", industry: "Research", size: "1,000+", careersUrl: "https://www.sintef.no" },
    { name: "NGI (Norwegian Geotechnical Institute)", industry: "Geotechnical Engineering", size: "500+", careersUrl: "https://www.ngi.no" },
    { name: "CICERO Center for International Climate Research", industry: "Climate Research", size: "100+", careersUrl: "https://www.cicero.oslo.no" },
  ],
  "volcanologist": [
    { name: "University of Bergen (UiB)", industry: "Higher Education", size: "1,000+", careersUrl: "https://www.uib.no" },
    { name: "University of Oslo (UiO)", industry: "Higher Education", size: "1,000+", careersUrl: "https://www.uio.no" },
    { name: "NORSAR", industry: "Seismology & Research", size: "100+", careersUrl: "https://www.norsar.no" },
    { name: "Norsk Polarinstitutt", industry: "Polar Research", size: "100+", careersUrl: "https://www.npolar.no" },
    { name: "Icelandic Met Office", industry: "Geoscience & Government", size: "100+" },
  ],
  "oceanographer": [
    { name: "Havforskningsinstituttet (Institute of Marine Research)", industry: "Marine Science & Government", size: "1,000+", careersUrl: "https://www.hi.no" },
    { name: "University of Bergen (UiB)", industry: "Higher Education", size: "1,000+", careersUrl: "https://www.uib.no" },
    { name: "University of Tromsø (UiT)", industry: "Higher Education", size: "1,000+", careersUrl: "https://www.uit.no" },
    { name: "Norsk Polarinstitutt", industry: "Polar Research", size: "100+", careersUrl: "https://www.npolar.no" },
    { name: "NIVA (Norwegian Institute for Water Research)", industry: "Environmental Research", size: "200+", careersUrl: "https://www.niva.no" },
  ],
  "sedimentologist": [
    { name: "NGU (Geological Survey of Norway)", industry: "Earth Science & Government", size: "200+", careersUrl: "https://www.ngu.no" },
    { name: "University of Bergen (UiB)", industry: "Higher Education", size: "1,000+", careersUrl: "https://www.uib.no" },
    { name: "University of Oslo (UiO)", industry: "Higher Education", size: "1,000+", careersUrl: "https://www.uio.no" },
    { name: "Equinor", industry: "Energy", size: "1,000+", careersUrl: "https://www.equinor.com" },
    { name: "Aker BP", industry: "Energy", size: "1,000+", careersUrl: "https://www.akerbp.com" },
  ],
  "petroleum-geoscientist": [
    { name: "Equinor", industry: "Energy", size: "1,000+", careersUrl: "https://www.equinor.com" },
    { name: "Aker BP", industry: "Energy", size: "1,000+", careersUrl: "https://www.akerbp.com" },
    { name: "Vår Energi", industry: "Energy", size: "1,000+", careersUrl: "https://www.varenergi.no" },
    { name: "NGU (Geological Survey of Norway)", industry: "Earth Science & Government", size: "200+", careersUrl: "https://www.ngu.no" },
    { name: "Sokkeldirektoratet (Norwegian Offshore Directorate)", industry: "Energy & Government", size: "200+", careersUrl: "https://www.sodir.no" },
  ],

  // ── Biology & field/exploration science ─────────────────────────────
  "marine-biologist": [
    { name: "Havforskningsinstituttet (Institute of Marine Research)", industry: "Marine Research", size: "1,000+", careersUrl: "https://www.hi.no" },
    { name: "Akvaplan-niva", industry: "Marine & Environmental Research", size: "100+", careersUrl: "https://www.akvaplan.niva.no" },
    { name: "NIVA (Norwegian Institute for Water Research)", industry: "Water Research", size: "500+", careersUrl: "https://www.niva.no" },
    { name: "University of Bergen (UiB)", industry: "University & Research", size: "1,000+", careersUrl: "https://www.uib.no" },
    { name: "Norsk Polarinstitutt", industry: "Polar Research", size: "500+", careersUrl: "https://www.npolar.no" },
  ],
  "zoologist": [
    { name: "NINA (Norwegian Institute for Nature Research)", industry: "Nature Research", size: "500+", careersUrl: "https://www.nina.no" },
    { name: "Natural History Museum Oslo (NHM/UiO)", industry: "Museum & Research", size: "200+", careersUrl: "https://www.nhm.uio.no" },
    { name: "NTNU", industry: "University & Research", size: "1,000+", careersUrl: "https://www.ntnu.no" },
    { name: "NMBU (Norwegian University of Life Sciences)", industry: "University & Research", size: "1,000+", careersUrl: "https://www.nmbu.no" },
    { name: "Miljødirektoratet (Environment Agency)", industry: "Public Environment", size: "700+", careersUrl: "https://www.miljodirektoratet.no" },
  ],
  "botanist": [
    { name: "NMBU (Norwegian University of Life Sciences)", industry: "University & Research", size: "1,000+", careersUrl: "https://www.nmbu.no" },
    { name: "Natural History Museum Oslo (NHM/UiO)", industry: "Museum & Botanical Garden", size: "200+", careersUrl: "https://www.nhm.uio.no" },
    { name: "NIBIO (Institute of Bioeconomy Research)", industry: "Bioeconomy Research", size: "700+", careersUrl: "https://www.nibio.no" },
    { name: "University of Bergen (UiB)", industry: "University & Research", size: "1,000+", careersUrl: "https://www.uib.no" },
    { name: "NINA (Norwegian Institute for Nature Research)", industry: "Nature Research", size: "500+", careersUrl: "https://www.nina.no" },
  ],
  "wildlife-biologist": [
    { name: "NINA (Norwegian Institute for Nature Research)", industry: "Nature Research", size: "500+", careersUrl: "https://www.nina.no" },
    { name: "Miljødirektoratet (Environment Agency)", industry: "Public Environment", size: "700+", careersUrl: "https://www.miljodirektoratet.no" },
    { name: "Statens naturoppsyn (Nature Inspectorate)", industry: "Public Nature Management", size: "200+" },
    { name: "NMBU (Norwegian University of Life Sciences)", industry: "University & Research", size: "1,000+", careersUrl: "https://www.nmbu.no" },
    { name: "UiT The Arctic University of Norway", industry: "University & Research", size: "1,000+", careersUrl: "https://www.uit.no" },
  ],
  "conservation-scientist": [
    { name: "Miljødirektoratet (Environment Agency)", industry: "Public Environment", size: "700+", careersUrl: "https://www.miljodirektoratet.no" },
    { name: "NINA (Norwegian Institute for Nature Research)", industry: "Nature Research", size: "500+", careersUrl: "https://www.nina.no" },
    { name: "NIBIO (Institute of Bioeconomy Research)", industry: "Bioeconomy Research", size: "700+", careersUrl: "https://www.nibio.no" },
    { name: "WWF Verdens naturfond", industry: "Conservation NGO", size: "100+" },
    { name: "IUCN (International Union for Conservation of Nature)", industry: "Conservation NGO", size: "900+" },
  ],
  "speleologist": [
    { name: "NGU (Geological Survey of Norway)", industry: "Geological Research", size: "200+", careersUrl: "https://www.ngu.no" },
    { name: "University of Bergen (UiB)", industry: "University & Research", size: "1,000+", careersUrl: "https://www.uib.no" },
    { name: "NTNU", industry: "University & Research", size: "1,000+", careersUrl: "https://www.ntnu.no" },
    { name: "Norsk Grotteforbund (Norwegian Caving Federation)", industry: "Caving & Research", size: "50+" },
    { name: "University of Oslo (UiO)", industry: "University & Research", size: "1,000+", careersUrl: "https://www.uio.no" },
  ],
  "polar-researcher": [
    { name: "Norsk Polarinstitutt", industry: "Polar Research", size: "500+", careersUrl: "https://www.npolar.no" },
    { name: "UNIS (University Centre in Svalbard)", industry: "Polar University", size: "200+", careersUrl: "https://www.unis.no" },
    { name: "UiT The Arctic University of Norway", industry: "University & Research", size: "1,000+", careersUrl: "https://www.uit.no" },
    { name: "Framsenteret (Fram Centre)", industry: "Polar & Climate Research", size: "500+", careersUrl: "https://framsenteret.no" },
    { name: "Meteorologisk institutt", industry: "Climate & Weather", size: "500+", careersUrl: "https://www.met.no" },
  ],
  "planetary-scientist": [
    { name: "University of Oslo (UiO)", industry: "University & Research", size: "1,000+", careersUrl: "https://www.uio.no" },
    { name: "Andøya Space", industry: "Space & Research", size: "100+", careersUrl: "https://andoyaspace.no" },
    { name: "Norsk Romsenter (Norwegian Space Agency)", industry: "Space Agency", size: "100+", careersUrl: "https://www.romsenter.no" },
    { name: "ESA (European Space Agency)", industry: "Space Agency", size: "1,000+", careersUrl: "https://www.esa.int" },
    { name: "NASA", industry: "Space Agency", size: "1,000+", careersUrl: "https://www.nasa.gov" },
  ],

  // ── Museums & science communication ─────────────────────────────────
  "museum-curator": [
    { name: "Nasjonalmuseet", industry: "Art Museum", size: "500+", careersUrl: "https://www.nasjonalmuseet.no" },
    { name: "Kulturhistorisk museum (UiO)", industry: "Cultural History Museum", size: "200+" },
    { name: "Naturhistorisk museum (UiO)", industry: "Natural History Museum", size: "200+", careersUrl: "https://www.nhm.uio.no" },
    { name: "Norsk Teknisk Museum", industry: "Science & Technology Museum", size: "200+" },
    { name: "MUNCH", industry: "Art Museum", size: "200+" },
  ],
  "museum-collections-manager": [
    { name: "Nasjonalmuseet", industry: "Art Museum", size: "500+", careersUrl: "https://www.nasjonalmuseet.no" },
    { name: "Kulturhistorisk museum (UiO)", industry: "Cultural History Museum", size: "200+" },
    { name: "Naturhistorisk museum (UiO)", industry: "Natural History Museum", size: "200+", careersUrl: "https://www.nhm.uio.no" },
    { name: "Norsk Folkemuseum", industry: "Cultural History Museum", size: "200+" },
    { name: "Riksantikvaren", industry: "Cultural Heritage", size: "200+", careersUrl: "https://www.riksantikvaren.no" },
  ],
  "exhibit-designer": [
    { name: "Norsk Teknisk Museum", industry: "Science & Technology Museum", size: "200+" },
    { name: "Nasjonalmuseet", industry: "Art Museum", size: "500+", careersUrl: "https://www.nasjonalmuseet.no" },
    { name: "Vitensenteret", industry: "Science Centre", size: "100+" },
    { name: "Norsk Folkemuseum", industry: "Cultural History Museum", size: "200+" },
    { name: "Expology", industry: "Exhibition Design", size: "50+" },
  ],
  "science-communicator": [
    { name: "forskning.no", industry: "Science Media", size: "20+", careersUrl: "https://www.forskning.no" },
    { name: "NRK", industry: "Public Broadcasting", size: "1,000+", careersUrl: "https://www.nrk.no" },
    { name: "Vitensenteret", industry: "Science Centre", size: "100+" },
    { name: "University of Oslo (UiO)", industry: "University", size: "1,000+", careersUrl: "https://www.uio.no" },
    { name: "Norges forskningsråd", industry: "Research Funding", size: "200+", careersUrl: "https://www.forskningsradet.no" },
  ],
  "scientific-illustrator": [
    { name: "Naturhistorisk museum (UiO)", industry: "Natural History Museum", size: "200+", careersUrl: "https://www.nhm.uio.no" },
    { name: "forskning.no", industry: "Science Media", size: "20+", careersUrl: "https://www.forskning.no" },
    { name: "University of Oslo (UiO)", industry: "University", size: "1,000+", careersUrl: "https://www.uio.no" },
    { name: "Norsk Teknisk Museum", industry: "Science & Technology Museum", size: "200+" },
    { name: "Springer Nature", industry: "Science Media", size: "1,000+" },
  ],

  // ── Archaeology, anthropology & history ─────────────────────────────
  "archaeologist": [
    { name: "NIKU (Cultural Heritage Research)", industry: "Cultural Heritage Research", size: "200+", careersUrl: "https://www.niku.no" },
    { name: "Riksantikvaren (Directorate for Cultural Heritage)", industry: "Public Cultural Heritage", size: "150+", careersUrl: "https://www.riksantikvaren.no" },
    { name: "Kulturhistorisk museum (UiO)", industry: "Museum & Research", size: "200+" },
    { name: "Arkeologisk museum (UiS)", industry: "Museum & Research", size: "100+", careersUrl: "https://www.uis.no" },
    { name: "NTNU Vitenskapsmuseet", industry: "University Museum", size: "200+", careersUrl: "https://www.ntnu.no" },
  ],
  "anthropologist": [
    { name: "University of Oslo (UiO)", industry: "University & Research", size: "1,000+", careersUrl: "https://www.uio.no" },
    { name: "University of Bergen (UiB)", industry: "University & Research", size: "1,000+", careersUrl: "https://www.uib.no" },
    { name: "NTNU", industry: "University & Research", size: "1,000+", careersUrl: "https://www.ntnu.no" },
    { name: "Chr. Michelsen Institute (CMI)", industry: "Development Research", size: "100+", careersUrl: "https://www.cmi.no" },
    { name: "Norsk Folkemuseum", industry: "Cultural History Museum", size: "200+" },
  ],
  "historian": [
    { name: "University of Oslo (UiO)", industry: "University & Research", size: "1,000+", careersUrl: "https://www.uio.no" },
    { name: "University of Bergen (UiB)", industry: "University & Research", size: "1,000+", careersUrl: "https://www.uib.no" },
    { name: "Arkivverket (National Archives of Norway)", industry: "Public Archives", size: "500+", careersUrl: "https://www.arkivverket.no" },
    { name: "Nasjonalbiblioteket (National Library)", industry: "Library & Heritage", size: "400+", careersUrl: "https://www.nb.no" },
    { name: "Norsk Folkemuseum", industry: "Cultural History Museum", size: "200+" },
  ],
};
