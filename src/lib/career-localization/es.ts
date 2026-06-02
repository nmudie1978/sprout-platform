import type { CareerLocalizationEntry } from "./types";

/**
 * Spanish per-career overrides. Real, CITED data only — any figure that
 * cannot be verified is OMITTED (English fallback / suppressed), never
 * invented. See the design spec:
 * docs/superpowers/specs/2026-06-02-spain-substrate-localization-design.md
 *
 * educationPath: derived from the official programme data already verified in
 *   src/lib/education/data/es-supplement.json (official university / TodoFP URLs).
 * salary: APPROXIMATE 2025 gross annual ranges (brutos/año) from Spanish
 *   salary sources (INE Encuesta de Estructura Salarial basis + public salary
 *   portals). Ranges vary by region, sector (público/privado) and experience.
 *   PENDING OWNER REVIEW before launch.
 *
 * Held back (no salary shown until verified): `architect` (only a *software*-
 * architect figure was found, not building architect) and `psychologist`.
 */
export const ES_CAREER_LOCALIZATION: Record<string, CareerLocalizationEntry> = {
  doctor: {
    description:
      "Diagnostica y trata enfermedades y acompaña a los pacientes en su recuperación.",
    salary: {
      value: "33.000 – 80.000 €/año brutos (más en algunas especialidades y con experiencia)",
      source: "https://isanidad.com/313664/un-informe-situa-los-salarios-medicos-en-2025-entre-33-000-brutos-anuales-al-inicio-y-132-000-euros-para-los-mas-experimentados/",
    },
    educationPath: {
      value: "Grado en Medicina (6 años) + examen MIR para acceder a la residencia.",
      source: "https://www.ucm.es/estudios/grado-medicina",
    },
  },
  lawyer: {
    description:
      "Asesora y defiende a personas y empresas, e interpreta y aplica la ley.",
    salary: {
      value: "media ~35.000 €/año brutos (muy variable según despacho y especialidad)",
      source: "https://www.oficinaempleo.com/blog/sueldo-medio-por-profesion-en-espana-datos-actualizados-a-2025/",
    },
    educationPath: {
      value: "Grado en Derecho (4 años) + Máster de Acceso a la Abogacía y examen estatal; colegiación.",
      source: "https://www.ucm.es/estudios/grado-derecho2020",
    },
  },
  psychologist: {
    description:
      "Estudia el comportamiento y acompaña a las personas en su bienestar emocional.",
    // salary held back — not verified for Spain; card shows no salary.
    educationPath: {
      value: "Grado en Psicología (4 años); para la práctica clínica, el Máster en Psicología General Sanitaria o la vía PIR.",
      source: "https://www.ucm.es/grado-psicologia",
    },
  },
  "primary-teacher": {
    description:
      "Enseña y acompaña a niños y niñas en su aprendizaje en la escuela primaria.",
    salary: {
      value: "~32.000 €/año brutos (sector educación); plaza pública mediante oposiciones",
      source: "https://www.oficinaempleo.com/blog/sueldo-medio-por-profesion-en-espana-datos-actualizados-a-2025/",
    },
    educationPath: {
      value: "Grado en Maestro en Educación Primaria (4 años) con prácticas; plaza pública vía oposiciones.",
      source: "https://www.ucm.es/estudios/grado-educacionprimaria",
    },
  },
  dentist: {
    description:
      "Cuida la salud bucodental: previene, diagnostica y trata problemas de dientes y encías.",
    salary: {
      value: "media ~66.500 €/año brutos (según sector y consulta propia)",
      source: "https://www.oficinaempleo.com/blog/sueldo-medio-por-profesion-en-espana-datos-actualizados-a-2025/",
    },
    educationPath: {
      value: "Grado en Odontología (5 años); colegiación para ejercer.",
      source: "https://www.ucm.es/estudios/grado-odontologia",
    },
  },
  nurse: {
    description:
      "Cuida a los pacientes, administra tratamientos y acompaña a las familias.",
    salary: {
      value: "26.000 – 35.000 €/año brutos (más en privada o con turnos)",
      source: "https://www.oficinaempleo.com/blog/sueldo-medio-por-profesion-en-espana-datos-actualizados-a-2025/",
    },
    educationPath: {
      value: "Grado en Enfermería (4 años) con prácticas clínicas; colegiación.",
      source: "https://www.ub.edu/portal/web/enfermeria/grado",
    },
  },
  physiotherapist: {
    description:
      "Ayuda a recuperar el movimiento y a aliviar el dolor mediante ejercicio y terapia manual.",
    salary: {
      value: "20.000 – 35.000 €/año brutos (según sector y experiencia)",
      source: "https://www.oficinaempleo.com/blog/sueldo-medio-por-profesion-en-espana-datos-actualizados-a-2025/",
    },
    educationPath: {
      value: "Grado en Fisioterapia (4 años) con prácticas clínicas; colegiación.",
      source: "https://web.ub.edu/en/web/estudis/w/bachelordegree-g1133",
    },
  },
  "software-developer": {
    description:
      "Crea y mantiene programas y aplicaciones, resolviendo problemas con código.",
    salary: {
      value: "25.000 € (junior) – 50.000 €/año brutos; sénior 42.000 – 65.000 €",
      source: "https://www.xtart.com/blog/cuanto-gana-un-programador-en-espana",
    },
    educationPath: {
      value: "Grado en Ingeniería Informática (4 años). También hay FP de Grado Superior en informática (p. ej. DAW/DAM).",
      source: "https://www.fi.upm.es/?id=gradoingenieriainformatica",
    },
  },
  architect: {
    description:
      "Diseña edificios y espacios, equilibrando estética, función y seguridad.",
    // salary held back — only a *software*-architect figure was found, not building architect.
    educationPath: {
      value: "Grado en Fundamentos de la Arquitectura (5 años) + Máster habilitante para ejercer.",
      source: "https://etsamadrid.aq.upm.es/es/estudios/grado/grado-en-fundamentos-de-la-arquitectura/informacion-general",
    },
  },
  electrician: {
    description:
      "Instala y repara sistemas eléctricos en viviendas, locales e industria.",
    salary: {
      value: "21.000 – 27.000 €/año brutos (más como autónomo)",
      source: "https://www.infobae.com/espana/2025/11/20/electricista-fontanero-o-carpintero-los-oficios-con-mejores-salarios-de-2025-segun-un-estudio/",
    },
    educationPath: {
      value: "FP: Técnico en Instalaciones Eléctricas y Automáticas (Grado Medio, 2 años) con prácticas (FCT).",
      source: "https://www.todofp.es/que-estudiar/familias-profesionales/electricidad-electronica/instalaciones-electricas-automaticas.html",
    },
  },
  plumber: {
    description:
      "Instala y mantiene tuberías, calefacción y sistemas de agua.",
    salary: {
      value: "20.000 – 26.000 €/año brutos (más como autónomo)",
      source: "https://www.infobae.com/espana/2025/11/20/electricista-fontanero-o-carpintero-los-oficios-con-mejores-salarios-de-2025-segun-un-estudio/",
    },
    educationPath: {
      value: "FP: Técnico en Instalaciones de Producción de Calor (Grado Medio, 2 años) con prácticas (FCT).",
      source: "https://www.todofp.es/que-estudiar/familias-profesionales/instalacion-mantenimiento/instalaciones-produccion-calor.html",
    },
  },

  // ── Round 2 additions (common Spanish youth paths) ──────────────────
  // Spanish description (all) + cited EUR salary where verifiable (salaries =
  // approx 2025 gross-annual ranges: calculaahora.es INE basis / oficinaempleo
  // / xtart). Education paths cited to official catalogs: TodoFP families
  // catalog (FP routes) and official university Grado pages/offers.
  // police-officer + real-estate-agent: education path held back (no single
  // official route to cite — varies by oposición / professional registration).
  chef: {
    description: "Crea platos y dirige la cocina: prepara, emplata y coordina al equipo.",
    salary: { value: "16.500 – 30.000 €/año brutos (ayudante → jefe de cocina)", source: "https://calculaahora.es/blog/sueldo-medio-profesiones-espana.html" },
    educationPath: { value: "FP: Técnico en Cocina y Gastronomía (Grado Medio), o Técnico Superior en Dirección de Cocina.", source: "https://www.todofp.es/que-estudiar/familias-profesionales.html" },
  },
  accountant: {
    description: "Lleva las cuentas: registra ingresos y gastos, impuestos y balances.",
    salary: { value: "21.000 – 48.000 €/año brutos (según experiencia)", source: "https://calculaahora.es/blog/sueldo-medio-profesiones-espana.html" },
    educationPath: { value: "FP: Técnico Superior en Administración y Finanzas, o Grado en Administración y Dirección de Empresas (ADE) / Economía.", source: "https://www.todofp.es/que-estudiar/familias-profesionales.html" },
  },
  journalist: {
    description: "Investiga, escribe y cuenta historias e información de actualidad.",
    salary: { value: "18.000 – 38.000 €/año brutos", source: "https://calculaahora.es/blog/sueldo-medio-profesiones-espana.html" },
    educationPath: { value: "Grado en Periodismo (4 años).", source: "https://www.uv.es/uvweb/college/en/undergraduate-studies/undergraduate-studies-/degree-programmes-offered/degree-journalism-2010-1285846094474/titulacio.html?id=1285847461402" },
  },
  "graphic-designer": {
    description: "Diseña piezas visuales: logos, carteles, webs y material de marca.",
    salary: { value: "19.000 – 44.000 €/año brutos", source: "https://calculaahora.es/blog/sueldo-medio-profesiones-espana.html" },
    educationPath: { value: "FP: Técnico Superior en Gráfica Publicitaria (Artes Plásticas y Diseño), o Grado en Diseño.", source: "https://www.todofp.es/que-estudiar/familias-profesionales.html" },
  },
  pharmacist: {
    description: "Dispensa medicamentos y asesora sobre su uso seguro y la salud.",
    salary: { value: "28.000 – 42.000 €/año brutos", source: "https://calculaahora.es/blog/sueldo-medio-profesiones-espana.html" },
    educationPath: { value: "Grado en Farmacia (5 años); colegiación para ejercer.", source: "https://www.us.es/estudiar/que-estudiar/oferta-de-grados" },
  },
  veterinarian: {
    description: "Cuida la salud de los animales: previene, diagnostica y trata.",
    salary: { value: "20.000 – 38.000 €/año brutos", source: "https://calculaahora.es/blog/sueldo-medio-profesiones-espana.html" },
    educationPath: { value: "Grado en Veterinaria (5 años); colegiación para ejercer.", source: "https://veterinaria.ucm.es/grado" },
  },
  "social-worker": {
    description: "Acompaña a personas y familias y las conecta con recursos y apoyos.",
    salary: { value: "20.000 – 33.000 €/año brutos", source: "https://calculaahora.es/blog/sueldo-medio-profesiones-espana.html" },
    educationPath: { value: "Grado en Trabajo Social (4 años).", source: "https://www.us.es/estudiar/que-estudiar/oferta-de-grados" },
  },
  "civil-engineer": {
    description: "Diseña y supervisa obras: carreteras, puentes, edificios e infraestructuras.",
    salary: { value: "32.000 – 40.000 €/año brutos", source: "https://www.oficinaempleo.com/blog/sueldo-medio-por-profesion-en-espana-datos-actualizados-a-2025/" },
    educationPath: { value: "Grado en Ingeniería Civil (4 años); máster habilitante para algunas atribuciones.", source: "https://www.us.es/estudiar/que-estudiar/oferta-de-grados" },
  },
  "hotel-manager": {
    description: "Dirige un hotel: equipo, clientes, reservas y que todo funcione.",
    salary: { value: "40.000 – 60.000 €/año brutos", source: "https://www.oficinaempleo.com/blog/sueldo-medio-por-profesion-en-espana-datos-actualizados-a-2025/" },
    educationPath: { value: "FP: Técnico Superior en Gestión de Alojamientos Turísticos, o Grado en Turismo.", source: "https://www.todofp.es/que-estudiar/familias-profesionales.html" },
  },
  "web-developer": {
    description: "Construye y mantiene páginas y aplicaciones web con código.",
    salary: { value: "25.000 – 50.000 €/año brutos (sénior más)", source: "https://www.xtart.com/blog/cuanto-gana-un-programador-en-espana" },
    educationPath: { value: "FP: Técnico Superior en Desarrollo de Aplicaciones Web (DAW), o Grado en Ingeniería Informática.", source: "https://www.todofp.es/que-estudiar/familias-profesionales.html" },
  },
  hairdresser: {
    description: "Corta, peina y cuida el cabello, y aconseja a cada cliente.",
    educationPath: { value: "FP: Técnico en Peluquería y Cosmética Capilar (Grado Medio).", source: "https://www.todofp.es/que-estudiar/familias-profesionales.html" },
  },
  "marketing-manager": {
    description: "Planifica y dirige campañas para dar a conocer productos y marcas.",
    educationPath: { value: "Grado en Marketing o en Publicidad y RR.PP.; también FP Superior en Marketing y Publicidad.", source: "https://www.us.es/estudiar/que-estudiar/oferta-de-grados" },
  },
  "preschool-teacher": {
    description: "Acompaña y enseña a los más pequeños en sus primeros años de aprendizaje.",
    educationPath: { value: "Grado en Maestro/a en Educación Infantil (4 años) con prácticas.", source: "https://www.uv.es/uvweb/college/en/undergraduate-studies/undergraduate-studies-/degree-programmes-offered/degree-preschool-education-1285846094474/Titulacio.html?id=1285847460706" },
  },
  // Education path held back — route is an oposición / professional registration, no single official page to cite.
  "police-officer": {
    description: "Protege a las personas, previene el delito y vela por la seguridad.",
  },
  "real-estate-agent": {
    description: "Ayuda a comprar, vender y alquilar viviendas y locales.",
  },
  "personal-trainer": {
    description: "Diseña entrenamientos y motiva a las personas a mejorar su forma física.",
    educationPath: { value: "FP: Técnico Superior en Acondicionamiento Físico, o Grado en Ciencias de la Actividad Física y del Deporte (CAFD).", source: "https://www.todofp.es/que-estudiar/familias-profesionales.html" },
  },
  paramedic: {
    description: "Atiende urgencias y traslada a pacientes, estabilizándolos en el camino.",
    educationPath: { value: "FP: Técnico en Emergencias Sanitarias (Grado Medio).", source: "https://www.todofp.es/que-estudiar/familias-profesionales.html" },
  },
  carpenter: {
    description: "Trabaja la madera: fabrica y monta muebles, puertas y estructuras.",
    educationPath: { value: "FP: Técnico en Carpintería y Mueble (Grado Medio).", source: "https://www.todofp.es/que-estudiar/familias-profesionales.html" },
  },
  "dental-hygienist": {
    description: "Cuida la higiene bucodental y ayuda en los tratamientos del dentista.",
    educationPath: { value: "FP: Técnico Superior en Higiene Bucodental (Grado Superior).", source: "https://www.todofp.es/que-estudiar/familias-profesionales.html" },
  },
};
