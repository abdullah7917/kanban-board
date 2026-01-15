import { NhostClient } from "@nhost/nhost-js";

export const nhost = new NhostClient({
  subdomain: process.env.NEXT_PUBLIC_NHOST_SUBDOMAIN!,
  region: process.env.NEXT_PUBLIC_NHOST_REGION!,
  graphqlUrl: process.env.NEXT_PUBLIC_NHOST_GRAPHQL_URL!,
});
