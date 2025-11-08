import React from "react";
import type { PropsWithChildren, ReactElement } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";

// ── API + alert mocks ─────────────────────────────────────────────────────────
vi.mock("@/api/eventTasksApi", () => ({
  updateEventTask: vi.fn(),
}));
import { updateEventTask } from "@/api/eventTasksApi";

vi.mock("sweetalert2", () => ({
  default: { fire: vi.fn().mockResolvedValue({}) },
}));
import TaskReassignModal from "../shared-components/TaskReassignForm";

// ── UI shims (keep light) ─────────────────────────────────────────────────────
vi.mock("@/components/ui/button", () => {
  const Button = (
    props: React.ButtonHTMLAttributes<HTMLButtonElement>
  ): ReactElement => <button {...props} />;
  return { Button };
});
vi.mock("@/components/ui/label", () => {
  const Label = (props: React.LabelHTMLAttributes<HTMLLabelElement>) => (
    <label {...props} />
  );
  return { Label };
});
vi.mock("@/components/ui/textarea", () => {
  const Textarea = (
    props: React.TextareaHTMLAttributes<HTMLTextAreaElement>
  ) => <textarea {...props} />;
  return { Textarea };
});
vi.mock("@/components/ui/popover", () => {
  const Popover = ({ children }: PropsWithChildren) => <div>{children}</div>;
  const PopoverTrigger = ({ children }: { children: ReactElement }) =>
    React.cloneElement(children, {});
  const PopoverContent = ({
    children,
  }: PropsWithChildren<React.HTMLAttributes<HTMLDivElement>>) => (
    <div>{children}</div>
  );
  return { Popover, PopoverTrigger, PopoverContent };
});
vi.mock("@/components/ui/command", () => {
  const Wrapper = ({ children }: PropsWithChildren) => <div>{children}</div>;
  const CommandInput = (props: React.InputHTMLAttributes<HTMLInputElement>) => (
    <input aria-label="search" {...props} />
  );
  type CommandItemProps = {
    children: React.ReactNode;
    onSelect?: (value: string) => void;
    value: string;
    className?: string;
  };
  const CommandItem = ({
    children,
    onSelect,
    value,
    className,
  }: CommandItemProps) => (
    <button
      type="button"
      className={className}
      onClick={() => onSelect?.(value)}
    >
      {children}
    </button>
  );
  return {
    Command: Wrapper,
    CommandInput,
    CommandList: Wrapper,
    CommandGroup: Wrapper,
    CommandEmpty: Wrapper,
    CommandItem,
  };
});

// Respect open/close: hide content when closed and open via trigger.
vi.mock("@/components/ui/dialog", () => {
  type DialogContextValue = {
    isOpen: boolean;
    setOpen: (open: boolean) => void;
  };
  const DialogCtx = React.createContext<DialogContextValue | null>(null);

  type DialogProps = PropsWithChildren<{
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
  }>;
  function Dialog({ open, onOpenChange, children }: DialogProps) {
    const isControlled = typeof open === "boolean";
    const [internal, setInternal] = React.useState(false);
    const currentOpen = isControlled ? open : internal;
    const setOpen = (value: boolean) => {
      if (!isControlled) setInternal(value);
      onOpenChange?.(value);
    };
    return (
      <DialogCtx.Provider value={{ isOpen: currentOpen, setOpen }}>
        {children}
      </DialogCtx.Provider>
    );
  }

  type DialogContentProps = React.HTMLAttributes<HTMLDivElement>;
  function DialogContent(props: DialogContentProps) {
    const ctx = React.useContext(DialogCtx);
    if (!ctx?.isOpen) return null;
    return <div {...props} />;
  }

  const DialogHeader = ({ children }: PropsWithChildren) => (
    <div>{children}</div>
  );
  const DialogTitle = ({ children }: PropsWithChildren) => <h2>{children}</h2>;
  const DialogDescription = ({ children }: PropsWithChildren) => (
    <p>{children}</p>
  );

  return {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
  };
});

// Attachments field is not under test
vi.mock("../AttachmentField", () => {
  const AttachmentsField = (
    props: React.HTMLAttributes<HTMLDivElement>
  ): ReactElement => <div data-testid="attachments-field" {...props} />;
  return { AttachmentsField };
});

// ── Helpers ───────────────────────────────────────────────────────────────────
function setup(
  overrides: Partial<React.ComponentProps<typeof TaskReassignModal>> = {}
) {
  const props: React.ComponentProps<typeof TaskReassignModal> = {
    eventId: "evt-1",
    taskId: "task-1",
    onRefresh: vi.fn(),
    options: [
      { id: "u1", label: "Alice (Group A)" },
      { id: "u2", label: "Bob (Group B)" },
    ],
    initial: { targetUserId: "u1", taskName: "Demo Task", remark: "Initial" },
    triggerLabel: "Reassign",
    ...overrides,
  };
  const ui = render(<TaskReassignModal {...props} />);
  return { ui, props };
}

const getTrigger = () => screen.getByRole("button", { name: /^reassign$/i });
const getSubmit = () =>
  screen.getByRole("button", { name: /^confirm reassign$/i });
const getAssigneePicker = () =>
  screen.getByRole("button", { name: /select assignee/i }); // allows the … variant

// ── Tests ─────────────────────────────────────────────────────────────────────
describe("TaskReassignModal", () => {
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(updateEventTask).mockResolvedValue({});
  });

  it("resets form on close and re-open (empty selection, initial remark)", async () => {
    setup({
      initial: { targetUserId: "u1", taskName: "Task X", remark: "Init R" },
    });

    // open -> pick -> submit (success closes dialog)
    await user.click(getTrigger());
    await user.click(getAssigneePicker());
    await user.click(screen.getByRole("button", { name: "Bob (Group B)" }));
    await user.click(getSubmit());
    // dialog content hidden after close
    expect(
      screen.queryByRole("heading", { name: /reassign task/i })
    ).not.toBeInTheDocument();

    // reopen
    await user.click(getTrigger());
    expect(
      screen.getByRole("heading", { name: /reassign task/i })
    ).toBeInTheDocument();

    // selection back to placeholder
    expect(getAssigneePicker()).toBeInTheDocument();

    // remark back to initial
    const remark = screen.getByLabelText(/remark/i) as HTMLTextAreaElement;
    expect(remark.value).toBe("Init R");
  });
});
