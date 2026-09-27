import express from "express";
import cors from "cors";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@as-integrations/express4";
import { Request } from "express";
import { typeDefs } from "./schema";
import { resolvers } from "./resolvers";
import { getUserIdFromRequest, AuthContext } from "./middleware/auth";
import { prisma } from "./prisma";

async function main() {
  const app = express();

  const allowedOrigins = [
    "http://localhost:5173",  //Localhost for testing
    "https://partsmarketplace.vercel.app", //Production frontend deployed on Vercel
  ];

  // Auth now travels as a Bearer token (Supabase access_token), not a
  // cookie, so credentials/cookie-parser are no longer needed.
  app.use(
    cors({
      origin: allowedOrigins,
    })
  );
  app.use(express.json());

  // Lightweight liveness/readiness check. Touches the DB so a monitor pinging
  // this also keeps Supabase's pooled connection warm and prevents the free-tier
  // project from auto-pausing due to inactivity. GET and HEAD only — no body
  // needed for HEAD, UptimeRobot and most uptime monitors default to one or
  // the other depending on config.
  app.get("/health", async (_req, res) => {
    try {
      await prisma.$queryRaw`SELECT 1`;
      res.status(200).json({ status: "ok", db: "up", time: new Date().toISOString() });
    } catch (err) {
      console.error("Health check DB query failed:", err);
      res.status(503).json({ status: "error", db: "down" });
    }
  });

  app.head("/health", async (_req, res) => {
    try {
      await prisma.$queryRaw`SELECT 1`;
      res.status(200).end();
    } catch (err) {
      console.error("Health check DB query failed:", err);
      res.status(503).end();
    }
  });

  const server = new ApolloServer({
    typeDefs,
    resolvers,
    includeStacktraceInErrorResponses: false, // never leak stack traces to clients
  });
  await server.start();

  app.use(
    "/graphql",
    expressMiddleware(server, {
      // Every request builds a fresh context: verify the Bearer token
      // (Supabase access_token) and resolve it to a user id.
      context: async ({ req }: { req: Request }): Promise<AuthContext> => ({
        userId: await getUserIdFromRequest(req),
      }),
    })
  );

  const PORT = 4000;
  app.listen(PORT, () => {
    console.log(`GraphQL server ready at http://localhost:${PORT}/graphql`);
  });
}

main().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
