import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import RequireAuth from "../require-auth";

type NavigateProps = { to: string; replace?: boolean };

const authState = vi.hoisted(() => ({
  user: null as null | {
    id: string;
    name: string;
    email: string;
    role: string;
  },
}));

const useAuthStoreMock = vi.hoisted(() =>
  vi.fn((selector: (state: typeof authState) => unknown) => selector(authState))
);

const navigateCalls = vi.hoisted(() => [] as NavigateProps[]);

vi.mock("@/stores/authStore", () => ({
  useAuthStore: (selector: (state: typeof authState) => unknown) =>
    useAuthStoreMock(selector),
}));

vi.mock("react-router-dom", () => ({
  Navigate: (props: NavigateProps) => {
    navigateCalls.push(props);
    return (
      <div data-testid="navigate" data-to={props.to} data-replace={props.replace}>
        navigate
      </div>
    );
  },
  Outlet: () => <div data-testid="outlet">outlet</div>,
}));

describe("RequireAuth", () => {
  beforeEach(() => {
    authState.user = null;
    useAuthStoreMock.mockClear();
    navigateCalls.length = 0;
  });

  it("redirects anonymous visitors to /login", () => {
    render(<RequireAuth />);

    expect(useAuthStoreMock).toHaveBeenCalledWith(expect.any(Function));
    expect(screen.getByTestId("navigate")).toBeInTheDocument();
    expect(navigateCalls[0]).toMatchObject({ to: "/login", replace: true });
  });

  it("renders the nested routes when an authenticated user exists", () => {
    authState.user = {
      id: "1",
      name: "Test User",
      email: "test@example.com",
      role: "admin",
    };

    render(<RequireAuth />);

    expect(screen.getByTestId("outlet")).toBeInTheDocument();
    expect(navigateCalls).toHaveLength(0);
  });
});
