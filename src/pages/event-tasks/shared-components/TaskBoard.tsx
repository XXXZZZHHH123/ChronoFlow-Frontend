export function TaskBoard({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-4 overflow-x-auto pb-4">
      {children}
    </div>
  );
}
