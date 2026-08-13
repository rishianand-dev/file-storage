type DispositionType = "inline" | "attachment";

/**
 * RFC 5987 Content-Disposition.
 * ASCII `filename` for legacy clients; `filename*` for UTF-8 original names.
 */
export function contentDisposition(
  filename: string,
  type: DispositionType,
): string {
  const ascii = filename.replace(/["\\\r\n]/g, "_").replace(/[^\x20-\x7E]/g, "_");
  return `${type}; filename="${ascii}"; filename*=UTF-8''${encodeURIComponent(filename)}`;
}

export function attachmentDisposition(filename: string): string {
  return contentDisposition(filename, "attachment");
}

export function inlineDisposition(filename: string): string {
  return contentDisposition(filename, "inline");
}
