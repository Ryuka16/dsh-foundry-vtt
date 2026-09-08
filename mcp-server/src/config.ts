import { z } from "zod";

const ConfigSchema = z.object({
  apiKey: z.string().min(1, "FOUNDRY_API_KEY is required"),
  relayUrl: z.string().url("FOUNDRY_RELAY_URL must be a valid URL"),
  clientId: z.string().optional(),
  userId: z.string().optional(),
});

export type Config = z.infer<typeof ConfigSchema>;

export function loadConfig(): Config {
  const raw = {
    apiKey: process.env.FOUNDRY_API_KEY,
    relayUrl: process.env.FOUNDRY_RELAY_URL || "https://foundryrestapi.com",
    clientId: process.env.FOUNDRY_CLIENT_ID || undefined,
    userId: process.env.FOUNDRY_USER_ID || undefined,
  };

  const result = ConfigSchema.safeParse(raw);
  if (!result.success) {
    const details = result.error.issues
      .map((i) => `  - ${i.path.join(".") || "(config)"}: ${i.message}`)
      .join("\n");
    process.stderr.write(
      "Error: invalid configuration.\n" +
        details +
        "\nSet the required environment variables (see .env.example).\n" +
        "Get a key at https://foundryrestapi.com\n"
    );
    process.exit(1);
  }

  return result.data;
}
