import KanbanColumn from "./components/kanban/KanbanColumn";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-black text-white p-6">
      <h1 className="mb-6 text-2xl font-bold">Kanban Board</h1>

      <div className="flex gap-6">
        <KanbanColumn title="Stuck" />
        <KanbanColumn title="Not Started" />
        <KanbanColumn title="Working on it" />
        <KanbanColumn title="Done" />
        <KanbanColumn title="Test" />
      </div>
    </main>
  );
}
