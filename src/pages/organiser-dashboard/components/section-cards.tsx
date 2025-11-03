import type { ReactNode } from "react"

import { Badge } from "@/components/ui/badge"
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

export type SummaryMetric = {
  title: string
  description: string
  icon: ReactNode
  value: string
  badge?: string
  badgeTone?: "up" | "down"
  badgeClassName?: string
}

type SectionCardsProps = {
  metrics: SummaryMetric[]
}

export function SectionCards({ metrics }: SectionCardsProps) {
  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs md:grid-cols-2 xl:grid-cols-4">
      {metrics.map((metric) => (
        <Card key={metric.title} className="@container/card" data-testid="card">
          <CardHeader className="gap-2">
            <CardDescription className="flex items-center gap-2 text-sm font-medium leading-none">
              {metric.icon}
              <span>{metric.title}</span>
            </CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
              {metric.value}
            </CardTitle>
            {metric.badge ? (
              <div className="flex" data-testid="badge">
                <Badge
                  variant="outline"
                  className={cn(
                    metric.badgeTone === "up"
                      ? "text-green-600"
                      : metric.badgeTone === "down"
                        ? "text-red-500"
                        : undefined,
                    metric.badgeClassName
                  )}
                >
                  {metric.badge}
                </Badge>
              </div>
            ) : null}
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1.5 text-sm text-muted-foreground">
            <p className="leading-relaxed">{metric.description}</p>
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}
