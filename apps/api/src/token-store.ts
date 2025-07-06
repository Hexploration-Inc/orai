import { Credentials } from "google-auth-library";

// WARNING: This is a simple in-memory store for development purposes only.
// In a production application, you should use a persistent, secure database (e.g., Redis, PostgreSQL)
// to store user sessions and tokens.
const tokenStore: Record<string, Credentials> = {};

export const storeTokens = (sessionId: string, tokens: Credentials) => {
  tokenStore[sessionId] = tokens;
};

export const getTokens = (sessionId: string): Credentials | null => {
  return tokenStore[sessionId] || null;
};
