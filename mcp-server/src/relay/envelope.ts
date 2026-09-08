/**
 * Unwrap the relay's `{ type, requestId, ...payload }` envelope.
 *
 * The payload key is not consistent across operations, so we unwrap
 * predictably and *losslessly*:
 *   1. Bare objects (no `type`/`requestId`) — e.g. `/clients`, session
 *      endpoints — are returned as-is.
 *   2. Otherwise strip `type`/`requestId`. If `data` or `results` is present,
 *      return that payload (covers /get, /create-folder, /search, /kill, …).
 *   3. If exactly one key remains, unwrap to its value.
 *   4. Otherwise return the remaining object — this is what preserves both
 *      `uuid` AND `entity` on /create and /update instead of dropping one.
 */
const PRIORITY_KEYS = ["data", "results"] as const;

export function unwrapEnvelope(raw: unknown): unknown {
  if (raw == null || typeof raw !== "object") return raw;
  const obj = raw as Record<string, unknown>;

  // Bare objects (no envelope metadata) — /clients, session shapes
  if (!("type" in obj) && !("requestId" in obj)) return obj;

  const { type: _t, requestId: _r, ...rest } = obj;

  for (const key of PRIORITY_KEYS) {
    if (key in rest) return rest[key];
  }

  const keys = Object.keys(rest);
  if (keys.length === 1) return rest[keys[0]];

  return rest;
}
