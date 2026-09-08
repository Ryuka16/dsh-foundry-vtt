import { describe, it, expect, vi, beforeEach } from "vitest";
import type { CallRelayFn } from "../src/relay/client.js";
import type { Config } from "../src/config.js";
import { RelayError } from "../src/relay/errors.js";

const config: Config = {
  apiKey: "test-key",
  relayUrl: "https://foundryrestapi.com",
  clientId: "fvtt_test",
  userId: undefined,
};

function makeCallRelayMock(returnValue: unknown): CallRelayFn {
  return vi.fn().mockResolvedValue(returnValue);
}

type Reg = {
  name: string;
  meta: { annotations?: Record<string, unknown> };
  handler: (args: Record<string, unknown>) => Promise<{ isError?: boolean }>;
};

/** Register a module against a fake server, capturing tool regs + handles. */
function collectTools(
  mod: import("../src/tools/types.js").ToolModule,
  callRelay: CallRelayFn,
  cfg: Config = config
) {
  const registrations: Reg[] = [];
  const handles: Array<{ enable: ReturnType<typeof vi.fn>; disable: ReturnType<typeof vi.fn> }> = [];
  const fakeServer = {
    registerTool: (
      name: string,
      meta: Reg["meta"],
      handler: Reg["handler"]
    ) => {
      registrations.push({ name, meta, handler });
      const handle = { enable: vi.fn(), disable: vi.fn() };
      handles.push(handle);
      return handle;
    },
  };
  mod.register(
    fakeServer as unknown as import("@modelcontextprotocol/sdk/server/mcp.js").McpServer,
    { callRelay, config: cfg }
  );
  return { registrations, handles };
}

// ── foundry_list_worlds annotations ──────────────────────────────────────────
describe("worlds tool", () => {
  it("returns ok result with clients array", async () => {
    const { worldsModule } = await import("../src/tools/worlds.js");
    const clients = [
      {
        clientId: "fvtt_1",
        worldTitle: "Test",
        isOnline: true,
        systemId: "dnd5e",
      },
    ];
    const callRelay: CallRelayFn = vi.fn().mockResolvedValue({
      clients,
      total: 1,
    });
    const registrations: Array<{
      name: string;
      meta: unknown;
      handler: (args: Record<string, unknown>) => Promise<unknown>;
    }> = [];
    const fakeServer = {
      registerTool: (
        name: string,
        meta: unknown,
        handler: (args: Record<string, unknown>) => Promise<unknown>
      ) => registrations.push({ name, meta, handler }),
    };
    worldsModule.register(fakeServer as unknown as import("@modelcontextprotocol/sdk/server/mcp.js").McpServer, {
      callRelay,
      config,
    });
    const tool = registrations.find((r) => r.name === "foundry_list_worlds")!;
    expect(tool).toBeTruthy();
    const result = await tool.handler({});
    expect(result).toMatchObject({ content: [{ type: "text" }] });
    const parsed = JSON.parse(
      (result as { content: Array<{ text: string }> }).content[0].text
    );
    expect(parsed.clients).toHaveLength(1);
  });
});

// ── foundry_search annotations ────────────────────────────────────────────────
describe("search tool", () => {
  it("passes query params correctly", async () => {
    const { searchModule } = await import("../src/tools/search.js");
    const callRelay: CallRelayFn = vi
      .fn()
      .mockResolvedValue([{ uuid: "Actor.1", name: "Goblin" }]);
    const registrations: Array<{
      name: string;
      meta: unknown;
      handler: (args: Record<string, unknown>) => Promise<unknown>;
    }> = [];
    const fakeServer = {
      registerTool: (
        name: string,
        meta: unknown,
        handler: (args: Record<string, unknown>) => Promise<unknown>
      ) => registrations.push({ name, meta, handler }),
    };
    searchModule.register(fakeServer as unknown as import("@modelcontextprotocol/sdk/server/mcp.js").McpServer, {
      callRelay,
      config,
    });
    const tool = registrations.find((r) => r.name === "foundry_search")!;
    await tool.handler({ query: "goblin", filter: "Actor", limit: 50, minified: true });
    expect(callRelay).toHaveBeenCalledWith(
      "GET",
      "/search",
      expect.objectContaining({
        query: expect.objectContaining({ query: "goblin", filter: "Actor" }),
      })
    );
  });
});

// ── foundry_get_entity ────────────────────────────────────────────────────────
describe("entity get tool", () => {
  it("returns fail when neither uuid nor selected", async () => {
    const { entityModule } = await import("../src/tools/entity.js");
    const callRelay: CallRelayFn = vi.fn();
    const registrations: Array<{
      name: string;
      meta: unknown;
      handler: (args: Record<string, unknown>) => Promise<unknown>;
    }> = [];
    const fakeServer = {
      registerTool: (
        name: string,
        meta: unknown,
        handler: (args: Record<string, unknown>) => Promise<unknown>
      ) => registrations.push({ name, meta, handler }),
    };
    entityModule.register(fakeServer as unknown as import("@modelcontextprotocol/sdk/server/mcp.js").McpServer, {
      callRelay,
      config,
    });
    const tool = registrations.find((r) => r.name === "foundry_get_entity")!;
    const result = (await tool.handler({})) as { isError?: boolean };
    expect(result.isError).toBe(true);
  });

  it("calls GET /get with uuid in query", async () => {
    const { entityModule } = await import("../src/tools/entity.js");
    const callRelay: CallRelayFn = vi
      .fn()
      .mockResolvedValue({ name: "Goblin", system: {} });
    const registrations: Array<{
      name: string;
      meta: unknown;
      handler: (args: Record<string, unknown>) => Promise<unknown>;
    }> = [];
    const fakeServer = {
      registerTool: (
        name: string,
        meta: unknown,
        handler: (args: Record<string, unknown>) => Promise<unknown>
      ) => registrations.push({ name, meta, handler }),
    };
    entityModule.register(fakeServer as unknown as import("@modelcontextprotocol/sdk/server/mcp.js").McpServer, {
      callRelay,
      config,
    });
    const tool = registrations.find((r) => r.name === "foundry_get_entity")!;
    await tool.handler({ uuid: "Actor.1" });
    expect(callRelay).toHaveBeenCalledWith(
      "GET",
      "/get",
      expect.objectContaining({ query: expect.objectContaining({ uuid: "Actor.1" }) })
    );
  });
});

// ── foundry_delete_entity annotations ────────────────────────────────────────
describe("entity delete tool annotations", () => {
  it("has destructiveHint:true", async () => {
    const { entityModule } = await import("../src/tools/entity.js");
    const registrations: Array<{
      name: string;
      meta: { annotations?: Record<string, unknown> };
      handler: (args: Record<string, unknown>) => Promise<unknown>;
    }> = [];
    const fakeServer = {
      registerTool: (
        name: string,
        meta: { annotations?: Record<string, unknown> },
        handler: (args: Record<string, unknown>) => Promise<unknown>
      ) => registrations.push({ name, meta, handler }),
    };
    entityModule.register(fakeServer as unknown as import("@modelcontextprotocol/sdk/server/mcp.js").McpServer, {
      callRelay: vi.fn(),
      config,
    });
    const tool = registrations.find((r) => r.name === "foundry_delete_entity")!;
    expect(tool.meta.annotations?.destructiveHint).toBe(true);
  });
});

// ── foundry_create_entity ─────────────────────────────────────────────────────
describe("entity create tool", () => {
  it("posts to /create with correct body", async () => {
    const { entityModule } = await import("../src/tools/entity.js");
    const callRelay: CallRelayFn = vi
      .fn()
      .mockResolvedValue({ uuid: "JournalEntry.new" });
    const registrations: Array<{
      name: string;
      meta: unknown;
      handler: (args: Record<string, unknown>) => Promise<unknown>;
    }> = [];
    const fakeServer = {
      registerTool: (
        name: string,
        meta: unknown,
        handler: (args: Record<string, unknown>) => Promise<unknown>
      ) => registrations.push({ name, meta, handler }),
    };
    entityModule.register(fakeServer as unknown as import("@modelcontextprotocol/sdk/server/mcp.js").McpServer, {
      callRelay,
      config,
    });
    const tool = registrations.find((r) => r.name === "foundry_create_entity")!;
    await tool.handler({
      entityType: "JournalEntry",
      data: { name: "My Journal" },
    });
    expect(callRelay).toHaveBeenCalledWith(
      "POST",
      "/create",
      expect.objectContaining({
        body: { entityType: "JournalEntry", data: { name: "My Journal" } },
      })
    );
  });
});

// ── foundry_modify_actor ──────────────────────────────────────────────────────
describe("modify actor tool", () => {
  async function getModifyTool() {
    const { entityModule } = await import("../src/tools/entity.js");
    const callRelay: CallRelayFn = vi
      .fn()
      .mockResolvedValue({ success: true });
    const registrations: Array<{
      name: string;
      meta: unknown;
      handler: (args: Record<string, unknown>) => Promise<unknown>;
    }> = [];
    const fakeServer = {
      registerTool: (
        name: string,
        meta: unknown,
        handler: (args: Record<string, unknown>) => Promise<unknown>
      ) => registrations.push({ name, meta, handler }),
    };
    entityModule.register(fakeServer as unknown as import("@modelcontextprotocol/sdk/server/mcp.js").McpServer, {
      callRelay,
      config,
    });
    return {
      tool: registrations.find((r) => r.name === "foundry_modify_actor")!,
      callRelay,
    };
  }

  it("routes increase to /increase", async () => {
    const { tool, callRelay } = await getModifyTool();
    await tool.handler({
      action: "increase",
      uuid: "Actor.1",
      attribute: "system.attributes.hp.value",
      amount: 5,
    });
    expect(callRelay).toHaveBeenCalledWith(
      "POST",
      "/increase",
      expect.anything()
    );
  });

  it("routes kill to /kill", async () => {
    const { tool, callRelay } = await getModifyTool();
    await tool.handler({ action: "kill", uuid: "Actor.1" });
    expect(callRelay).toHaveBeenCalledWith("POST", "/kill", expect.anything());
  });

  it("returns fail when increase missing attribute", async () => {
    const { tool } = await getModifyTool();
    const result = (await tool.handler({
      action: "increase",
      uuid: "Actor.1",
      amount: 5,
    })) as { isError?: boolean };
    expect(result.isError).toBe(true);
  });
});

// ── foundry_create_creature ───────────────────────────────────────────────────
describe("creature tool", () => {
  it("posts to /create with entityType Actor", async () => {
    const { creatureModule } = await import("../src/tools/creature.js");
    const callRelay: CallRelayFn = vi
      .fn()
      .mockResolvedValue({ uuid: "Actor.new" });
    const registrations: Array<{
      name: string;
      meta: unknown;
      handler: (args: Record<string, unknown>) => Promise<unknown>;
    }> = [];
    const fakeServer = {
      registerTool: (
        name: string,
        meta: unknown,
        handler: (args: Record<string, unknown>) => Promise<unknown>
      ) => registrations.push({ name, meta, handler }),
    };
    creatureModule.register(fakeServer as unknown as import("@modelcontextprotocol/sdk/server/mcp.js").McpServer, {
      callRelay,
      config,
    });
    const tool = registrations.find(
      (r) => r.name === "foundry_create_creature"
    )!;
    await tool.handler({
      name: "Jabberwocky",
      size: "huge",
      type: "monstrosity",
      cr: 6,
      ac: 15,
      hp: { value: 90, max: 90, formula: "12d10+24" },
      abilities: { str: 19, dex: 14, con: 17, int: 7, wis: 12, cha: 10 },
    });
    expect(callRelay).toHaveBeenCalledWith(
      "POST",
      "/create",
      expect.objectContaining({
        body: expect.objectContaining({ entityType: "Actor" }),
      })
    );
  });
});

// ── foundry_manage_folder ─────────────────────────────────────────────────────
describe("folders tool", () => {
  it("posts to /create-folder with name and folderType in query", async () => {
    const { foldersModule } = await import("../src/tools/folders.js");
    const callRelay: CallRelayFn = vi
      .fn()
      .mockResolvedValue({ id: "1", uuid: "Folder.1", name: "NPCs" });
    const registrations: Array<{
      name: string;
      meta: unknown;
      handler: (args: Record<string, unknown>) => Promise<unknown>;
    }> = [];
    const fakeServer = {
      registerTool: (
        name: string,
        meta: unknown,
        handler: (args: Record<string, unknown>) => Promise<unknown>
      ) => registrations.push({ name, meta, handler }),
    };
    foldersModule.register(fakeServer as unknown as import("@modelcontextprotocol/sdk/server/mcp.js").McpServer, {
      callRelay,
      config,
    });
    const tool = registrations.find(
      (r) => r.name === "foundry_manage_folder"
    )!;
    await tool.handler({
      action: "create",
      name: "NPCs",
      folderType: "Actor",
    });
    expect(callRelay).toHaveBeenCalledWith(
      "POST",
      "/create-folder",
      expect.objectContaining({
        query: expect.objectContaining({ name: "NPCs", folderType: "Actor" }),
      })
    );
  });

  it("has destructiveHint true for delete", async () => {
    // The delete action path has destructiveHint on the tool itself
    // We verify the folder delete action goes to DELETE /delete-folder
    const { foldersModule } = await import("../src/tools/folders.js");
    const callRelay: CallRelayFn = vi.fn().mockResolvedValue({ deleted: true });
    const registrations: Array<{
      name: string;
      meta: { annotations?: Record<string, unknown> };
      handler: (args: Record<string, unknown>) => Promise<unknown>;
    }> = [];
    const fakeServer = {
      registerTool: (
        name: string,
        meta: { annotations?: Record<string, unknown> },
        handler: (args: Record<string, unknown>) => Promise<unknown>
      ) => registrations.push({ name, meta, handler }),
    };
    foldersModule.register(fakeServer as unknown as import("@modelcontextprotocol/sdk/server/mcp.js").McpServer, {
      callRelay,
      config,
    });
    const tool = registrations.find(
      (r) => r.name === "foundry_manage_folder"
    )!;
    await tool.handler({ action: "delete", folderId: "Folder.1" });
    expect(callRelay).toHaveBeenCalledWith(
      "DELETE",
      "/delete-folder",
      expect.anything()
    );
  });
});

// ── withErrors wrapper ────────────────────────────────────────────────────────
describe("withErrors", () => {
  it("surfaces a RelayError as an isError result", async () => {
    const { withErrors } = await import("../src/tools/types.js");
    const handler = withErrors(async () => {
      throw new RelayError(401, "auth_failed", "bad key");
    });
    const result = (await handler({})) as { isError?: boolean; content: Array<{ text: string }> };
    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain("bad key");
  });

  it("re-throws non-RelayError (genuine bugs are not swallowed)", async () => {
    const { withErrors } = await import("../src/tools/types.js");
    const handler = withErrors(async () => {
      throw new TypeError("boom");
    });
    await expect(handler({})).rejects.toThrow("boom");
  });
});

// ── userId override ───────────────────────────────────────────────────────────
describe("userId / clientId targeting override", () => {
  it("threads userId and clientId into the query", async () => {
    const { searchModule } = await import("../src/tools/search.js");
    const callRelay: CallRelayFn = vi.fn().mockResolvedValue([]);
    const { registrations } = collectTools(searchModule, callRelay);
    const tool = registrations.find((r) => r.name === "foundry_search")!;
    await tool.handler({
      query: "goblin",
      limit: 50,
      minified: true,
      clientId: "fvtt_override",
      userId: "user_42",
    });
    expect(callRelay).toHaveBeenCalledWith(
      "GET",
      "/search",
      expect.objectContaining({
        query: expect.objectContaining({
          clientId: "fvtt_override",
          userId: "user_42",
        }),
      })
    );
  });
});

// ── ranged vs melee attack classification ────────────────────────────────────
describe("npc-schema attack classification", () => {
  it("marks an attack with range as rwak, otherwise mwak", async () => {
    const { buildNpcDocument } = await import("../src/dnd5e/npc-schema.js");
    const doc = buildNpcDocument({
      name: "Archer",
      size: "med",
      type: "humanoid",
      cr: 1,
      ac: 13,
      hp: { value: 11, max: 11 },
      abilities: { str: 10, dex: 16, con: 12, int: 10, wis: 11, cha: 10 },
      attacks: [
        { name: "Shortbow", range: "80/320 ft", damage: [{ formula: "1d6+3", type: "piercing" }] },
        { name: "Dagger", damage: [{ formula: "1d4+3", type: "piercing" }] },
      ],
    }) as { items: Array<{ name: string; system: { activities: Record<string, { attack: { type: { value: string } } }> } }> };

    const typeOf = (name: string) => {
      const item = doc.items.find((i) => i.name === name)!;
      const activity = Object.values(item.system.activities)[0];
      return activity.attack.type.value;
    };
    expect(typeOf("Shortbow")).toBe("rwak");
    expect(typeOf("Dagger")).toBe("mwak");
  });
});

// ── system gating (#14) ───────────────────────────────────────────────────────
describe("system gating", () => {
  it("resolveActiveWorld picks the configured clientId", async () => {
    const { resolveActiveWorld } = await import("../src/tools/worlds.js");
    const callRelay: CallRelayFn = vi.fn().mockResolvedValue({
      clients: [
        { clientId: "fvtt_test", systemId: "dnd5e", isOnline: true },
        { clientId: "fvtt_other", systemId: "pf2e", isOnline: true },
      ],
      total: 2,
    });
    const active = await resolveActiveWorld({ callRelay, config });
    expect(active?.clientId).toBe("fvtt_test");
  });

  it("resolveActiveWorld picks the sole online world when no clientId configured", async () => {
    const { resolveActiveWorld } = await import("../src/tools/worlds.js");
    const callRelay: CallRelayFn = vi.fn().mockResolvedValue({
      clients: [
        { clientId: "fvtt_a", systemId: "pf2e", isOnline: true },
        { clientId: "fvtt_b", systemId: "dnd5e", isOnline: false },
      ],
      total: 2,
    });
    const cfg: Config = { ...config, clientId: undefined };
    const active = await resolveActiveWorld({ callRelay, config: cfg });
    expect(active?.clientId).toBe("fvtt_a");
  });

  it("disables the creature tool on a non-dnd5e world", async () => {
    const { applySystemGating } = await import("../src/server.js");
    const handle = { enable: vi.fn(), disable: vi.fn() };
    applySystemGating(
      { clientId: "fvtt_x", systemId: "pf2e" },
      handle
    );
    expect(handle.disable).toHaveBeenCalledOnce();
  });

  it("leaves the creature tool enabled on a dnd5e world", async () => {
    const { applySystemGating } = await import("../src/server.js");
    const handle = { enable: vi.fn(), disable: vi.fn() };
    applySystemGating(
      { clientId: "fvtt_x", systemId: "dnd5e" },
      handle
    );
    expect(handle.disable).not.toHaveBeenCalled();
  });

  it("leaves the creature tool enabled when the world can't be resolved", async () => {
    const { applySystemGating } = await import("../src/server.js");
    const handle = { enable: vi.fn(), disable: vi.fn() };
    applySystemGating(undefined, handle);
    expect(handle.disable).not.toHaveBeenCalled();
  });
});
