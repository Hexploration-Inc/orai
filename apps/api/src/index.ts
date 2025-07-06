import "dotenv/config";
import Fastify from "fastify";
import cors from "@fastify/cors";
import authRoutes from "./routes/auth";

const server = Fastify({
  logger: true,
});

server.register(cors, {
  origin: "http://localhost:3000",
  credentials: true,
});

server.get("/", async (request, reply) => {
  return { hello: "world" };
});

server.register(authRoutes);

const start = async () => {
  try {
    await server.listen({ port: 3001 });

    if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
      server.log.error(
        "Missing GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET environment variables."
      );
      process.exit(1);
    }
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

start();
