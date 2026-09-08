import { describe, it, expect, vi, beforeEach } from "vitest";
import { makeCallRelay } from "../src/relay/client.js";
import { unwrapEnvelope } from "../src/relay/envelope.js";
import { mapHttpError, timeoutError, networkError } from "../src/relay/errors.js";
import type { Config } from "../src/config.js";

const config: Config = {
  apiKey: "test-key",
  relayUrl: "https://foundryrestapi.com",
  clientId: "fvtt_test",
  userId: undefined,
};

// ── envelope ──────────────────────────────────────────────────────────────────
describe("unwrapEnvelope", () => {
  it("returns clients payload as-is for /clients shape (no envelope metadata)", () => {
    const raw = { clients: [{ clientId: "fvtt_1" }], total: 1 };
    expect(unwrapEnvelope(raw)).toBe(raw);
  });

  it("returns the data payload for /get", () => {
    const raw = {
      type: "get-result",
      requestId: "x",
      uuid: "Actor.abc",
      data: { name: "Goblin" },
    };
    expect(unwrapEnvelope(raw)).toEqual({ name: "Goblin" });
  });

  it("returns the data payload for /create-folder", () => {
    const raw = {
      type: "create-folder-result",
      requestId: "x",
      data: { id: "1", uuid: "Folder.1", name: "NPCs" },
    };
    expect(unwrapEnvelope(raw)).toEqual({ id: "1", uuid: "Folder.1", name: "NPCs" });
  });

  it("returns the results array for /search", () => {
    const raw = {
      type: "search-result",
      requestId: "x",
      filter: "Actor",
      results: [{ uuid: "Actor.1", name: "Goblin" }],
    };
    expect(unwrapEnvelope(raw)).toEqual([{ uuid: "Actor.1", name: "Goblin" }]);
  });

  it("preserves BOTH uuid and entity for /create (no longer lossy)", () => {
    const raw = {
      type: "create-result",
      requestId: "x",
      uuid: "Actor.new",
      entity: { _id: "new", name: "Created" },
    };
    expect(unwrapEnvelope(raw)).toEqual({
      uuid: "Actor.new",
      entity: { _id: "new", name: "Created" },
    });
  });

  it("preserves uuid and entity[] for /update", () => {
    const raw = {
      type: "update-result",
      requestId: "x",
      uuid: "Actor.1",
      entity: [{ name: "Renamed" }],
    };
    expect(unwrapEnvelope(raw)).toEqual({
      uuid: "Actor.1",
      entity: [{ name: "Renamed" }],
    });
  });

  it("unwraps a single remaining key (e.g. /kill results)", () => {
    const raw = { type: "kill-result", requestId: "x", results: [{ hp: 0 }] };
    expect(unwrapEnvelope(raw)).toEqual([{ hp: 0 }]);
  });

  it("handles bare session objects (no type/requestId)", () => {
    const raw = { sessionId: "abc", status: "active" };
    expect(unwrapEnvelope(raw)).toBe(raw);
  });
});

// ── errors ────────────────────────────────────────────────────────────────────
describe("mapHttpError", () => {
  it("maps 401 to auth message", () => {
    const err = mapHttpError(401, "unauthorized");
    expect(err.status).toBe(401);
    expect(err.message).toContain("x-api-key");
  });

  it("maps 403 with scope to actionable message", () => {
    const err = mapHttpError(
      403,
      "API key lacks required scope: entity:write"
    );
    expect(err.message).toContain("entity:write");
    expect(err.message).toContain("scope");
  });

  it("maps 403 without scope string", () => {
    const err = mapHttpError(403, "forbidden");
    expect(err.status).toBe(403);
    expect(err.code).toBe("missing_scope");
  });

  it("maps 400 with clientId hint", () => {
    const err = mapHttpError(400, "ambiguous clientId");
    expect(err.message).toContain("clientId");
  });

  it("maps 404 with client hint", () => {
    const err = mapHttpError(404, "no client connected");
    expect(err.message).toContain("world");
  });

  it("maps 429 to rate limit", () => {
    const err = mapHttpError(429, "too many requests");
    expect(err.message).toContain("limit");
  });
});

// ── callRelay ─────────────────────────────────────────────────────────────────
describe("callRelay", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  function mockFetch(status: number, data: unknown) {
    const body = JSON.stringify(data);
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: status >= 200 && status < 300,
        status,
        headers: { get: () => "application/json" },
        json: async () => data,
        text: async () => body,
      })
    );
  }

  it("sends x-api-key header", async () => {
    mockFetch(200, { type: "x", requestId: "y", data: {} });
    const callRelay = makeCallRelay(config);
    await callRelay("GET", "/get", { query: { uuid: "Actor.1" } });

    const [url, init] = (fetch as ReturnType<typeof vi.fn>).mock.calls[0] as [
      string,
      RequestInit,
    ];
    expect((init.headers as Record<string, string>)["x-api-key"]).toBe(
      "test-key"
    );
  });

  it("puts clientId in query string not body", async () => {
    mockFetch(200, { clients: [], total: 0 });
    const callRelay = makeCallRelay(config);
    await callRelay("GET", "/clients");

    const [url] = (fetch as ReturnType<typeof vi.fn>).mock.calls[0] as [
      string,
    ];
    expect(url).toContain("clientId=fvtt_test");
  });

  it("serializes body as JSON for POST", async () => {
    mockFetch(201, { type: "create-result", requestId: "y", uuid: "Actor.x" });
    const callRelay = makeCallRelay(config);
    await callRelay("POST", "/create", {
      body: { entityType: "Actor", data: { name: "Test" } },
    });

    const [, init] = (fetch as ReturnType<typeof vi.fn>).mock.calls[0] as [
      string,
      RequestInit,
    ];
    expect(init.body).toBe(
      JSON.stringify({ entityType: "Actor", data: { name: "Test" } })
    );
    expect(
      (init.headers as Record<string, string>)["Content-Type"]
    ).toContain("application/json");
  });

  it("unwraps envelope data key on success", async () => {
    mockFetch(200, {
      type: "get-result",
      requestId: "y",
      uuid: "Actor.1",
      data: { name: "Goblin" },
    });
    const callRelay = makeCallRelay(config);
    const result = await callRelay("GET", "/get", {
      query: { uuid: "Actor.1" },
    });
    expect(result).toEqual({ name: "Goblin" });
  });

  it("throws RelayError on 401", async () => {
    mockFetch(401, "unauthorized");
    const callRelay = makeCallRelay(config);
    await expect(callRelay("GET", "/get")).rejects.toMatchObject({
      status: 401,
    });
  });

  it("throws RelayError on success:false body", async () => {
    mockFetch(200, { success: false, message: "entity not found" });
    const callRelay = makeCallRelay(config);
    await expect(callRelay("GET", "/get")).rejects.toMatchObject({
      code: "success_false",
    });
  });

  it("converts a transport failure into a RelayError (not a raw throw)", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockRejectedValue(new TypeError("fetch failed: ECONNREFUSED"))
    );
    const callRelay = makeCallRelay(config);
    await expect(callRelay("GET", "/clients")).rejects.toMatchObject({
      name: "RelayError",
      code: "network_error",
    });
  });
});

// ── error constructors ────────────────────────────────────────────────────────
describe("error constructors", () => {
  it("timeoutError reports the timeout duration", () => {
    const err = timeoutError(30_000);
    expect(err.code).toBe("timeout");
    expect(err.message).toContain("30000ms");
  });

  it("networkError includes the underlying cause", () => {
    const err = networkError(new Error("ECONNREFUSED"));
    expect(err.code).toBe("network_error");
    expect(err.message).toContain("ECONNREFUSED");
  });
});
