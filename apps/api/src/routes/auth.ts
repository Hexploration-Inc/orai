import {
  FastifyInstance,
  FastifyPluginOptions,
  FastifyReply,
  FastifyRequest,
} from "fastify";
import { google } from "googleapis";
import { storeTokens } from "../token-store";
import crypto from "crypto";

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

export default async function (
  server: FastifyInstance,
  options: FastifyPluginOptions
) {
  server.get(
    "/auth/google",
    async (request: FastifyRequest, reply: FastifyReply) => {
      const scopes = [
        "https://www.googleapis.com/auth/gmail.readonly",
        "https://www.googleapis.com/auth/userinfo.email",
        "https://www.googleapis.com/auth/userinfo.profile",
      ];

      const url = oauth2Client.generateAuthUrl({
        access_type: "offline",
        scope: scopes,
        prompt: "consent",
      });

      reply.redirect(url);
    }
  );

  server.get(
    "/auth/google/callback",
    async (
      request: FastifyRequest<{ Querystring: { code: string } }>,
      reply: FastifyReply
    ) => {
      const { code } = request.query;

      try {
        const { tokens } = await oauth2Client.getToken(code);

        // Create a secure session
        const sessionId = crypto.randomUUID();
        storeTokens(sessionId, tokens); // Store tokens in our in-memory store

        // Set a signed, httpOnly cookie to identify the user's session
        reply.setCookie("sessionId", sessionId, {
          path: "/",
          httpOnly: true, // Prevents client-side JS from accessing the cookie
          secure: process.env.NODE_ENV === "production", // Use secure cookies in production
          signed: true,
          maxAge: 1000 * 60 * 60 * 24 * 30, // 30 days
        });

        // Redirect the user back to the web app's new dashboard
        reply.redirect("http://localhost:3000/dashboard");
      } catch (err) {
        server.log.error(
          err,
          "Failed to exchange authorization code for tokens."
        );
        reply.status(500).send("Authentication failed");
      }
    }
  );
}
