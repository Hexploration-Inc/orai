import "dotenv/config";
import Fastify from "fastify";
import cors from "@fastify/cors";
import cookie from "@fastify/cookie";
import authRoutes from "./routes/auth";
import apiRoutes from "./routes/api";
import emailRoutes from "./routes/emails";

const server = Fastify({
  logger: true,
});

server.register(cors, {
  origin: "http://localhost:3000",
  credentials: true,
});

server.register(cookie, {
  secret: process.env.COOKIE_SECRET,
});

server.get("/", async (request, reply) => {
  return { hello: "world" };
});

server.register(authRoutes);
server.register(apiRoutes, { prefix: "/api" });
server.register(emailRoutes, { prefix: "/api" });

const start = async () => {
  try {
    await server.listen({ port: 3001 });

    if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
      server.log.error(
        "Missing GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET environment variables."
      );
      process.exit(1);
    }
    if (!process.env.COOKIE_SECRET) {
      server.log.error("Missing COOKIE_SECRET environment variable.");
      process.exit(1);
    }
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

start();
