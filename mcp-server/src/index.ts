// The #!/usr/bin/env node shebang is injected at build time by tsup
// (see tsup.config.ts `banner`). Keeping it out of source avoids a
// double-shebang in dist/index.js, which makes the bin fail to parse.
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { loadConfig } from "./config.js";
import { createServer } from "./server.js";

async function main(): Promise<void> {
  const config = loadConfig();
  const server = await createServer(config);
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((e) => {
  process.stderr.write(`Fatal: ${e}\n`);
  process.exit(1);
});
