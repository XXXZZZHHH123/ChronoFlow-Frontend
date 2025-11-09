import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

vi.mock("@radix-ui/react-scroll-area", () => {
  const Root = ({
    children,
    className,
    ...rest
  }: React.HTMLAttributes<HTMLDivElement> & { children?: React.ReactNode }) => (
    <div data-testid="root" className={className} {...rest}>
      {children}
    </div>
  );
  const Viewport = ({
    children,
    className,
    ...rest
  }: React.HTMLAttributes<HTMLDivElement> & { children?: React.ReactNode }) => (
    <div data-testid="viewport" className={className} {...rest}>
      {children}
    </div>
  );
  const ScrollAreaScrollbar = ({
    children,
    className,
    orientation,
    ...rest
  }: React.HTMLAttributes<HTMLDivElement> & {
    children?: React.ReactNode;
    orientation?: "horizontal" | "vertical";
  }) => (
    <div
      data-testid={`scrollbar-${orientation ?? "vertical"}`}
      className={className}
      {...rest}
    >
      {children}
    </div>
  );
  const ScrollAreaThumb = ({
    className,
    ...rest
  }: React.HTMLAttributes<HTMLDivElement>) => (
    <div data-testid="thumb" className={className} {...rest} />
  );
  const Corner = () => <div data-testid="corner" />;

  return {
    __esModule: true,
    Root,
    Viewport,
    ScrollAreaScrollbar,
    ScrollAreaThumb,
    Corner,
  };
});

describe("ScrollArea", () => {
  it("renders structural elements with the expected data slots", () => {
    render(
      <ScrollArea className="custom-class">
        <div>content</div>
      </ScrollArea>
    );

    const root = screen.getByTestId("root");
    expect(root).toHaveAttribute("data-slot", "scroll-area");
    expect(root).toHaveClass("custom-class");

    expect(screen.getByTestId("viewport")).toHaveAttribute(
      "data-slot",
      "scroll-area-viewport"
    );
    expect(screen.getByTestId("scrollbar-vertical")).toHaveAttribute(
      "data-slot",
      "scroll-area-scrollbar"
    );
    expect(screen.getByTestId("thumb")).toHaveAttribute(
      "data-slot",
      "scroll-area-thumb"
    );
    expect(screen.getByTestId("corner")).toBeInTheDocument();
  });
});

describe("ScrollBar", () => {
  it("uses vertical orientation by default", () => {
    render(<ScrollBar />);
    expect(screen.getByTestId("scrollbar-vertical")).toHaveClass("h-full");
  });

  it("applies horizontal layout when requested", () => {
    render(<ScrollBar orientation="horizontal" />);
    expect(screen.getByTestId("scrollbar-horizontal")).toHaveClass("flex-col");
  });
});
