"use client";

import type { PropsWithChildren } from "react";
import { NhostNextProvider } from "@nhost/nextjs";
import { NhostApolloProvider } from "@nhost/react-apollo";
import { nhost } from "@/lib/nhost";

export default function Providers({ children }: PropsWithChildren) {
  return (
    <NhostNextProvider nhost={nhost}>
      <NhostApolloProvider nhost={nhost}>{children}</NhostApolloProvider>
    </NhostNextProvider>
  );
}
