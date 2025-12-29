import Counter from "./components/Counter";

export default function Home() {
  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold mb-4">Kanban Board Prep</h1>
      <Counter initial={0} />
    </main>
  );
}
