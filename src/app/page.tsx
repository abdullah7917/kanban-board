import KanbanColumn from "./components/kanban/KanbanColumn";
import KanbanCard from "./components/kanban/KanbanCard";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-black p-6 text-white">
      <h1 className="mb-6 text-2xl font-bold">Kanban Board</h1>

      <div className="flex gap-6">
        <KanbanColumn title="Todo">
          <KanbanCard title="Fix login bug" />
          <KanbanCard title="Design homepage" />
        </KanbanColumn>

        <KanbanColumn title="In Progress">
          <KanbanCard title="Build Kanban UI" />
        </KanbanColumn>

        <KanbanColumn title="Done">
          <KanbanCard title="Project setup" />
        </KanbanColumn>
      </div>
    </main>
  );
}
