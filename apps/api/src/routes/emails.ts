import { FastifyInstance, FastifyPluginOptions, FastifyRequest } from "fastify";
import { getTokens } from "../token-store";
import prisma from "../lib/prisma";
import { google } from "googleapis";
import R2 from "../lib/r2";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import {
  archiveEmail,
  markEmailAsSpam,
  sendEmail,
  trashEmail,
} from "../services/gmail";

// A temporary way to get user ID from session. We will improve this.
async function getUserIdFromSession(
  request: FastifyRequest
): Promise<string | null> {
  const sessionId = request.unsignCookie(request.cookies.sessionId ?? "");
  if (!sessionId.valid || !sessionId.value) {
    return null;
  }
  const tokens = getTokens(sessionId.value);
  if (!tokens) {
    return null;
  }

  const oauth2Client = new google.auth.OAuth2();
  oauth2Client.setCredentials(tokens);
  const oauth2 = google.oauth2({ version: "v2", auth: oauth2Client });
  const { data } = await oauth2.userinfo.get();
  return data.id ?? null;
}

export default async function (
  server: FastifyInstance,
  options: FastifyPluginOptions
) {
  // This route is a "pre-handler" that runs before all routes in this file.
  // It ensures the user is authenticated before they can access any email endpoints.
  server.addHook("preHandler", async (request, reply) => {
    const userId = await getUserIdFromSession(request);
    if (!userId) {
      reply.status(401).send({ error: "Unauthorized" });
      return;
    }
    // Attach userId to the request for other handlers to use
    (request as any).userId = userId;

    // Also attach tokens for handlers that need to make API calls
    const sessionId = request.unsignCookie(request.cookies.sessionId ?? "");
    if (sessionId.valid && sessionId.value) {
      (request as any).tokens = getTokens(sessionId.value);
    }
  });

  server.get("/emails", async (request, reply) => {
    const userId = (request as any).userId;

    const emails = await prisma.email.findMany({
      where: { userId: userId },
      orderBy: {
        receivedAt: "desc",
      },
      take: 100,
    });

    return emails;
  });

  server.get(
    "/emails/:id",
    async (request: FastifyRequest<{ Params: { id: string } }>, reply) => {
      const userId = (request as any).userId;
      const { id } = request.params;

      const email = await prisma.email.findFirst({
        where: {
          id: id,
          userId: userId, // Ensures user can only access their own emails
        },
      });

      if (!email) {
        return reply.status(404).send({ error: "Email not found" });
      }

      // If the email has a body stored in R2, fetch it
      let bodyHtml = "";
      if (email.r2ObjectKey) {
        const command = new GetObjectCommand({
          Bucket: process.env.R2_BUCKET_NAME,
          Key: email.r2ObjectKey,
        });
        const response = await R2.send(command);
        bodyHtml = (await response.Body?.transformToString()) ?? "";
      }

      // Combine the database record with the R2 body and return
      return {
        ...email,
        bodyHtml,
      };
    }
  );

  server.post(
    "/emails/:id/modify",
    async (
      request: FastifyRequest<{
        Params: { id: string };
        Body: { action: "archive" | "trash" | "spam" };
      }>,
      reply
    ) => {
      const userId = (request as any).userId;
      const tokens = (request as any).tokens;
      const { id } = request.params;
      const { action } = request.body;

      if (!tokens) {
        return reply.status(401).send({ error: "Unauthorized: No tokens" });
      }

      const email = await prisma.email.findFirst({
        where: { id: id, userId: userId },
      });

      if (!email || !email.gmailMessageId) {
        return reply.status(404).send({ error: "Email not found" });
      }

      try {
        switch (action) {
          case "archive":
            await archiveEmail(tokens, email.gmailMessageId);
            await prisma.email.update({
              where: { id: email.id },
              data: { isArchived: true },
            });
            break;
          case "trash":
            await trashEmail(tokens, email.gmailMessageId);
            // We'll remove the email from our DB once it's trashed in Gmail
            await prisma.email.delete({ where: { id: email.id } });
            break;
          case "spam":
            await markEmailAsSpam(tokens, email.gmailMessageId);
            await prisma.email.update({
              where: { id: email.id },
              data: { isSpam: true, isArchived: true },
            });
            break;
          default:
            return reply.status(400).send({ error: "Invalid action" });
        }

        return reply.send({ success: true });
      } catch (error) {
        console.error(`Failed to ${action} email:`, error);
        return reply.status(500).send({ error: `Failed to ${action} email` });
      }
    }
  );

  server.post(
    "/emails/send",
    async (
      request: FastifyRequest<{
        Body: { to: string; subject: string; html: string };
      }>,
      reply
    ) => {
      const tokens = (request as any).tokens;
      const { to, subject, html } = request.body;

      if (!tokens) {
        return reply.status(401).send({ error: "Unauthorized: No tokens" });
      }

      try {
        await sendEmail(tokens, { to, subject, html });
        return reply.send({ success: true });
      } catch (error) {
        console.error("Failed to send email:", error);
        return reply.status(500).send({ error: "Failed to send email" });
      }
    }
  );
}
