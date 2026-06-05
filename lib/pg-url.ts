/**
 * Resolve a direct TCP Postgres connection string for the pg driver adapter.
 *
 * The local `prisma dev` server speaks a direct TCP protocol, not the Accelerate
 * HTTP protocol. The DATABASE_URL in .env is a `prisma+postgres://` proxy URL
 * whose (non-secret, for local) `api_key` embeds the real TCP connection string.
 * This extracts it. A plain `postgres://`/`postgresql://` URL is returned as-is.
 */
export function resolveDirectDatabaseUrl(
  raw: string | undefined = process.env.DATABASE_URL,
): string {
  if (!raw) throw new Error("DATABASE_URL is not set");
  if (!raw.startsWith("prisma+postgres:")) return raw;

  const apiKey = new URL(raw).searchParams.get("api_key");
  if (!apiKey) throw new Error("prisma+postgres:// URL is missing its api_key");

  // The local api_key is a base64(url) JSON blob; a remote one is a JWT — handle both.
  const segment = apiKey.includes(".") ? apiKey.split(".")[1] : apiKey;
  const json = Buffer.from(segment, "base64").toString("utf8");
  const payload = JSON.parse(json) as { databaseUrl?: string };
  if (!payload.databaseUrl) {
    throw new Error("Could not extract databaseUrl from the prisma+postgres api_key");
  }
  return payload.databaseUrl;
}
