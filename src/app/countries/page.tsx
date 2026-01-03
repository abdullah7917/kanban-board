"use client";

import { useQuery } from "@apollo/client/react";
import { gql } from "@apollo/client";

const GET_COUNTRIES = gql`
  query GetCountries {
    countries {
      code
      name
    }
  }
`;

export default function CountriesPage() {
  const { data, loading, error } = useQuery(GET_COUNTRIES);

  if (loading) return <p className="p-6">Loading…</p>;
  if (error) return <p className="p-6">Error: {error.message}</p>;

  return (
    <main className="p-6 space-y-3">
      <h1 className="text-2xl font-bold">Countries</h1>
      <ul className="list-disc pl-6 space-y-1">
        {data.countries.map((c: { code: string; name: string }) => (
          <li key={c.code}>{c.name}</li>
        ))}
      </ul>
    </main>
  );
}
