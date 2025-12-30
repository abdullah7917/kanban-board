import KanbanColumn from "./components/kanban/KanbanColumn";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-black p-6 text-white">
      <h1 className="mb-6 text-2xl font-bold">Kanban Board</h1>

      <div className="flex gap-6">
        <KanbanColumn title="Stuck" initialCards={["Fix login bug"]} />
        <KanbanColumn title="Not Started" initialCards={["Design homepage"]} />
        <KanbanColumn
          title="Working on it"
          initialCards={["Build Kanban UI"]}
        />
        <KanbanColumn title="Done" initialCards={["Project setup"]} />
        <KanbanColumn title="Test" initialCards={[]} />
      </div>
    </main>
  );
}
