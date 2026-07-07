import { createApp } from "./app.js";
import { config } from "./config.js";

const app = createApp();

app.listen(config.port, () => {
  console.log(`GrowEasy CSV Importer API listening on http://localhost:${config.port}`);
  if (!config.geminiApiKey) {
    console.warn(
      "WARNING: GEMINI_API_KEY is not set — /api/import will fail. Copy .env.example to .env and add your key.",
    );
  }
});
