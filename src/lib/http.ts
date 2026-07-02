/**
 * Origem pública da aplicação. Prefere os cabeçalhos de proxy
 * (`x-forwarded-host`/`x-forwarded-proto`) para funcionar atrás de proxies,
 * túneis e previews — onde `request.url` pode conter um host interno.
 */
export function resolveOrigin(request: Request): string {
  const h = request.headers;
  const host = h.get('x-forwarded-host') ?? h.get('host');
  if (!host) return new URL(request.url).origin;
  const proto = h.get('x-forwarded-proto') ?? new URL(request.url).protocol.replace(':', '');
  return `${proto}://${host}`;
}
