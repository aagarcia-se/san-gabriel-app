interface EmptyStateProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="card flex flex-col items-center gap-2 py-10 text-center">
      <p className="text-sm font-medium text-slate-200">{title}</p>
      {description && <p className="text-sm text-slate-400">{description}</p>}
      {action}
    </div>
  );
}
