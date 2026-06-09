// Safe URL helpers — ensure user-provided URLs cannot become javascript: / data: XSS vectors.
export function isSafeHttpUrl(value: string | null | undefined): boolean {
  if (!value) return false;
  try {
    const u = new URL(value.trim());
    return u.protocol === "https:" || u.protocol === "http:";
  } catch {
    return false;
  }
}

export function safeHref(value: string | null | undefined): string | undefined {
  return isSafeHttpUrl(value) ? value!.trim() : undefined;
}
