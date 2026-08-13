/**
 * RFC 5987 Content-Disposition for downloads.
 * ASCII `filename` for legacy clients; `filename*` for UTF-8 original names.
 */
export function attachmentDisposition(filename: string): string {
  const ascii = filename.replace(/["\\\r\n]/g, "_").replace(/[^\x20-\x7E]/g, "_");
  return `attachment; filename="${ascii}"; filename*=UTF-8''${encodeURIComponent(filename)}`;
}
