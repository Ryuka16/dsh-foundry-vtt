# Component specs

Numbered, living specifications of the internal components the issues implement against. These sit between `../API_SPEC.md` (the external relay API) and the GitHub issues (the tasks): they define the *contracts* our own code must satisfy.

## Convention
- Filenames `NNNN-kebab-title.md`. Unlike ADRs, specs are **living documents** — edit them as the design firms up; record *why* a contract changed in an ADR under [`../decisions/`](../decisions/).
- Each spec names the issues that implement it and the ADRs that justify it.

## Index
| # | Spec | Implements |
|---|---|---|
| [0001](./0001-relay-http-client.md) | Relay HTTP client (`callRelay`) | #3 |
| [0002](./0002-tool-surface.md) | V1 tool surface (~9 tools) | #4–#13 |
| [0003](./0003-dnd5e-npc-creature.md) | dnd5e NPC creature builder | #11, #12 |
