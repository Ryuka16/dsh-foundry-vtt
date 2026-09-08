/**
 * Assembles a dnd5e v5.2.2 NPC Actor document for POST /create.
 *
 * ⚠️ Attack/activities schema (the `items[]` embedded weapons) was verified
 *    against a live v5.2.2 NPC as described in Phase 4 spike (issue #11).
 *    The activities model replaced the old system.damage.parts in dnd5e 4.x.
 *    Do NOT hand-author attacks from older examples — use this builder or
 *    extend it after mirroring a real v5.2.2 NPC via foundry_get_entity.
 */

export interface NpcAbilities {
  str: number;
  dex: number;
  con: number;
  int: number;
  wis: number;
  cha: number;
}

export interface NpcHp {
  value: number;
  max: number;
  formula?: string;
}

export interface NpcSpeeds {
  walk?: number;
  fly?: number;
  swim?: number;
  climb?: number;
  burrow?: number;
  units?: string;
}

export interface NpcSenses {
  darkvision?: number;
  blindsight?: number;
  tremorsense?: number;
  truesight?: number;
  units?: string;
}

export interface NpcAttack {
  name: string;
  /** Static attack bonus. Provide this OR abilityMod. */
  toHit?: number;
  /** Ability abbreviation for attack mod, e.g. "str". Provide this OR toHit. */
  abilityMod?: string;
  reach?: number;
  range?: string;
  damage: Array<{ formula: string; type: string }>;
  description?: string;
}

export interface NpcFeature {
  name: string;
  description: string;
}

export interface NpcInput {
  name: string;
  size: "tiny" | "sm" | "med" | "lg" | "huge" | "grg";
  type: string;
  cr: number;
  ac: number;
  hp: NpcHp;
  abilities: NpcAbilities;
  speeds?: NpcSpeeds;
  senses?: NpcSenses;
  languages?: string[];
  alignment?: string;
  biography?: string;
  attacks?: NpcAttack[];
  features?: NpcFeature[];
  folder?: string;
}

function abilityBlock(value: number) {
  return { value };
}

function makeWeaponItem(attack: NpcAttack) {
  // dnd5e v5.2.2 weapon Item with the activities model.
  // activities is a Record<string, ActivityData> keyed by a generated id.
  const activityId = randomId();
  const isRanged = attack.range !== undefined;
  const damageRolls = attack.damage.map((d) => ({
    formula: d.formula,
    types: [d.type],
    scaling: { mode: "whole", formula: "" },
  }));

  const item: Record<string, unknown> = {
    name: attack.name,
    type: "weapon",
    system: {
      description: { value: attack.description ?? "" },
      quantity: 1,
      equipped: true,
      proficient: 1,
      weaponType: "natural",
      reach: attack.reach ?? 5,
      range: { value: null, long: null, units: "" },
      activities: {
        [activityId]: {
          type: "attack",
          activation: { type: "action", cost: 1, condition: "" },
          duration: { units: "inst", special: "" },
          target: { affects: { type: "creature", count: "" }, template: {} },
          range: attack.range
            ? { value: null, units: "ft", special: attack.range }
            : { value: attack.reach ?? 5, units: "ft", special: "" },
          uses: { max: "", recovery: [], spent: 0 },
          damage: {
            critical: { bonus: "" },
            parts: damageRolls,
          },
          attack: {
            ability: attack.abilityMod ?? (isRanged ? "dex" : "str"),
            bonus:
              attack.toHit !== undefined ? String(attack.toHit) : "",
            flat: attack.toHit !== undefined,
            type: {
              value: isRanged ? "rwak" : "mwak",
              classification: "weapon",
            },
          },
          effects: [],
          sort: 0,
        },
      },
    },
  };
  return item;
}

function makeFeatureItem(feature: NpcFeature) {
  return {
    name: feature.name,
    type: "feat",
    system: {
      description: { value: `<p>${feature.description}</p>` },
      type: { value: "monster", subtype: "" },
      activation: { type: "", cost: null, condition: "" },
    },
  };
}

function randomId(): string {
  return Math.random().toString(36).slice(2, 18).padEnd(16, "0");
}

export function buildNpcDocument(input: NpcInput): Record<string, unknown> {
  const abilities: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(input.abilities)) {
    abilities[key] = abilityBlock(value as number);
  }

  const speeds = input.speeds ?? { walk: 30 };
  const movement: Record<string, unknown> = {
    walk: speeds.walk ?? 30,
    units: speeds.units ?? "ft",
  };
  if (speeds.fly) movement.fly = speeds.fly;
  if (speeds.swim) movement.swim = speeds.swim;
  if (speeds.climb) movement.climb = speeds.climb;
  if (speeds.burrow) movement.burrow = speeds.burrow;

  const senses: Record<string, unknown> = {
    units: input.senses?.units ?? "ft",
  };
  if (input.senses?.darkvision) senses.darkvision = input.senses.darkvision;
  if (input.senses?.blindsight) senses.blindsight = input.senses.blindsight;
  if (input.senses?.tremorsense) senses.tremorsense = input.senses.tremorsense;
  if (input.senses?.truesight) senses.truesight = input.senses.truesight;

  const items: unknown[] = [];
  for (const atk of input.attacks ?? []) {
    items.push(makeWeaponItem(atk));
  }
  for (const feat of input.features ?? []) {
    items.push(makeFeatureItem(feat));
  }

  const doc: Record<string, unknown> = {
    name: input.name,
    type: "npc",
    system: {
      abilities,
      attributes: {
        ac: { flat: input.ac, calc: "natural" },
        hp: {
          value: input.hp.value,
          max: input.hp.max,
          formula: input.hp.formula ?? "",
        },
        movement,
        senses,
      },
      details: {
        cr: input.cr,
        type: { value: input.type, subtype: "" },
        alignment: input.alignment ?? "Unaligned",
        biography: { value: input.biography ? `<p>${input.biography}</p>` : "" },
      },
      traits: {
        size: input.size,
        languages: {
          value: input.languages ?? [],
          custom: "",
        },
        dr: { value: [], custom: "" },
        di: { value: [], custom: "" },
        dv: { value: [], custom: "" },
        ci: { value: [], custom: "" },
      },
    },
    items,
    prototypeToken: {
      name: input.name,
      actorLink: false,
      disposition: -1,
    },
  };

  if (input.folder) {
    (doc as Record<string, unknown>).folder = input.folder;
  }

  return doc;
}
