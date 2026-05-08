/**
 * Helper para leer variables de entorno requeridas con narrowing seguro.
 * Lanza si la variable no existe o está vacía.
 *
 * Uso:
 *   const url = requireEnv('NEXT_PUBLIC_SUPABASE_URL');
 *   // url es `string`, no `string | undefined`
 */
export function requireEnv(key: string): string {
  const value = process.env[key];
  if (value === undefined || value.length === 0) {
    throw new Error(`Variable de entorno requerida pero no definida: ${key}`);
  }
  return value;
}
