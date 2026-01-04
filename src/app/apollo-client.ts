// src/apollo-client.ts
import { ApolloClient, InMemoryCache, HttpLink } from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import { nhost } from "@/lib/nhost";

const httpLink = new HttpLink({
  uri: `https://${process.env.NEXT_PUBLIC_NHOST_SUBDOMAIN}.graphql.${process.env.NEXT_PUBLIC_NHOST_REGION}.nhost.run/v1`,
});

const authLink = setContext(async (_, { headers }) => {
  // v4 client: token is usually available like this
  const token = nhost.auth.getAccessToken?.() ?? null;

  return {
    headers: {
      ...headers,
      ...(token ? { authorization: `Bearer ${token}` } : {}),
    },
  };
});

export const apolloClient = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
});
