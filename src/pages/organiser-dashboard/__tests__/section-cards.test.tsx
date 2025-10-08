import { describe, expect, it } from "vitest"
import { render, screen, within } from "@testing-library/react"
import { IconClockHour4 } from "@tabler/icons-react"
import { SectionCards, type SummaryMetric } from "../components/section-cards"

const sampleMetrics: SummaryMetric[] = [
  {
    title: "Total Events",
    description: "One",
    value: "5",
    icon: <IconClockHour4 data-testid="icon-total" />,
    badge: "Active",
    badgeTone: "up",
  },
  {
    title: "Registrations",
    description: "Two",
    value: "123",
    icon: <IconClockHour4 data-testid="icon-registrations" />,
    badge: "Across 3 events",
    badgeClassName: "text-purple-500",
  },
]

describe("SectionCards", () => {
  it("renders a card for each metric with badge styling", () => {
    render(<SectionCards metrics={sampleMetrics} />)

    const cards = screen.getAllByTestId("card")
    expect(cards).toHaveLength(sampleMetrics.length)

    const firstCard = cards[0]
    expect(within(firstCard).getByText("Total Events")).toBeInTheDocument()
    expect(within(firstCard).getByText("5")).toBeInTheDocument()
    const upBadge = within(firstCard).getByText("Active")
    expect(upBadge.className).toMatch(/text-green-600/)

    const secondCard = cards[1]
    expect(within(secondCard).getByText("Registrations")).toBeInTheDocument()
    expect(within(secondCard).getByText("123")).toBeInTheDocument()
    const purpleBadge = within(secondCard).getByText("Across 3 events")
    expect(purpleBadge.className).toMatch(/text-purple-500/)
  })

  it("omits the badge when not provided", () => {
    const metrics = [
      {
        title: "Open Tasks",
        description: "No badge metric",
        value: "0",
        icon: <IconClockHour4 data-testid="icon-open" />,
      },
    ] satisfies SummaryMetric[]

    render(<SectionCards metrics={metrics} />)

    const card = screen.getByTestId("card")
    expect(within(card).queryByTestId("badge")).not.toBeInTheDocument()
  })
})
