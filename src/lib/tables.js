export const ALLOWED = new Set([
  'AMIGOS', 'amigos',
  'lideres', 'LIDERES',
  'coordinadores', 'COORDINADORES',
  'agenda',
  'gestiones',
  'derechos_peticion',
  'asistencia',
  'whatsapp_messages',
  'estructura_seguimiento',
  'alcaldia_seguimiento',
  'gestiones_trazabilidad'
]);

export function allowedTable(name) {
  return ALLOWED.has(String(name || ''));
}
