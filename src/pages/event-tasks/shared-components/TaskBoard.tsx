import { type PropsWithChildren } from "react";

export function TaskBoard({ children }: PropsWithChildren) {
  return (
    <div className="w-full overflow-x-auto">
      <div className="flex gap-4 pb-4">{children}</div>
    </div>
  );
}
