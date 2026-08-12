import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@as-integrations/express4";
import { Request, Response } from "express";
import { typeDefs } from "./schema";
import { resolvers } from "./resolvers";
import { getUserIdFromRequest, AuthContext } from "./middleware/auth";

async function main() {
  const app = express();

  // credentials: true is required so the browser will send/receive the
  // httpOnly cookie on cross-origin requests (frontend on a different port).
  app.use(
    cors({
      // origin: "http://localhost:5173", //Localhost for testing
      origin: "https://partsmarketplace.vercel.app", //Production frontend deployed on Vercel
      credentials: true,
    })
  );
  app.use(cookieParser());
  app.use(express.json());

  const server = new ApolloServer({
    typeDefs,
    resolvers,
    includeStacktraceInErrorResponses: false, // never leak stack traces to clients
  });
  await server.start();

  app.use(
    "/graphql",
    expressMiddleware(server, {
      // Every request builds a fresh context: read the cookie, resolve the
      // user, and hand the response object down so resolvers can set cookies.
      context: async ({ req, res }: { req: Request; res: Response }): Promise<AuthContext> => ({
        userId: getUserIdFromRequest(req),
        res,
      }),
    })
  );

  app.get("/health", (_req, res) => res.json({ ok: true }));

  const PORT = 4000;
  app.listen(PORT, () => {
    console.log(`GraphQL server ready at http://localhost:${PORT}/graphql`);
  });
}

main().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
