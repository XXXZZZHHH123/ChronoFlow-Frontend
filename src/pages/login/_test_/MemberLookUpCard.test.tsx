import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemberLookupCard } from "../components/MemberLookUpCard";

describe("MemberLookupCard", () => {
  const setup = (opts?: {
    onSearch?: Parameters<typeof MemberLookupCard>[0]["onSearch"];
    onBack?: () => void;
  }) => {
    const onSearch = opts?.onSearch ?? vi.fn().mockResolvedValue(null);
    const onBack = opts?.onBack ?? vi.fn();

    render(<MemberLookupCard onBack={onBack} onSearch={onSearch} />);
    const orgInput = screen.getByLabelText(
      /organisation id/i
    ) as HTMLInputElement;
    const userInput = screen.getByLabelText(/user id/i) as HTMLInputElement;
    const submitBtn = screen.getByRole("button", { name: /look up/i });
    const backBtn = screen.getByRole("button", { name: /back to sign in/i });

    return { onSearch, onBack, orgInput, userInput, submitBtn, backBtn };
  };

  it("renders labels and inputs", () => {
    const { orgInput, userInput, submitBtn, backBtn } = setup();

    expect(screen.getByText(/find your invitation/i)).toBeInTheDocument();
    expect(
      screen.getByText(/enter your organisation id and user id/i)
    ).toBeInTheDocument();

    expect(orgInput).toBeInTheDocument();
    expect(userInput).toBeInTheDocument();
    expect(submitBtn).toBeInTheDocument();
    expect(backBtn).toBeInTheDocument();
  });

  it("shows validation errors when submitted empty", async () => {
    const { submitBtn } = setup();

    await userEvent.click(submitBtn);

    // Zod schema messages
    expect(
      await screen.findByText(/organisation id is required/i)
    ).toBeInTheDocument();
    expect(await screen.findByText(/user id is required/i)).toBeInTheDocument();

    // aria-invalid flags should be true
    expect(screen.getByLabelText(/organisation id/i)).toHaveAttribute(
      "aria-invalid",
      "true"
    );
    expect(screen.getByLabelText(/user id/i)).toHaveAttribute(
      "aria-invalid",
      "true"
    );
  });

  it("calls onSearch with trimmed values", async () => {
    const onSearch = vi.fn().mockResolvedValue(null);
    const { orgInput, userInput, submitBtn } = setup({ onSearch });

    await userEvent.type(orgInput, "   ORG-123   ");
    await userEvent.type(userInput, "   user-456   ");
    await userEvent.click(submitBtn);

    await waitFor(() => {
      expect(onSearch).toHaveBeenCalledTimes(1);
    });

    // Because zod schema uses .trim(), the values passed to onSearch are trimmed
    expect(onSearch).toHaveBeenCalledWith({
      organisation_id: "ORG-123",
      user_id: "user-456",
    });
  });

  it("shows loading text while submitting and reverts after resolved", async () => {
    let resolvePromise: () => void;
    const pending = new Promise<null>((res) => {
      resolvePromise = () => res(null);
    });

    const onSearch = vi.fn().mockReturnValue(pending);

    const { orgInput, userInput, submitBtn } = setup({ onSearch });

    await userEvent.type(orgInput, "ORG");
    await userEvent.type(userInput, "USER");

    // Start submit
    await userEvent.click(submitBtn);

    // Button should show loading state
    expect(screen.getByRole("button", { name: /looking up…/i })).toBeDisabled();

    // Resolve submission
    resolvePromise!();

    // After resolve, button returns to normal
    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: /look up/i })
      ).not.toBeDisabled();
    });
  });

  it("handles onSearch rejection gracefully", async () => {
    const onSearch = vi.fn().mockRejectedValue(new Error("Lookup failed"));

    const { orgInput, userInput, submitBtn } = setup({ onSearch });

    await userEvent.type(orgInput, "ORG-ERR");
    await userEvent.type(userInput, "USER-ERR");
    await userEvent.click(submitBtn);

    // onSearch should still be called
    await waitFor(() => {
      expect(onSearch).toHaveBeenCalledTimes(1);
    });

    // Button should return to normal after rejection
    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: /look up/i })
      ).not.toBeDisabled();
    });
  });

  it("invokes onBack when clicking 'Back to sign in'", async () => {
    const onBack = vi.fn();
    const { backBtn } = setup({ onBack });

    await userEvent.click(backBtn);
    expect(onBack).toHaveBeenCalledTimes(1);
  });
});
