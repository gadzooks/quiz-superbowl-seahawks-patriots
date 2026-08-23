export function parseCookies(header: string | null): Record<string, string> {
  const cookies: Record<string, string> = {};
  if (!header) return cookies;
  for (const part of header.split(';')) {
    const eq = part.indexOf('=');
    if (eq === -1) continue;
    const key = part.slice(0, eq).trim();
    const value = part.slice(eq + 1).trim();
    if (key) cookies[key] = decodeURIComponent(value);
  }
  return cookies;
}

// Short-lived, httpOnly cookies used only to carry OAuth state/returnTo
// across the redirect to Yahoo and back — never read by client JS.
export function serializeCookie(
  name: string,
  value: string,
  options: { maxAge?: number; clear?: boolean } = {}
): string {
  const maxAge = options.clear ? 0 : (options.maxAge ?? 600);
  return [
    `${name}=${encodeURIComponent(value)}`,
    'Path=/',
    'HttpOnly',
    'Secure',
    'SameSite=Lax',
    `Max-Age=${maxAge}`,
  ].join('; ');
}
