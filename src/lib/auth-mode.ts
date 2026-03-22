/**
 * Login solo si AUTH_REQUIRED=1 (o true). Sin variable: panel abierto (modo provisional).
 */
export function isAuthRequired(): boolean {
  const v = process.env.AUTH_REQUIRED?.trim().toLowerCase();
  return v === "1" || v === "true" || v === "yes";
}
