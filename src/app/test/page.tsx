// src/app/test/page.tsx
"use client";

import { useEffect, useState } from "react";
import { gql, useQuery } from "@apollo/client";
import { nhost } from "@/lib/nhost";

const PING_QUERY = gql`
  query Ping {
    __typename
  }
`;

export default function TestPage() {
  const [token, setToken] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        // This exists in your setup because you're using @nhost/nextjs
        const t = await nhost.auth.getAccessToken();
        if (!alive) return;
        setToken(t ?? null);
      } finally {
        if (alive) setChecked(true);
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  const { data, loading, error } = useQuery(PING_QUERY, {
    skip: !token, // only query after logged in
    fetchPolicy: "network-only",
  });

  if (!checked) return <div style={{ padding: 24 }}>Checking auth…</div>;

  if (!token) {
    return (
      <div style={{ padding: 24 }}>
        <h1>/test</h1>
        <p style={{ color: "red" }}>❌ Not logged in</p>
        <p>
          Go to <b>/auth</b>, sign in, then come back.
        </p>
      </div>
    );
  }

  if (loading) return <div style={{ padding: 24 }}>Loading GraphQL…</div>;

  if (error) {
    return (
      <div style={{ padding: 24, color: "red" }}>
        ❌ GraphQL Error: {error.message}
      </div>
    );
  }

  return (
    <div style={{ padding: 24 }}>
      <h1>✅ Logged in + GraphQL reachable</h1>
      <pre>{JSON.stringify(data, null, 2)}</pre>
      <p>
        Next step: create/track your tables (like <code>boards</code>) in
        Hasura, then we switch this query to real data.
      </p>
    </div>
  );
}
