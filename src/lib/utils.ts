/**
 * Memastikan callbackUrl aman untuk dipakai redirect.
 * Menolak URL eksternal (mencegah open redirect attack),
 * hanya izinkan path relatif internal yang diawali "/".
 */
export function isSafeCallbackUrl(
  url: string | null | undefined
): url is string {
  if (!url) return false

  // Harus path relatif, bukan URL absolut / eksternal
  if (!url.startsWith("/")) return false

  // Tolak "//evil.com" (protocol-relative URL)
  if (url.startsWith("//")) return false

  // Tolak URL yang menyelipkan skema di tengah, mis. "/redirect?url=http://evil.com"
  if (url.includes("://")) return false

  return true
}