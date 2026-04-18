import { app } from "./app";
import { connectDatabase } from "./config/db";
import { env } from "./config/env";
import { seedDatabase } from "./services/seed.service";

const startServer = async () => {
  await connectDatabase();

  if (env.SEED_ON_BOOT) {
    await seedDatabase();
  }

  app.listen(env.PORT, () => {
    console.log(`EventChimp API listening on http://localhost:${env.PORT}`);
    console.log(`Swagger docs available at http://localhost:${env.PORT}/api/docs`);
  });
};

startServer().catch((error) => {
  console.error("Failed to start EventChimp backend", error);
  process.exit(1);
});
