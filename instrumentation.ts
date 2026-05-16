/**
 * Next.js instrumentation — corre una sola vez al boot de cada Node runtime
 * (Server Components, Server Actions, Route Handlers, Middleware en Fluid Compute).
 *
 * Forzamos IPv4-first en resolución DNS para evitar que Node intente conectar
 * por IPv6 a reha.antoniotembleque.com desde Vercel iad1 y se cuelgue.
 * Cloudflare devuelve AAAA records (IPv6) y A records (IPv4); por default Node
 * desde v17 usa 'verbatim' que prioriza IPv6 cuando viene primero en la respuesta
 * DNS — pero el tunnel/edge no responde por IPv6 desde Vercel y la conexión
 * timeout silencioso → causa MIDDLEWARE_INVOCATION_TIMEOUT y "This page couldn't load".
 *
 * Esto solo afecta DNS resolution del runtime Node, no afecta a clientes browser.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const dns = await import('node:dns');
    dns.setDefaultResultOrder('ipv4first');
  }
}
