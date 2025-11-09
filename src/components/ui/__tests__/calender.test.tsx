import React from "react";
import { render } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { Calendar } from "@/components/ui/calendar";

const dayPickerSpy = vi.hoisted(() => vi.fn());

// Mock button to avoid relying on styling details
vi.mock("@/components/ui/button", () => {
  const Button = React.forwardRef<
    HTMLButtonElement,
    React.ButtonHTMLAttributes<HTMLButtonElement>
  >((props, ref) => <button ref={ref} {...props} />);
  const buttonVariants = () => "btn";
  return { Button, buttonVariants };
});

vi.mock("react-day-picker", () => {
  const mockClassNames = {
    root: "root",
    months: "months",
    month: "month",
    nav: "nav",
    button_previous: "btn-prev",
    button_next: "btn-next",
    month_caption: "month-caption",
    dropdowns: "dropdowns",
    dropdown_root: "dropdown-root",
    dropdown: "dropdown",
    caption_label: "caption-label",
    weekdays: "weekdays",
    weekday: "weekday",
    week: "week",
    week_number_header: "week-number-header",
    week_number: "week-number",
    day: "day",
    range_start: "range-start",
    range_middle: "range-middle",
    range_end: "range-end",
    today: "today",
    outside: "outside",
    disabled: "disabled",
    hidden: "hidden",
  };

  function mockDayPicker(props: Record<string, unknown>): React.ReactElement {
    dayPickerSpy(props);
    const { children, className } = props as {
      children?: React.ReactNode;
      className?: string;
    };
    return (
      <div data-testid="day-picker" className={className}>
        {children}
      </div>
    );
  }

  const DayButton = React.forwardRef<
    HTMLButtonElement,
    React.ButtonHTMLAttributes<HTMLButtonElement>
  >((props, ref) => <button ref={ref} {...props} />);

  return {
    DayPicker: mockDayPicker,
    DayButton,
    getDefaultClassNames: () => mockClassNames,
  };
});

describe("Calendar", () => {
  beforeEach(() => {
    dayPickerSpy.mockClear();
  });

  it("passes default props and classNames to DayPicker", () => {
    render(<Calendar />);
    const props = dayPickerSpy.mock.calls.at(-1)?.[0] as Record<
      string,
      unknown
    >;

    expect(props?.showOutsideDays).toBe(true);
    expect(props?.captionLayout).toBe("label");
    expect(typeof props?.className).toBe("string");

    const classNames = (props?.classNames ?? {}) as Record<string, string>;
    expect(classNames.root).toContain("w-fit");
    expect(classNames.button_previous).toContain("btn");
  });

  it("merges custom formatters and components", () => {
    const customFormatter = vi.fn().mockReturnValue("Short");
    const CustomDayButton = () => <div>custom day</div>;

    render(
      <Calendar
        formatters={{ formatMonthDropdown: customFormatter }}
        components={{ DayButton: CustomDayButton }}
      />
    );

    const props = dayPickerSpy.mock.calls.at(-1)?.[0] as Record<
      string,
      unknown
    >;
    const formatters = props?.formatters as {
      formatMonthDropdown?: (date: Date) => string;
    };
    expect(formatters?.formatMonthDropdown?.(new Date())).toBe("Short");

    const components = props?.components as Record<string, unknown>;
    expect(components?.DayButton).toBe(CustomDayButton);
  });
});
