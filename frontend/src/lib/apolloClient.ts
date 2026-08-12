import { ApolloClient, InMemoryCache, HttpLink } from "@apollo/client";

// credentials: "include" is required so the browser attaches the
// httpOnly session cookie on every request to the GraphQL API,
// even though frontend (5173) and backend (4000) are different origins.
const httpLink = new HttpLink({
  uri: "https://api-parts-marketplace.vercel.app/graphql",
  credentials: "include",
});

export const client = new ApolloClient({
  link: httpLink,
  cache: new InMemoryCache(),
});
