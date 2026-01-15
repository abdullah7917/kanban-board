import type { CodegenConfig } from "@graphql-codegen/cli";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const GRAPHQL_URL = process.env.HASURA_GRAPHQL_URL;
const ADMIN_SECRET = process.env.HASURA_ADMIN_SECRET;

if (!GRAPHQL_URL) throw new Error("Missing HASURA_GRAPHQL_URL in .env.local");
if (!ADMIN_SECRET) throw new Error("Missing HASURA_ADMIN_SECRET in .env.local");

const config: CodegenConfig = {
  schema: {
    [GRAPHQL_URL]: {
      headers: {
        "x-hasura-admin-secret": ADMIN_SECRET,
        "x-hasura-role": "admin",
      },
    },
  },
  documents: ["src/graphql/**/*.graphql"],
  generates: {
    "src/graphql/__generated__/": {
      preset: "client",
      plugins: [],
    },
  },
};

export default config;
