const allowedOriginMatchers = [
  '*',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  /\.lovable\.app$/,
  /\.manus\.ai$/,
];

function isOriginAllowed(origin: string | null): boolean {
  if (!origin) return false;
  return allowedOriginMatchers.some((matcher) => {
    if (matcher === '*') return true;
    if (typeof matcher === 'string') {
      return matcher === origin;
    }
    return matcher.test(origin);
  });
}

export function buildCorsHeaders(origin?: string | null): Record<string, string> {
  const normalizedOrigin = origin && isOriginAllowed(origin) ? origin : '*';

  return {
    'Access-Control-Allow-Origin': normalizedOrigin,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
    'Access-Control-Max-Age': '86400',
    'Vary': 'Origin',
  };
}

export function handleCors(request: Request, headers: Record<string, string>): Response | null {
  if (request.method === 'OPTIONS') {
    return new Response('ok', { headers });
  }

  return null;
}
