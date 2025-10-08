import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { GroupsSpotlight } from "../groups-spotlight";
import type { MemberDashboardGroup } from "@/lib/validation/schema";

const buildGroup = (overrides: Partial<MemberDashboardGroup> = {}): MemberDashboardGroup => ({
  id: "group-1",
  name: "Alpha Team",
  sort: 0,
  leadUserId: "leader-1",
  leadUserName: "",
  remark: null,
  status: 0,
  event: {
    id: "event-1",
    name: "Launch Event",
    description: null,
    organizerId: null,
    location: "Main Hall",
    status: 0,
    startTime: new Date("2024-04-01T10:00:00Z"),
    endTime: new Date("2024-04-01T12:00:00Z"),
    remark: null,
    joiningParticipants: 50,
    groups: [],
    taskStatus: { total: 5, remaining: 2, completed: 3 },
  },
  ...overrides,
});

describe("GroupsSpotlight", () => {
  it("shows empty state when there are no groups", () => {
    render(<GroupsSpotlight groups={[]} />);

    expect(
      screen.getByText("You're not assigned to any groups yet. Once organisers add you to a team, it will show up here.")
    ).toBeInTheDocument();
  });

  it("renders group details with leader lookup and badges", () => {
    const groups = [buildGroup()];

    render(
      <GroupsSpotlight
        groups={groups}
        leaderNameLookup={{ "leader-1": "Jane Leader" }}
      />
    );

    expect(screen.getByText("Group Participation")).toBeInTheDocument();
    expect(screen.getByText("Alpha Team")).toBeInTheDocument();
    expect(screen.getByText("Jane Leader")).toBeInTheDocument();
    expect(screen.getByText("Launch Event")).toBeInTheDocument();
    expect(screen.getByText("Active")).toBeInTheDocument();
    expect(screen.getByText("Starts:")).toBeInTheDocument();
    expect(screen.getByText("Ends:")).toBeInTheDocument();
  });
});
