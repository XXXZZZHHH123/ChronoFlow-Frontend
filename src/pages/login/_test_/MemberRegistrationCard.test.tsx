import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Swal from "sweetalert2";
import * as registrationApi from "@/api/registrationApi";
import { MemberRegistrationCard } from "../components/MemberRegistrationCard";

const prefill = {
  user_id: "U-001",
  organization_name: "ChronoFlow Group",
  email: "1111@acme.com",
} as const;

function renderComp(
  overrides?: Partial<React.ComponentProps<typeof MemberRegistrationCard>>
) {
  const onBack = overrides?.onBack ?? vi.fn();
  const fromInviteLink = overrides?.fromInviteLink ?? false;
  const p = overrides?.prefill ?? prefill;

  render(
    <MemberRegistrationCard
      onBack={onBack}
      fromInviteLink={fromInviteLink}
      prefill={p}
    />
  );

  const $ = {
    username: () => screen.getByLabelText(/username/i) as HTMLInputElement,
    password: () =>
      screen.getByPlaceholderText(/at least 8 characters/i) as HTMLInputElement,
    mobile: () => screen.getByLabelText(/mobile/i) as HTMLInputElement,
    submit: () =>
      screen.getByRole("button", { name: /create member account/i }),
  };

  return { onBack, $, prefill: p };
}

describe("MemberRegistrationCard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(Swal, "fire").mockResolvedValue({
      isConfirmed: true,
      isDenied: false,
      isDismissed: false,
      value: undefined,
      dismiss: undefined,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders read-only prefill fields and heading", () => {
    renderComp({ fromInviteLink: false });

    const orgInput = screen.getByLabelText(
      /organization name/i
    ) as HTMLInputElement;
    const emailInput = screen.getByLabelText(/email/i) as HTMLInputElement;

    expect(orgInput).toHaveValue("ChronoFlow Group");
    expect(emailInput).toHaveValue("1111@acme.com");
    expect(orgInput).toHaveAttribute("readonly");
    expect(emailInput).toHaveAttribute("readonly");
    expect(screen.getByText(/member registration/i)).toBeInTheDocument();
  });

  it("shows correct back link text depending on fromInviteLink", () => {
    renderComp({ fromInviteLink: false });
    expect(
      screen.getByRole("button", { name: /back to sign in/i })
    ).toBeInTheDocument();

    renderComp({ fromInviteLink: true });
    expect(
      screen.getByRole("button", { name: /go to sign in/i })
    ).toBeInTheDocument();
  });

  it("toggles password visibility using the eye button", async () => {
    renderComp();

    const pwdInput = screen.getByPlaceholderText(
      /at least 8 characters/i
    ) as HTMLInputElement;
    const toggleBtn = screen.getByRole("button", { name: /show password/i });

    expect(pwdInput.type).toBe("password");

    await userEvent.click(toggleBtn);
    expect(
      screen.getByRole("button", { name: /hide password/i })
    ).toBeInTheDocument();
    expect(pwdInput.type).toBe("text");

    await userEvent.click(
      screen.getByRole("button", { name: /hide password/i })
    );
    expect(pwdInput.type).toBe("password");
  });

  //validation of the ui
  it("shows required/invalid errors on empty submit; does not call API", async () => {
    const registerSpy = vi
      .spyOn(registrationApi, "registerMember")
      .mockResolvedValue(true);

    const { $ } = renderComp();

    await userEvent.click($.submit());

    // schema-driven messages
    expect(
      await screen.findByText(/username must be at least 6 characters/i)
    ).toBeInTheDocument();
    expect(
      await screen.findByText(/password must be at least 8 characters/i)
    ).toBeInTheDocument();
    expect(
      await screen.findByText(/invalid singapore mobile number/i)
    ).toBeInTheDocument();

    // aria-invalid for a11y
    expect($.username()).toHaveAttribute("aria-invalid", "true");
    expect($.password()).toHaveAttribute("aria-invalid", "true");
    expect($.mobile()).toHaveAttribute("aria-invalid", "true");

    // no API call on validation failure
    expect(registerSpy).not.toHaveBeenCalled();
  });

  it("rejects username shorter than 6 chars", async () => {
    const registerSpy = vi
      .spyOn(registrationApi, "registerMember")
      .mockResolvedValue(true);

    const { $ } = renderComp();

    await userEvent.type($.username(), "abc"); // too short
    await userEvent.type($.password(), "password123"); // valid length
    await userEvent.type($.mobile(), "+6591234567"); // valid SG mobile
    await userEvent.click($.submit());

    expect(
      await screen.findByText(/username must be at least 6 characters/i)
    ).toBeInTheDocument();
    expect(registerSpy).not.toHaveBeenCalled();
  });

  it("rejects username with illegal characters", async () => {
    const registerSpy = vi
      .spyOn(registrationApi, "registerMember")
      .mockResolvedValue(true);

    const { $ } = renderComp();

    await userEvent.type($.username(), "bad$name"); // '$' not allowed
    await userEvent.type($.password(), "password123");
    await userEvent.type($.mobile(), "+6591234567");
    await userEvent.click($.submit());

    expect(
      await screen.findByText(/only letters, numbers, dot, underscore, hyphen/i)
    ).toBeInTheDocument();
    expect(registerSpy).not.toHaveBeenCalled();
  });

  it("rejects password shorter than 8 chars", async () => {
    const registerSpy = vi
      .spyOn(registrationApi, "registerMember")
      .mockResolvedValue(true);

    const { $ } = renderComp();

    await userEvent.type($.username(), "valid_1");
    await userEvent.type($.password(), "1234567");
    await userEvent.type($.mobile(), "+6591234567");
    await userEvent.click($.submit());

    expect(
      await screen.findByText(/password must be at least 8 characters/i)
    ).toBeInTheDocument();
    expect(registerSpy).not.toHaveBeenCalled();
  });

  it("rejects invalid Singapore mobile numbers", async () => {
    const registerSpy = vi
      .spyOn(registrationApi, "registerMember")
      .mockResolvedValue(true);

    const { $ } = renderComp();

    await userEvent.type($.username(), "valid_1");
    await userEvent.type($.password(), "password123");
    await userEvent.type($.mobile(), "71234567");
    await userEvent.click($.submit());

    expect(
      await screen.findByText(/invalid singapore mobile number/i)
    ).toBeInTheDocument();
    expect(registerSpy).not.toHaveBeenCalled();
  });

  it("trims username and mobile before submission; calls API with trimmed payload", async () => {
    const registerSpy = vi
      .spyOn(registrationApi, "registerMember")
      .mockResolvedValue(true);
    const onBack = vi.fn();

    const { $, prefill } = renderComp({ onBack });

    await userEvent.type($.username(), "   jane.doe   ");
    await userEvent.type($.password(), "password123");
    await userEvent.type($.mobile(), "   +6591234567   ");
    await userEvent.click($.submit());

    expect(registerSpy).toHaveBeenCalledTimes(1);
    expect(registerSpy).toHaveBeenCalledWith({
      user_id: prefill.user_id,
      user_name: "jane.doe",
      user_password: "password123",
      user_mobile: "+6591234567",
    });
  });
});
