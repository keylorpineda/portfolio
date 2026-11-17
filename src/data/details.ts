// The specific, checkable details behind each project, taken from its repository's README
// and model card. Each project shows them in its own form, not in a shared card.
import type { Lang } from './content';

const en = {
  hc: {
    title: 'What it recognizes',
    sub: 'Three crops, one model each, twelve classes. Scores are on held-out test photos.',
    crops: [
      { name: 'Coffee', organ: 'Leaf, underside', acc: '81.1%', f1: '0.72', classes: ['Healthy', 'Leaf rust', 'Leaf miner', 'Cercospora', 'Brown leaf spot', 'Red spider mite'] },
      { name: 'Cacao', organ: 'Pod', acc: '91.7%', f1: '0.85', classes: ['Healthy', 'Frosty pod rot', 'Black pod'] },
      { name: 'Banana', organ: 'Leaf', acc: '97.5%', f1: '0.97', classes: ['Healthy', 'Black Sigatoka', 'Fusarium wilt'] },
    ],
    accLabel: 'accuracy',
    f1Label: 'macro-F1',
    honest:
      'Coffee is still under its 0.80 target: two of its classes have about twenty test leaves, so one leaf moves the score by several points. Every run, including the failed ones, is documented.',
    rule: 'When the model is not sure enough, it asks for a new photo instead of guessing.',
  },
  booth: {
    title: 'What the store receives',
    sub: 'The cart becomes this message, sent from the shopper’s own WhatsApp. Stock is already reserved.',
    chatName: 'La Esquina Bakery',
    chatTime: '9:41',
    message: [
      '*New order #PAN102* — La Esquina Bakery',
      'Customer: Diego Solís',
      '',
      '2 × Cinnamon and cardamom roll — CRC 4,200',
      '1 × Seeded multigrain bread — CRC 4,200',
      '',
      'Subtotal: CRC 8,400',
      '*Total: CRC 8,400*',
      '',
      'Pickup at the store',
      'Payment: SINPE Móvil',
      '',
      'Order tracking: booth-tawny.vercel.app/t/…',
    ],
    pathTitle: 'An order’s path',
    path: [
      { t: 'Catalog', d: 'The shopper opens the store link. No app, no account.' },
      { t: 'WhatsApp', d: 'The order is saved as pending and this message opens, with a private tracking link.' },
      { t: 'Receipt', d: 'For a transfer, the shopper uploads the receipt and Gemini checks amount and recipient.' },
      { t: 'Ready', d: 'The owner moves the order along and the shopper follows it live.' },
    ],
  },
  rag: {
    title: 'How much better each piece makes it',
    sub: 'Recall@5 on the benchmark: how often the right passage is among the five retrieved.',
    bars: [
      { label: 'Local embeddings, dense only', v: 0.38 },
      { label: 'Local, hybrid with full-text', v: 0.53 },
      { label: 'Cohere embeddings, hybrid', v: 0.73 },
      { label: 'Cohere, hybrid and reranked', v: 0.88 },
    ],
    gateTitle: 'The gate before the model',
    asks: [
      { q: 'How are coroutines declared, and what does await do?', score: '0.71', ok: true, verdict: 'Answered, citing PEP 492 [1][2]' },
      { q: 'What is the capital of Australia?', score: '0.31', ok: false, verdict: 'Refused before calling the model' },
    ],
    threshold: 'threshold',
    best: 'best match',
    facts: [
      { v: '91%', l: 'of answerable questions answered' },
      { v: '88%', l: 'of unanswerable ones refused' },
      { v: '10 ms', l: 'to search 50,000 chunks, down from 39 s' },
    ],
  },
};

const es: typeof en = {
  hc: {
    title: 'Qué reconoce',
    sub: 'Tres cultivos, un modelo para cada uno, doce clases. Las cifras son sobre fotos de prueba que el modelo nunca vio.',
    crops: [
      { name: 'Café', organ: 'Hoja, envés', acc: '81,1 %', f1: '0,72', classes: ['Sana', 'Roya', 'Minador', 'Cercospora', 'Mancha marrón', 'Arañita roja'] },
      { name: 'Cacao', organ: 'Mazorca', acc: '91,7 %', f1: '0,85', classes: ['Sana', 'Moniliasis', 'Mazorca negra'] },
      { name: 'Banano', organ: 'Hoja', acc: '97,5 %', f1: '0,97', classes: ['Sana', 'Sigatoka negra', 'Mal de Panamá'] },
    ],
    accLabel: 'exactitud',
    f1Label: 'macro-F1',
    honest:
      'El café todavía está bajo su meta de 0,80: dos de sus clases tienen unas veinte hojas de prueba, así que una sola hoja mueve la cifra varios puntos. Cada experimento, incluidos los fallidos, está documentado.',
    rule: 'Cuando el modelo no está lo bastante seguro, pide otra foto en lugar de adivinar.',
  },
  booth: {
    title: 'Lo que recibe la tienda',
    sub: 'El carrito se convierte en este mensaje, enviado desde el WhatsApp del cliente. El inventario ya quedó reservado.',
    chatName: 'Panadería La Esquina',
    chatTime: '9:41',
    message: [
      '*Nuevo pedido #PAN102* — Panadería La Esquina',
      'Cliente: Diego Solís',
      '',
      '2 × Rol de canela y cardamomo — ₡4 200',
      '1 × Pan multigrano con semillas — ₡4 200',
      '',
      'Subtotal: ₡8 400',
      '*Total: ₡8 400*',
      '',
      'Retiro en tienda',
      'Pago: SINPE Móvil',
      '',
      'Seguimiento del pedido: booth-tawny.vercel.app/t/…',
    ],
    pathTitle: 'El recorrido de un pedido',
    path: [
      { t: 'Catálogo', d: 'El cliente abre el enlace de la tienda. Sin app y sin cuenta.' },
      { t: 'WhatsApp', d: 'El pedido queda pendiente y se abre este mensaje, con un enlace privado de seguimiento.' },
      { t: 'Comprobante', d: 'En una transferencia, el cliente sube el comprobante y Gemini revisa monto y destinatario.' },
      { t: 'Listo', d: 'El dueño avanza el pedido y el cliente lo sigue en vivo.' },
    ],
  },
  rag: {
    title: 'Cuánto mejora cada pieza',
    sub: 'Recall@5 en el benchmark: con qué frecuencia el pasaje correcto está entre los cinco recuperados.',
    bars: [
      { label: 'Embeddings locales, solo denso', v: 0.38 },
      { label: 'Locales, híbrido con texto completo', v: 0.53 },
      { label: 'Embeddings de Cohere, híbrido', v: 0.73 },
      { label: 'Cohere, híbrido y con reranking', v: 0.88 },
    ],
    gateTitle: 'El filtro antes del modelo',
    asks: [
      { q: '¿Cómo se declaran las corrutinas y qué hace await?', score: '0,71', ok: true, verdict: 'Respondida, citando el PEP 492 [1][2]' },
      { q: '¿Cuál es la capital de Australia?', score: '0,31', ok: false, verdict: 'Rechazada antes de llamar al modelo' },
    ],
    threshold: 'umbral',
    best: 'mejor coincidencia',
    facts: [
      { v: '91 %', l: 'de las preguntas con respuesta, respondidas' },
      { v: '88 %', l: 'de las que no la tienen, rechazadas' },
      { v: '10 ms', l: 'para buscar en 50 000 fragmentos, antes 39 s' },
    ],
  },
};

export const DETAILS = { en, es } satisfies Record<Lang, typeof en>;
