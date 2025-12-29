"use client";

type KanbanColumnProps = {
  title: string;
  children?: React.ReactNode;
};

export default function KanbanColumn({ title, children }: KanbanColumnProps) {
  return (
    <div className="w-72 rounded-lg bg-gray-800 text-white p-4">
      <h2 className="mb-4 text-lg font-semibold">{title}</h2>
      <div className="space-y-3">{children}</div>
    </div>
  );
}
