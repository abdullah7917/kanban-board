"use client";

import {
  ApolloClient,
  InMemoryCache,
  ApolloProvider,
  HttpLink,
} from "@apollo/client";
import type { PropsWithChildren } from "react";

const link = new HttpLink({
  uri: "https://countries.trevorblades.com/",
});

const client = new ApolloClient({
  link,
  cache: new InMemoryCache(),
});

export default function Providers({ children }: PropsWithChildren) {
  return <ApolloProvider client={client}>{children}</ApolloProvider>;
}
