import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  Command,
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";

vi.mock("lucide-react", () => ({
  Search: () => <svg data-testid="search-icon" />,
}));

vi.mock("@/components/ui/dialog", () => {
  const Dialog = ({ children }: { children: React.ReactNode }) => (
    <div data-testid="dialog">{children}</div>
  );
  const DialogContent = ({
    children,
    className,
  }: React.HTMLAttributes<HTMLDivElement>) => (
    <div data-testid="dialog-content" className={className}>
      {children}
    </div>
  );
  return { Dialog, DialogContent };
});

vi.mock("cmdk", () => {
  const CommandRoot = ({
    children,
  }: React.HTMLAttributes<HTMLDivElement>) => (
    <div data-testid="mock-command-root">{children}</div>
  );

  const createSimple = (testId: string) =>
    React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
      (props, ref) => (
        <div ref={ref} data-testid={testId} {...props}>
          {props.children}
        </div>
      )
    );

  const CommandInputPrimitive = React.forwardRef<
    HTMLInputElement,
    React.InputHTMLAttributes<HTMLInputElement>
  >((props, ref) => <input ref={ref} {...props} />);

  const CommandItemPrimitive = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement> & {
      value?: string;
      onSelect?: (value: string) => void;
    }
  >(({ onSelect, value, ...rest }, ref) => (
    <div
      ref={ref}
      role="option"
      onClick={(event) => {
        rest.onClick?.(event);
        onSelect?.(value ?? "");
      }}
      {...rest}
    >
      {rest.children}
    </div>
  ));

  const CommandListPrimitive = createSimple("mock-command-list");
  const CommandEmptyPrimitive = createSimple("mock-command-empty");
  const CommandGroupPrimitive = createSimple("mock-command-group");
  const CommandSeparatorPrimitive = createSimple("mock-command-separator");

  CommandRoot.displayName = "Command";
  CommandRoot.Input = CommandInputPrimitive;
  CommandRoot.List = CommandListPrimitive;
  CommandRoot.Empty = CommandEmptyPrimitive;
  CommandRoot.Group = CommandGroupPrimitive;
  CommandRoot.Separator = CommandSeparatorPrimitive;
  CommandRoot.Item = CommandItemPrimitive;

  CommandInputPrimitive.displayName = "CommandInput";
  CommandListPrimitive.displayName = "CommandList";
  CommandEmptyPrimitive.displayName = "CommandEmpty";
  CommandGroupPrimitive.displayName = "CommandGroup";
  CommandSeparatorPrimitive.displayName = "CommandSeparator";
  CommandItemPrimitive.displayName = "CommandItem";

  return {
    __esModule: true,
    Command: CommandRoot as typeof CommandRoot & {
      Input: typeof CommandInputPrimitive;
      List: typeof CommandListPrimitive;
      Empty: typeof CommandEmptyPrimitive;
      Group: typeof CommandGroupPrimitive;
      Separator: typeof CommandSeparatorPrimitive;
      Item: typeof CommandItemPrimitive;
    },
  };
});

describe("Command primitives", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders Command with provided children", () => {
    render(
      <Command>
        <div data-testid="inside-command">content</div>
      </Command>
    );
    expect(screen.getByTestId("inside-command")).toBeInTheDocument();
  });

  it("CommandDialog wraps children inside a DialogContent", () => {
    render(
      <CommandDialog open>
        <div data-testid="dialog-child">dialog-child</div>
      </CommandDialog>
    );
    expect(screen.getByTestId("dialog")).toBeInTheDocument();
    expect(screen.getByTestId("dialog-content")).toBeInTheDocument();
    expect(screen.getByTestId("dialog-child")).toBeInTheDocument();
  });

  it("CommandInput renders inner input and search icon", () => {
    render(<CommandInput placeholder="Search..." />);
    expect(screen.getByTestId("search-icon")).toBeInTheDocument();
    const input = screen.getByPlaceholderText("Search...");
    expect(input).toBeInTheDocument();
  });

  it("CommandList, CommandEmpty, CommandGroup, CommandItem, CommandSeparator, CommandShortcut render correctly", () => {
    render(
      <Command>
        <CommandInput placeholder="type" />
        <CommandList>
          <CommandEmpty data-testid="empty">No results.</CommandEmpty>
          <CommandGroup heading="Group" data-testid="group">
            <CommandItem value="alpha" data-testid="item">
              Alpha
              <CommandShortcut data-testid="shortcut">⌘A</CommandShortcut>
            </CommandItem>
          </CommandGroup>
          <CommandSeparator data-testid="separator" />
        </CommandList>
      </Command>
    );

    expect(screen.getByTestId("empty")).toHaveTextContent("No results.");
    expect(screen.getByTestId("group")).toBeInTheDocument();
    expect(screen.getByTestId("item")).toHaveTextContent("Alpha");
    expect(screen.getByTestId("shortcut")).toHaveTextContent("⌘A");
    expect(screen.getByTestId("separator")).toBeInTheDocument();
  });

  it("CommandItem calls onSelect handler", async () => {
    const user = userEvent.setup();
    const handleSelect = vi.fn();
    render(
      <Command>
        <CommandList>
          <CommandItem onSelect={handleSelect} value="alpha">
            Select me
          </CommandItem>
        </CommandList>
      </Command>
    );

    await user.click(screen.getByText("Select me"));
    expect(handleSelect).toHaveBeenCalledWith("alpha");
  });
});
