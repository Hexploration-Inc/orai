import {
  FastifyInstance,
  FastifyPluginOptions,
  FastifyReply,
  FastifyRequest,
} from "fastify";
import { google } from "googleapis";

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
        oauth2Client.setCredentials(tokens);

        // In a real app, you would associate these tokens with a user and store them securely.
        // The refresh_token is especially sensitive and should be encrypted at rest.
        console.log("Access Token:", tokens.access_token);
        console.log("Refresh Token:", tokens.refresh_token);

        const gmail = google.gmail({ version: "v1", auth: oauth2Client });
        const profile = await gmail.users.getProfile({ userId: "me" });

        console.log("Authenticated as:", profile.data.emailAddress);

        // Redirect the user back to the web app
        reply.redirect("http://localhost:3000");
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
