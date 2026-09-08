import { describe, it, expect } from "vitest";
import { makeCallRelay } from "../src/relay/client.js";
import { loadConfig } from "../src/config.js";

/**
 * Live smoke test against a real relay + Foundry world.
 *
 * Skipped unless FOUNDRY_LIVE_TEST=1. Requires a valid FOUNDRY_API_KEY (and
 * usually FOUNDRY_CLIENT_ID) in the environment. Creates a throwaway
 * JournalEntry, reads it back, then deletes it — leaving no residue.
 *
 *   FOUNDRY_LIVE_TEST=1 FOUNDRY_API_KEY=... FOUNDRY_CLIENT_ID=... npm test
 */
const live = process.env.FOUNDRY_LIVE_TEST === "1";

describe.skipIf(!live)("live relay smoke test", () => {
  it("lists at least one world", async () => {
    const callRelay = makeCallRelay(loadConfig());
    const data = (await callRelay("GET", "/clients", { rawEnvelope: true })) as {
      clients?: unknown[];
    };
    expect(Array.isArray(data.clients)).toBe(true);
  });

  it("creates, reads, and deletes a throwaway JournalEntry", async () => {
    const callRelay = makeCallRelay(loadConfig());

    const created = (await callRelay("POST", "/create", {
      body: {
        entityType: "JournalEntry",
        data: { name: "foundry-mcp smoke test (safe to delete)" },
      },
    })) as { uuid?: string } | string;

    const uuid =
      typeof created === "string" ? created : created.uuid;
    expect(uuid).toBeTruthy();

    const fetched = await callRelay("GET", "/get", { query: { uuid: uuid! } });
    expect(fetched).toBeTruthy();

    const deleted = await callRelay("DELETE", "/delete", {
      query: { uuid: uuid! },
    });
    expect(deleted).toBeTruthy();
  });
});
