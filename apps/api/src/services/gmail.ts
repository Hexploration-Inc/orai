import { Credentials, OAuth2Client } from "google-auth-library";
import { gmail_v1, google } from "googleapis";
import prisma from "../lib/prisma";

/**
 * Creates an authenticated OAuth2 client for the user.
 * @param tokens The user's stored OAuth credentials.
 * @returns An authenticated OAuth2Client instance.
 */

function createOAuth2Client(tokens: Credentials): OAuth2Client {
  const oAuth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET
  );
  oAuth2Client.setCredentials(tokens);
  return oAuth2Client;
}

/**
 * Fetches the user's most recent emails from the Gmail API and stores them in the database.
 * This function implements the "Cache & Fetch" strategy.
 *
 * @param userId The ID of the user in our database.
 * @param tokens The user's OAuth credentials.
 */

export async function syncRecentEmails(userId: string, tokens: Credentials) {
  const auth = createOAuth2Client(tokens);
  const gmail = google.gmail({ version: "v1", auth });

  // 1. Fetch the list of the most recent 100 message IDs from the primary inbox category.
  const listResponse = await gmail.users.messages.list({
    userId: "me",
    maxResults: 100, // As per our hybrid strategy
    q: "category:primary", // Use the search query parameter for precise filtering
  });

  const messageIds = listResponse.data.messages?.map((m) => m.id!) ?? [];
  if (messageIds.length === 0) {
    console.log("No new emails found");
    return;
  }

  // 2. Fetch the full details for each message in parallel.
  const messagePromises = messageIds.map((id) =>
    gmail.users.messages.get({ userId: "me", id: id!, format: "full" })
  );

  const messageResponses = await Promise.all(messagePromises);

  // 3. Process and save each email sequentially to avoid overwhelming the db.
  for (const res of messageResponses) {
    if (res.data) {
      await processAndSaveEmail(userId, res.data);
    }
  }
}

/**
 * Transforms a single Gmail API message and saves it to the database.
 * @param userId The ID of our user.
 * @param gmailMessage The message object from the Gmail API.
 */

async function processAndSaveEmail(
  userId: string,
  gmailMessage: gmail_v1.Schema$Message
) {
  if (!gmailMessage.id || !gmailMessage.threadId) {
    return;
  }

  const getHeader = (name: string) =>
    gmailMessage.payload?.headers?.find((h) => h.name === name)?.value ?? null;

  // Basic implementation for parsing body, can be improved.
  const bodyPayload =
    gmailMessage.payload?.parts?.find((p) => p.mimeType === "text/html") ??
    gmailMessage.payload;
  const body = bodyPayload?.body?.data
    ? Buffer.from(bodyPayload.body.data, "base64").toString("utf-8")
    : "";

  const fromHeader = getHeader("From");
  const fromData = fromHeader
    ? {
        name: fromHeader.split("<")[0]?.trim() ?? null,
        email: fromHeader.match(/<(.*)>/)?.[1] ?? null,
      }
    : null;

  // Use upsert to avoid creating duplicate emails. It will create a new email
  // if one with the same gmailMessageId doesn't exist for this user,
  // or update it if it does.
  await prisma.email.upsert({
    where: {
      userId_gmailMessageId: {
        userId,
        gmailMessageId: gmailMessage.id,
      },
    },
    update: {
      isRead: !gmailMessage.labelIds?.includes("UNREAD"),
      labels: gmailMessage.labelIds ?? [],
    },
    create: {
      userId,
      gmailMessageId: gmailMessage.id,
      gmailThreadId: gmailMessage.threadId,
      subject: getHeader("Subject"),
      snippet: gmailMessage.snippet ?? null,
      fromData: fromData ?? undefined,
      // toData, ccData, etc., would be parsed similarly
      bodyHtml: body,
      isRead: !gmailMessage.labelIds?.includes("UNREAD"),
      labels: gmailMessage.labelIds ?? [],
      receivedAt: gmailMessage.internalDate
        ? new Date(parseInt(gmailMessage.internalDate, 10))
        : null,
    },
  });
}
