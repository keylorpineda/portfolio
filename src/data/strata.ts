// The cross-section of each project: the same four layers every time, filled with what each repo really has.
// Endpoints, tables, columns and models come from the source; the rows are sample data in the real shape.
import type { Lang } from './content';

export type Api = { method: string; path: string; status: string; time: string; body: string[] };
export type Table = { engine: string; name: string; cols: string[]; rows: string[][]; index: string };
export type Model = { steps: { name: string; detail: string }[] };

export type Layer =
  | { kind: 'ui'; label: string; tech: string; line: string }
  | ({ kind: 'api'; label: string; tech: string; line: string } & Api)
  | ({ kind: 'data'; label: string; tech: string; line: string } & Table)
  | ({ kind: 'model'; label: string; tech: string; line: string } & Model);

type Copy = { kicker: string; title: string; hint: string; layers: Record<string, Layer[]> };

const hcApi: Api = {
  method: 'POST',
  path: '/scans/sync',
  status: '200',
  time: '142 ms',
  body: ['{', '  "synced": 3,', '  "conflicts": 0,', '  "server_time": "2026-11-14T15:02:11Z"', '}'],
};
const hcTable: Table = {
  engine: 'SQLite',
  name: 'scans',
  cols: ['crop', 'predicted_class', 'confidence', 'sync_status'],
  rows: [
    ['coffee', 'rust', '0.94', 'pending'],
    ['cacao', 'black_pod', '0.88', 'synced'],
    ['banana', 'healthy', '0.97', 'synced'],
  ],
  index: 'idx_scans_sync_status',
};
const hcModel = (es: boolean): Model => ({
  steps: [
    { name: '224 × 224', detail: es ? 'foto recortada' : 'cropped photo' },
    { name: 'MobileNetV3-Large', detail: es ? 'un modelo por cultivo' : 'one model per crop' },
    { name: 'TFLite fp16', detail: es ? 'corre en el teléfono' : 'runs on the phone' },
    { name: es ? 'umbral calibrado' : 'calibrated threshold', detail: es ? 'si duda, lo dice' : 'flags low confidence' },
  ],
});

const boothApi: Api = {
  method: 'POST',
  path: '/public/stores/:slug/orders',
  status: '201',
  time: '88 ms',
  body: ['{', '  "code": "PAN102",', '  "status": "PENDING",', '  "paymentStatus": "UNPAID",', '  "totalMinor": 845000', '}'],
};
const boothTable: Table = {
  engine: 'PostgreSQL · Prisma',
  name: 'Order',
  cols: ['code', 'status', 'paymentStatus', 'totalMinor'],
  rows: [
    ['PAN102', 'PENDING', 'UNPAID', '845000'],
    ['PAN101', 'CONFIRMED', 'PAID', '1260000'],
    ['PAN100', 'COMPLETED', 'PAID', '415000'],
  ],
  index: '@@index([storeId, status, createdAt])',
};
const boothModel = (es: boolean): Model => ({
  steps: [
    { name: es ? 'comprobante' : 'payment receipt', detail: es ? 'foto que sube el cliente' : 'photo the buyer uploads' },
    { name: 'Gemini 2.0 Flash', detail: es ? 'lee monto y referencia' : 'reads amount and reference' },
    { name: 'ReceiptVerification', detail: es ? 'compara con el pedido' : 'checked against the order' },
    { name: es ? 'la tienda decide' : 'the store decides', detail: es ? 'la IA solo sugiere' : 'the model only suggests' },
  ],
});

const ragApi: Api = {
  method: 'POST',
  path: '/query',
  status: '200',
  time: '1.9 s',
  body: ['{', '  "answer": "… [2]",', '  "citations": [{ "doc": 4, "page": 12 }],', '  "abstained": false,', '  "best_score": 0.71', '}'],
};
const ragTable: Table = {
  engine: 'PostgreSQL · pgvector',
  name: 'doc_chunks',
  cols: ['document_id', 'page', 'embedding', 'tsv'],
  rows: [
    ['4', '12', '[0.018, −0.204, …]', "'cost':3 'pump':7"],
    ['4', '13', '[−0.091, 0.117, …]', "'heat':2 'loss':5"],
    ['7', '2', '[0.233, 0.046, …]', "'valve':4"],
  ],
  index: 'hnsw (m=16, ef_construction=64)',
};
const ragModel = (es: boolean): Model => ({
  steps: [
    { name: es ? 'híbrida' : 'hybrid search', detail: es ? 'vectores + texto completo' : 'vectors + full text' },
    { name: 'rerank-v3.5', detail: es ? 'reordena 30 candidatos' : 'reorders 30 candidates' },
    { name: es ? 'umbral 0,55' : 'gate at 0.55', detail: es ? 'si no alcanza, se niega' : 'below it, it refuses' },
    { name: 'gpt-oss-120b · Groq', detail: es ? 'responde citando' : 'answers with citations' },
  ],
});

export const STRATA: Record<Lang, Copy> = {
  en: {
    kicker: 'Cross-section',
    title: 'What sits under the screen',
    hint: 'Scroll to take it apart',
    layers: {
      hc: [
        { kind: 'ui', label: 'Interface', tech: 'React Native · Expo', line: 'A photo, a diagnosis, and what to do next. Works with no signal.' },
        { kind: 'api', label: 'API', tech: 'FastAPI · Firebase Auth', line: 'When signal comes back, pending scans sync in one request.', ...hcApi },
        { kind: 'data', label: 'Data', tech: 'SQLite on the phone', line: 'Every scan is saved locally first, with its sync status.', ...hcTable },
        { kind: 'model', label: 'Model', tech: 'TensorFlow Lite', line: 'Diagnosis happens on the device, not on a server.', ...hcModel(false) },
      ],
      booth: [
        { kind: 'ui', label: 'Interface', tech: 'React · Vite · Tailwind', line: 'One link per store: catalog, cart and checkout.' },
        { kind: 'api', label: 'API', tech: 'NestJS', line: 'The order is created, priced on the server and given a short code.', ...boothApi },
        { kind: 'data', label: 'Data', tech: 'PostgreSQL · Prisma', line: 'Totals are stored in minor units, with a snapshot of the order.', ...boothTable },
        { kind: 'model', label: 'Model', tech: 'Gemini', line: 'A receipt photo is read and matched to the order it pays.', ...boothModel(false) },
      ],
      rag: [
        { kind: 'ui', label: 'Interface', tech: 'Angular', line: 'Ask in English or Spanish; every claim links to its passage.' },
        { kind: 'api', label: 'API', tech: 'FastAPI', line: 'One endpoint returns the answer, its sources, and whether it refused.', ...ragApi },
        { kind: 'data', label: 'Data', tech: 'pgvector · SQLAlchemy', line: 'Each chunk keeps a vector for meaning and a tsvector for exact words.', ...ragTable },
        { kind: 'model', label: 'Model', tech: 'Cohere · Groq', line: 'Search, rerank, check the score, and only then write.', ...ragModel(false) },
      ],
    },
  },
  es: {
    kicker: 'Corte transversal',
    title: 'Lo que hay debajo de la pantalla',
    hint: 'Haz scroll para desarmarlo',
    layers: {
      hc: [
        { kind: 'ui', label: 'Interfaz', tech: 'React Native · Expo', line: 'Una foto, un diagnóstico y qué hacer después. Funciona sin señal.' },
        { kind: 'api', label: 'API', tech: 'FastAPI · Firebase Auth', line: 'Cuando vuelve la señal, los escaneos pendientes se sincronizan en una sola petición.', ...hcApi },
        { kind: 'data', label: 'Datos', tech: 'SQLite en el teléfono', line: 'Cada escaneo se guarda primero en el teléfono, con su estado de sincronización.', ...hcTable },
        { kind: 'model', label: 'Modelo', tech: 'TensorFlow Lite', line: 'El diagnóstico ocurre en el dispositivo, no en un servidor.', ...hcModel(true) },
      ],
      booth: [
        { kind: 'ui', label: 'Interfaz', tech: 'React · Vite · Tailwind', line: 'Un enlace por tienda: catálogo, carrito y pago.' },
        { kind: 'api', label: 'API', tech: 'NestJS', line: 'El pedido se crea, se calcula en el servidor y recibe un código corto.', ...boothApi },
        { kind: 'data', label: 'Datos', tech: 'PostgreSQL · Prisma', line: 'Los montos se guardan en céntimos, con una copia fija del pedido.', ...boothTable },
        { kind: 'model', label: 'Modelo', tech: 'Gemini', line: 'La foto del comprobante se lee y se compara con el pedido que paga.', ...boothModel(true) },
      ],
      rag: [
        { kind: 'ui', label: 'Interfaz', tech: 'Angular', line: 'Pregunta en inglés o español; cada afirmación enlaza a su pasaje.' },
        { kind: 'api', label: 'API', tech: 'FastAPI', line: 'Un endpoint devuelve la respuesta, sus fuentes y si se negó.', ...ragApi },
        { kind: 'data', label: 'Datos', tech: 'pgvector · SQLAlchemy', line: 'Cada fragmento guarda un vector para el significado y un tsvector para las palabras exactas.', ...ragTable },
        { kind: 'model', label: 'Modelo', tech: 'Cohere · Groq', line: 'Busca, reordena, revisa el puntaje y solo entonces escribe.', ...ragModel(true) },
      ],
    },
  },
};
