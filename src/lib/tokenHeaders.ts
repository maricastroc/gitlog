// The GitHub token travels to our own API routes in this header instead of the
// query string, so it never lands in URLs, server access logs, or browser history.
export const GITHUB_TOKEN_HEADER = "x-github-token";

// Client-side: build the request headers carrying the token (empty when absent).
export function tokenHeaders(token?: string): Record<string, string> {
  return token ? { [GITHUB_TOKEN_HEADER]: token } : {};
}

// Server-side: read the token back from an incoming request header.
export function readTokenHeader(value: string | string[] | undefined): string | undefined {
  const token = Array.isArray(value) ? value[0] : value;
  return token || undefined;
}
