import { FastifyInstance, FastifyPluginOptions, FastifyRequest } from "fastify";
import { getTokens } from "../token-store";
import prisma from "../lib/prisma";
import { google } from "googleapis";
import R2 from "../lib/r2";
import { GetObjectCommand } from "@aws-sdk/client-s3";

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
}
