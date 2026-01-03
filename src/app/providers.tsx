"use client";

import { ApolloProvider } from "@apollo/client";
import type { PropsWithChildren } from "react";
import { client } from "./apollo-client";

export default function Providers({ children }: PropsWithChildren) {
  return <ApolloProvider client={client}>{children}</ApolloProvider>;
}
