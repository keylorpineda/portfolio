// All copy lives here, once per language. Pages render statically at / (en) and /es/.

export type Lang = 'en' | 'es';

export const SITE = {
  url: 'https://keylorpineda.dev',
  email: 'keylorpineda729@gmail.com',
  github: 'https://github.com/keylorpineda',
  linkedin: 'https://www.linkedin.com/in/keylor-pineda',
  certs: 'https://www.linkedin.com/in/keylor-pineda/details/certifications/',
};

// `key` shots are live captures stored as /img/shots/<key>-<lang>-<theme>.webp; `src` shots are fixed images.
export type Shot = { key?: string; focus?: 'right'; src?: string; dark?: string; w: number; h: number; fit?: 'cover' | 'contain' };

export type Project = {
  id: string;
  name: string;
  tint: string; // the project's own colour, used for its glow and markers
  code: string;
  demo?: string;
  window: string; // label shown in the window's title bar
  metrics: { value: string; count?: number; decimals?: number; suffix?: string }[];
  chips: string[];
  shots: Shot[];
};

export const PROJECTS: Project[] = [
  {
    id: 'hc',
    name: 'HealthyCropping',
    tint: '#17b877',
    window: 'healthycropping / docs',
    code: 'https://github.com/keylorpineda/healthycropping',
    metrics: [
      { value: '0.97', count: 0.97, decimals: 2 },
      { value: '6 MB', count: 6, suffix: ' MB' },
      { value: '3', count: 3 },
    ],
    chips: ['React Native', 'Expo', 'TypeScript', 'TensorFlow Lite', 'Python', 'FastAPI', 'Firebase', 'SQLite', 'Gemini'],
    shots: [
      { src: '/img/hc-hero-light.webp', dark: '/img/hc-hero-dark.webp', w: 1800, h: 720, fit: 'contain' },
      { src: '/img/hc-dataset.webp', w: 695, h: 926, fit: 'contain' },
      { src: '/img/hc-gradcam.webp', w: 631, h: 1056, fit: 'contain' },
    ],
  },
  {
    id: 'booth',
    name: 'Booth',
    tint: '#5b54f0',
    window: 'booth-tawny.vercel.app',
    code: 'https://github.com/keylorpineda/booth',
    demo: 'https://booth-tawny.vercel.app/s/panaderia-demo',
    metrics: [{ value: 'Multi' }, { value: 'ES · EN' }, { value: '360 px', count: 360, suffix: ' px' }],
    chips: ['React', 'TypeScript', 'Vite', 'Tailwind', 'TanStack Query', 'NestJS', 'Prisma', 'PostgreSQL', 'Gemini', 'Playwright', 'Vercel'],
    shots: [
      { key: 'booth-store', w: 1440, h: 900 },
      { key: 'booth-cart', w: 1440, h: 900, focus: 'right' },
      { src: '/img/booth-ai-receipt-verification.webp', w: 1400, h: 896 },
    ],
  },
  {
    id: 'rag',
    name: 'RAG Research Engine',
    tint: '#1fa37f',
    window: 'research-engine-omega.vercel.app',
    code: 'https://github.com/keylorpineda/RAG-Research-Engine',
    demo: 'https://research-engine-omega.vercel.app',
    metrics: [
      { value: '0.88', count: 0.88, decimals: 2 },
      { value: '88%', count: 88, suffix: '%' },
      { value: '10 ms', count: 10, suffix: ' ms' },
    ],
    chips: ['Python', 'FastAPI', 'pgvector', 'SQLAlchemy', 'Angular', 'Cohere', 'Groq', 'Docker', 'pytest'],
    shots: [
      { key: 'rag-ask', w: 1440, h: 900 },
      { key: 'rag-no', w: 1440, h: 900 },
      { key: 'rag-bench', w: 1440, h: 900 },
    ],
  },
];

export const TOOLS: [logo: string, name: string, cat: string][] = [
  ['typescript', 'TypeScript', 'front'], ['javascript', 'JavaScript', 'front'], ['react', 'React', 'front'],
  ['react', 'React Native', 'front'], ['expo', 'Expo', 'front'], ['angular', 'Angular', 'front'],
  ['vite', 'Vite', 'front'], ['tailwind', 'Tailwind CSS', 'front'], ['tanstack', 'TanStack Query', 'front'],
  ['zod', 'Zod', 'front'],
  ['python', 'Python', 'back'], ['java', 'Java', 'back'], ['nodejs', 'Node.js', 'back'], ['nestjs', 'NestJS', 'back'],
  ['fastapi', 'FastAPI', 'back'], ['spring', 'Spring Boot', 'back'], ['graphql', 'GraphQL', 'back'],
  ['prisma', 'Prisma', 'back'], ['sqlalchemy', 'SQLAlchemy', 'back'], ['postgresql', 'PostgreSQL', 'back'],
  ['sqlite', 'SQLite', 'back'], ['neon', 'Neon', 'back'], ['firebase', 'Firebase', 'back'],
  ['tensorflow', 'TensorFlow', 'ai'], ['keras', 'Keras', 'ai'], ['numpy', 'NumPy', 'ai'], ['pandas', 'pandas', 'ai'],
  ['scikitlearn', 'scikit-learn', 'ai'], ['gemini', 'Gemini', 'ai'], ['cohere', 'Cohere', 'ai'], ['groq', 'Groq', 'ai'],
  ['oracle', 'Oracle Cloud', 'cloud'], ['googlecloud', 'Google Cloud', 'cloud'], ['aws', 'AWS', 'cloud'],
  ['docker', 'Docker', 'cloud'], ['githubactions', 'GitHub Actions', 'cloud'], ['vercel', 'Vercel', 'cloud'],
  ['render', 'Render', 'cloud'], ['cloudinary', 'Cloudinary', 'cloud'], ['linux', 'Linux', 'cloud'],
  ['jest', 'Jest', 'quality'], ['vitest', 'Vitest', 'quality'], ['playwright', 'Playwright', 'quality'],
  ['pytest', 'pytest', 'quality'], ['git', 'Git', 'quality'], ['pnpm', 'pnpm', 'quality'],
];

export const TABS = ['all', 'front', 'back', 'ai', 'cloud', 'quality'] as const;

const en = {
  meta: {
    title: 'Keylor Pineda · Software developer',
    description:
      'Software developer in Costa Rica. I build full-stack products end to end, and machine learning that runs right on a phone, even with no signal.',
  },
  skip: 'Skip to content',
  palette: {
    open: 'Search and commands',
    placeholder: 'Jump to a section, a project or an action…',
    go: 'Go to',
    projects: 'Projects',
    actions: 'Actions',
    theme: 'Switch light / dark',
    lang: 'Cambiar a español',
    copy: 'Copy email',
    empty: 'Nothing matches that.',
    home: 'Home',
  },
  roles: ['Full-stack dev', 'On-device ML', 'RAG systems', 'Cloud certified', 'Made in Costa Rica'],
  fig: 'Fig.',
  clock: 'Local time · UTC−6',
  nowLabel: 'Now',
  nav: { work: 'Work', stack: 'Stack', certs: 'Certifications', activity: 'Activity', contact: 'Contact', menu: 'Menu', close: 'Close' },
  aria: { lang: 'Language', theme: 'Switch between light and dark mode' },
  hero: {
    eyebrow: 'Software developer · Costa Rica',
    title: ['Keylor', 'Pineda.'],
    accent: 1, // index of the line drawn in the accent gradient
    lead: 'I build full-stack products end to end, and machine learning that runs right on a phone, even with no signal.',
    cta1: 'See my work',
    cta2: 'Get in touch',
    now: 'Now building HealthyCropping',
    facts: [
      { v: '3', l: 'products shipped' },
      { v: '4', l: 'cloud & AI certs' },
    ],
    scroll: 'Scroll',
  },
  work: {
    title: 'Selected work',
    sub: 'Three products I designed, built and shipped from scratch, from the database to the interface.',
    code: 'Source code',
    demo: 'Live demo',
    prev: 'Previous project',
    next: 'Next project',
    view: 'See the project',
  },
  projects: {
    hc: {
      kicker: 'Android · On-device ML',
      status: 'In development',
      desc: 'An offline-first Android app that detects coffee, cacao and banana diseases from a phone photo, built for farms in Costa Rica where the signal drops.',
      steps: [
        { t: 'Diagnosis without signal', d: 'Each crop has its own MobileNetV3 model running on the phone with TensorFlow Lite. Scans, farms and plots stay in SQLite, so nothing depends on a connection.' },
        { t: 'Trained on real field photos', d: 'Public datasets from coffee, cacao and banana plots, deduplicated by perceptual hash and split by plant so no leaf leaks between training and test.' },
        { t: 'It shows where it looks', d: 'Grad-CAM heatmaps show which part of the leaf drove each prediction, and every experiment, including the failed ones, is documented.' },
      ],
      metrics: ['banana test Macro-F1', 'per model, float16', 'crops, one model each'],
      alts: ['HealthyCropping overview', 'Field photo dataset', 'Grad-CAM heatmaps per class'],
      note: '',
    },
    booth: {
      kicker: 'Web app · Commerce',
      status: 'Live demo',
      desc: 'Small businesses already sell through WhatsApp, one chat at a time. Booth gives each store a single link with its catalog and keeps orders, payments and stock in one place.',
      steps: [
        { t: 'One link per store', d: 'Shoppers open the store link, browse the catalog and build a cart. No app to install and no account to create.' },
        { t: 'Orders, not chats', d: 'The cart turns into a clean WhatsApp message, stock is reserved atomically, and the owner moves each order from pending to ready on the dashboard.' },
        { t: 'Receipts checked by AI', d: 'For bank transfers, Gemini reads the receipt and tells the owner whether the amount and recipient match before the payment is confirmed.' },
      ],
      metrics: ['tenant, isolated per store', 'and every currency in minor units', 'mobile end to end tests'],
      alts: ['Booth storefront', 'Order summary before sending it by WhatsApp', 'AI receipt verification'],
      note: '',
    },
    rag: {
      kicker: 'AI · Retrieval',
      status: 'Live demo · benchmarked in CI',
      desc: 'Upload PDFs and notes, ask in English or Spanish, and get answers that cite the exact passages they use. When the documents do not hold the answer, it refuses instead of guessing.',
      steps: [
        { t: 'Answers with receipts', d: 'Every answer cites numbered passages, and citations to passages the model was never given are removed and reported.' },
        { t: 'Hybrid retrieval, then a gate', d: 'pgvector and Postgres full-text search fused with Reciprocal Rank Fusion, an optional Cohere reranker, and a calibrated threshold that stops the model when the evidence is weak.' },
        { t: 'Measured on every pull request', d: 'A benchmark of 82 questions in English and Spanish runs in CI and fails the build if retrieval quality drops.' },
      ],
      metrics: ['Recall@5 with reranking', 'unanswerable questions refused', 'search over 50k chunks, down from 39 s'],
      alts: ['An answer with numbered citations', 'The engine declining to answer', 'Benchmark results'],
      note: 'Runs on free tiers, so the first question can take about a minute while the server wakes up.',
    },
  },
  stack: {
    title: 'Toolbox',
    sub: 'What I reach for, grouped by where it lives.',
    tabs: { all: 'All', front: 'Frontend & mobile', back: 'Backend & data', ai: 'AI & ML', cloud: 'Cloud & DevOps', quality: 'Quality' },
  },
  certs: {
    title: 'Certifications',
    sub: 'Cloud and AI fundamentals, verified by the issuers.',
    verify: 'Verify',
    items: [
      { year: '2026', org: 'Oracle', logo: 'oracle', name: 'OCI Certified Architect Associate', meta: 'Issued Oct 2026 · Expires Oct 2028', id: 'ID 103563028OCI26CAA' },
      { year: '2026', org: 'Oracle', logo: 'oracle', name: 'OCI Certified AI Foundations Associate', meta: 'Issued Oct 2026 · Expires Oct 2028', id: 'ID 103563028OCI26AICFA' },
      { year: '2026', org: 'Google', logo: 'google', name: 'Google Cloud Computing Foundations', meta: 'Issued Oct 2026', id: 'Google Cloud · Big data' },
      { year: '2025', org: 'Amazon Web Services', logo: 'aws', name: 'Advanced Generative AI Implementation on AWS', meta: 'Issued Sep 2025', id: 'Generative AI · Machine learning' },
    ],
  },
  activity: {
    title: 'Activity',
    sub: 'Pulled from GitHub and refreshed every day.',
    alt1: 'Contribution totals and streaks',
    alt2: 'Contribution calendar for the last year',
  },
  learning: {
    title: 'Learning next',
    items: [
      { logo: 'aws', t: 'AWS', d: 'Cloud architecture. I started with generative AI on AWS and I am going deeper into the core services.' },
      { logo: 'databricks', t: 'Databricks', d: 'Data engineering at scale: Spark, Delta Lake and the lakehouse model.' },
      { logo: '', t: 'Cybersecurity', d: 'How systems get attacked, from the network to the application, so I can build ones that hold up.' },
    ],
  },
  contact: {
    title: ["Let's build", 'something.'],
    sub: "Have a project, a role or a question about something I built? Write me, I'd like to hear about it.",
    copy: 'Copy',
    copied: 'Copied',
  },
  footer: 'Designed and built from scratch in Costa Rica.',
};

const es: typeof en = {
  meta: {
    title: 'Keylor Pineda · Desarrollador de software',
    description:
      'Desarrollador de software en Costa Rica. Construyo productos full-stack de punta a punta, y machine learning que corre directamente en el teléfono, incluso sin señal.',
  },
  skip: 'Saltar al contenido',
  palette: {
    open: 'Buscar y comandos',
    placeholder: 'Ir a una sección, un proyecto o una acción…',
    go: 'Ir a',
    projects: 'Proyectos',
    actions: 'Acciones',
    theme: 'Cambiar claro / oscuro',
    lang: 'Switch to English',
    copy: 'Copiar correo',
    empty: 'Nada coincide con eso.',
    home: 'Inicio',
  },
  roles: ['Dev full-stack', 'ML en el móvil', 'Sistemas RAG', 'Nube certificada', 'Hecho en Costa Rica'],
  fig: 'Fig.',
  clock: 'Hora local · UTC−6',
  nowLabel: 'Ahora',
  nav: { work: 'Proyectos', stack: 'Stack', certs: 'Certificaciones', activity: 'Actividad', contact: 'Contacto', menu: 'Menú', close: 'Cerrar' },
  aria: { lang: 'Idioma', theme: 'Cambiar entre modo claro y oscuro' },
  hero: {
    eyebrow: 'Desarrollador de software · Costa Rica',
    title: ['Keylor', 'Pineda.'],
    accent: 1,
    lead: 'Construyo productos full-stack de punta a punta, y machine learning que corre directamente en el teléfono, incluso sin señal.',
    cta1: 'Ver proyectos',
    cta2: 'Contactarme',
    now: 'Construyendo HealthyCropping',
    facts: [
      { v: '3', l: 'productos lanzados' },
      { v: '4', l: 'certificados' },
    ],
    scroll: 'Desliza',
  },
  work: {
    title: 'Proyectos destacados',
    sub: 'Tres productos que diseñé, construí y publiqué desde cero, de la base de datos a la interfaz.',
    code: 'Código',
    demo: 'Ver demo',
    prev: 'Proyecto anterior',
    next: 'Proyecto siguiente',
    view: 'Ver el proyecto',
  },
  projects: {
    hc: {
      kicker: 'Android · ML en el dispositivo',
      status: 'En desarrollo',
      desc: 'App Android offline-first que detecta enfermedades del café, el cacao y el banano con una foto, pensada para fincas de Costa Rica donde la señal se cae.',
      steps: [
        { t: 'Diagnóstico sin señal', d: 'Cada cultivo tiene su propio modelo MobileNetV3 corriendo en el teléfono con TensorFlow Lite. Escaneos, fincas y lotes se guardan en SQLite, así que nada depende de la conexión.' },
        { t: 'Entrenado con fotos reales de campo', d: 'Datasets públicos de plantaciones de café, cacao y banano, sin duplicados por hash perceptual y divididos por planta para que ninguna hoja se filtre entre entrenamiento y prueba.' },
        { t: 'Muestra dónde mira', d: 'Los mapas Grad-CAM muestran qué parte de la hoja decidió cada predicción, y cada experimento, incluidos los que fallaron, está documentado.' },
      ],
      metrics: ['Macro-F1 de prueba en banano', 'por modelo, float16', 'cultivos, un modelo cada uno'],
      alts: ['Resumen de HealthyCropping', 'Dataset de fotos de campo', 'Mapas Grad-CAM por clase'],
      note: '',
    },
    booth: {
      kicker: 'App web · Comercio',
      status: 'Demo en vivo',
      desc: 'Los pequeños negocios ya venden por WhatsApp, un chat a la vez. Booth le da a cada tienda un solo enlace con su catálogo y reúne pedidos, pagos e inventario en un solo lugar.',
      steps: [
        { t: 'Un enlace por tienda', d: 'Los clientes abren el enlace de la tienda, ven el catálogo y arman su carrito. Sin instalar nada y sin crear cuenta.' },
        { t: 'Pedidos, no chats', d: 'El carrito se convierte en un mensaje de WhatsApp limpio, el inventario se reserva de forma atómica y el dueño avanza cada pedido de pendiente a listo desde el panel.' },
        { t: 'Comprobantes revisados con IA', d: 'En las transferencias, Gemini lee el comprobante y le dice al dueño si el monto y el destinatario coinciden antes de confirmar el pago.' },
      ],
      metrics: ['tienda, cada una aislada', 'y cualquier moneda en unidades mínimas', 'pruebas end to end en móvil'],
      alts: ['Tienda de Booth', 'Resumen del pedido antes de enviarlo por WhatsApp', 'Verificación de comprobantes con IA'],
      note: '',
    },
    rag: {
      kicker: 'IA · Recuperación',
      status: 'Demo en vivo · medido en CI',
      desc: 'Subes PDFs y notas, preguntas en inglés o español y recibes respuestas que citan los pasajes exactos que usan. Cuando los documentos no tienen la respuesta, se niega en lugar de adivinar.',
      steps: [
        { t: 'Respuestas con pruebas', d: 'Cada respuesta cita pasajes numerados, y las citas a pasajes que el modelo nunca recibió se eliminan y se reportan.' },
        { t: 'Búsqueda híbrida y luego un filtro', d: 'pgvector y la búsqueda de texto completo de Postgres combinadas con Reciprocal Rank Fusion, un reranker opcional de Cohere y un umbral calibrado que detiene al modelo cuando la evidencia es débil.' },
        { t: 'Medido en cada pull request', d: 'Un benchmark de 82 preguntas en inglés y español corre en CI y rompe el build si la calidad de la búsqueda baja.' },
      ],
      metrics: ['Recall@5 con reranking', 'preguntas sin respuesta rechazadas', 'búsqueda en 50 mil fragmentos, antes 39 s'],
      alts: ['Una respuesta con citas numeradas', 'El motor negándose a responder', 'Resultados del benchmark'],
      note: 'Corre en planes gratuitos: la primera pregunta puede tardar cerca de un minuto mientras el servidor despierta.',
    },
  },
  stack: {
    title: 'Herramientas',
    sub: 'Lo que uso, agrupado por dónde vive.',
    tabs: { all: 'Todo', front: 'Frontend y móvil', back: 'Backend y datos', ai: 'IA y ML', cloud: 'Cloud y DevOps', quality: 'Calidad' },
  },
  certs: {
    title: 'Certificaciones',
    sub: 'Fundamentos de cloud e IA, verificados por quien los emite.',
    verify: 'Verificar',
    items: [
      { year: '2026', org: 'Oracle', logo: 'oracle', name: 'OCI Certified Architect Associate', meta: 'Emitida oct 2026 · Vence oct 2028', id: 'ID 103563028OCI26CAA' },
      { year: '2026', org: 'Oracle', logo: 'oracle', name: 'OCI Certified AI Foundations Associate', meta: 'Emitida oct 2026 · Vence oct 2028', id: 'ID 103563028OCI26AICFA' },
      { year: '2026', org: 'Google', logo: 'google', name: 'Google Cloud Computing Foundations', meta: 'Emitida oct 2026', id: 'Google Cloud · Big data' },
      { year: '2025', org: 'Amazon Web Services', logo: 'aws', name: 'Implementación avanzada de IA generativa en AWS', meta: 'Emitida sept 2025', id: 'IA generativa · Machine learning' },
    ],
  },
  activity: {
    title: 'Actividad',
    sub: 'Se actualiza desde GitHub todos los días.',
    alt1: 'Totales de contribuciones y rachas',
    alt2: 'Calendario de contribuciones del último año',
  },
  learning: {
    title: 'Lo que estoy aprendiendo',
    items: [
      { logo: 'aws', t: 'AWS', d: 'Arquitectura cloud. Empecé con IA generativa en AWS y voy a fondo con los servicios principales.' },
      { logo: 'databricks', t: 'Databricks', d: 'Ingeniería de datos a escala: Spark, Delta Lake y el modelo lakehouse.' },
      { logo: '', t: 'Ciberseguridad', d: 'Cómo se atacan los sistemas, de la red a la aplicación, para construir sistemas que resistan.' },
    ],
  },
  contact: {
    title: ['Construyamos', 'algo.'],
    sub: '¿Tienes un proyecto, un puesto o una pregunta sobre algo que construí? Escríbeme, me encantaría saberlo.',
    copy: 'Copiar',
    copied: 'Copiado',
  },
  footer: 'Diseñado y construido desde cero en Costa Rica.',
};

export const COPY = { en, es };
export type Copy = typeof en;
