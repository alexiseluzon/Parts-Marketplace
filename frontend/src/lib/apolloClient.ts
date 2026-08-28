import { ApolloClient, InMemoryCache, HttpLink, from } from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import { supabase } from "./supabaseClient";

const httpLink = new HttpLink({
  // uri: "http://localhost:4000/graphql", //Localhost for testing
  uri: "https://parts-marketplace-ygjc.onrender.com/graphql", //Production backend deployed on Render
});

// Auth now travels as a Bearer token, not a cookie, so every request reads
// the current Supabase session and attaches its access_token. getSession()
// is a fast local read (no network call) unless the token needs refreshing.
const authLink = setContext(async (_, { headers }) => {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  return {
    headers: {
      ...headers,
      ...(token ? { authorization: `Bearer ${token}` } : {}),
    },
  };
});

export const client = new ApolloClient({
  link: from([authLink, httpLink]),
  cache: new InMemoryCache(),
});
