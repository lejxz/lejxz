export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || "";

/**
 * Prepend the BASE_PATH to a local asset path.
 * If the path is already an external URL (http/https), return it as-is.
 */
export function asset(path: string): string {
  if (!path) return path;
  // External URLs — return as-is, don't prepend BASE_PATH.
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }
  return `${BASE_PATH}${path}`;
}
