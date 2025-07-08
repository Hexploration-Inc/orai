import { PrismaClient } from "@prisma/client";

// It's best practice to instantiate a single instance of PrismaClient and export it from a single file.
// This allows you to share the instance across your application.
// See: https://www.prisma.io/docs/guides/database/troubleshooting-orm/help-articles/nextjs-prisma-client-dev-practices

const prisma = new PrismaClient();

export default prisma;
