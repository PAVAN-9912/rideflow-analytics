import "dotenv/config";
import { createApp } from "./app";
import { connectToDatabase } from "./db/connection";

const PORT = process.env.PORT ? Number(process.env.PORT) : 5000;

async function main() {
  await connectToDatabase();
  const app = createApp();
  app.listen(PORT, () => {
    console.log(`[server] RideFlow API listening on http://localhost:${PORT}`);
  });
}

main().catch((err) => {
  console.error("[server] failed to start:", err);
  process.exit(1);
});
