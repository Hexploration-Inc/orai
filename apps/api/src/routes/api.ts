import {
  FastifyInstance,
  FastifyPluginOptions,
  FastifyReply,
  FastifyRequest,
} from "fastify";
import { google } from "googleapis";
import { getTokens } from "../token-store";

export default async function (
  server: FastifyInstance,
  options: FastifyPluginOptions
) {
  // This is a "hook" that runs before each request in this plugin.
  // It ensures the user has a valid session before they can access any routes.
  server.addHook(
    "preHandler",
    async (request: FastifyRequest, reply: FastifyReply) => {
      const sessionId = request.unsignCookie(request.cookies.sessionId || "");
      if (!sessionId.valid || !getTokens(sessionId.value!)) {
        return reply.status(401).send({ error: "Unauthorized" });
      }
      // Attach the sessionId to the request for easy access in handlers
      request.sessionId = sessionId.value;
    }
  );

  server.get("/me", async (request: FastifyRequest, reply: FastifyReply) => {
    const tokens = getTokens(request.sessionId!);
    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials(tokens!);

    const gmail = google.gmail({ version: "v1", auth: oauth2Client });
    const profile = await gmail.users.getProfile({ userId: "me" });

    return profile.data;
  });

  server.get(
    "/emails",
    async (request: FastifyRequest, reply: FastifyReply) => {
      const tokens = getTokens(request.sessionId!);
      const oauth2Client = new google.auth.OAuth2();
      oauth2Client.setCredentials(tokens!);

      const gmail = google.gmail({ version: "v1", auth: oauth2Client });
      const res = await gmail.users.messages.list({
        userId: "me",
        maxResults: 20, // Fetch the 20 most recent emails
      });

      return res.data;
    }
  );
}

// Augment the FastifyRequest interface to include our custom property
declare module "fastify" {
  interface FastifyRequest {
    sessionId?: string;
  }
}
