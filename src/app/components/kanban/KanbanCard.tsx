type KanbanCardProps = {
  title: string;
  onDelete: () => void;
};

export default function KanbanCard({ title, onDelete }: KanbanCardProps) {
  return (
    <div className="group relative rounded-lg border border-white/10 bg-white/5 p-3 text-white">
      <div className="pr-8 text-sm">{title}</div>

      <button
        type="button"
        aria-label="Delete card"
        onClick={(e) => {
          e.stopPropagation(); // prevent drag start
          onDelete();
        }}
        className="absolute right-2 top-2 z-10 rounded-md bg-black/40 px-2 py-1 text-xs font-semibold text-white opacity-0 transition-opacity group-hover:opacity-100 hover:bg-black/60"
      >
        ✕
      </button>
    </div>
  );
}
