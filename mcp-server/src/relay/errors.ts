export class RelayError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
    public readonly raw?: unknown
  ) {
    super(message);
    this.name = "RelayError";
  }
}

export function mapHttpError(status: number, body: unknown): RelayError {
  const raw = body;
  const bodyStr =
    typeof body === "string"
      ? body
      : body != null
        ? JSON.stringify(body)
        : "";

  if (status === 401) {
    return new RelayError(
      401,
      "auth_failed",
      "Invalid or expired x-api-key. Check FOUNDRY_API_KEY.",
      raw
    );
  }

  if (status === 403) {
    const scopeMatch = bodyStr.match(/lacks required scope:\s*(\S+)/i);
    const scope = scopeMatch ? scopeMatch[1] : "unknown";
    return new RelayError(
      403,
      "missing_scope",
      `API key is missing scope: ${scope}. Mint a new key that includes this scope at https://foundryvtt-rest-api-relay.fly.dev`,
      raw
    );
  }

  if (status === 400) {
    const clientIdHint = bodyStr.includes("clientId")
      ? " Set FOUNDRY_CLIENT_ID or ensure exactly one world is online."
      : "";
    return new RelayError(
      400,
      "bad_request",
      `Bad request.${clientIdHint} Details: ${bodyStr}`,
      raw
    );
  }

  if (status === 404) {
    const clientIdHint =
      bodyStr.includes("client") || bodyStr.includes("world")
        ? " No Foundry world is connected. Set FOUNDRY_CLIENT_ID and ensure the world is online."
        : "";
    return new RelayError(
      404,
      "not_found",
      `Not found.${clientIdHint} Details: ${bodyStr}`,
      raw
    );
  }

  if (status === 429) {
    return new RelayError(
      429,
      "rate_limited",
      "Rate or quota limit exceeded. Upgrade your relay plan or wait before retrying.",
      raw
    );
  }

  return new RelayError(
    status,
    "relay_error",
    `Relay returned HTTP ${status}: ${bodyStr}`,
    raw
  );
}

/** A request that aborted because it exceeded its timeout. */
export function timeoutError(timeoutMs: number): RelayError {
  return new RelayError(
    0,
    "timeout",
    `Request timed out after ${timeoutMs}ms. The relay or Foundry world may be unreachable or slow — check that the world is online.`
  );
}

/** A transport-level failure (DNS, connection refused, TLS, etc.). */
export function networkError(cause: unknown): RelayError {
  const detail = cause instanceof Error ? cause.message : String(cause);
  return new RelayError(
    0,
    "network_error",
    `Could not reach the relay: ${detail}. Check FOUNDRY_RELAY_URL and your network connection.`,
    cause
  );
}
