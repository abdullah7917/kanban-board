"use client";

type KanbanCardProps = {
  title: string;
};

export default function KanbanCard({ title }: KanbanCardProps) {
  return (
    <div className="rounded-md bg-gray-700 px-3 py-2 text-sm text-white shadow">
      {title}
    </div>
  );
}
