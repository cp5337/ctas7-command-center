"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { Sparkline } from "./sparkline"

interface StatusMetric {
  label: string
  value: string | number
  unit?: string
  status?: "success" | "warning" | "error" | "info"
  trend?: number[]
  change?: number
}

interface StatusPanelProps {
  title: string
  metrics: StatusMetric[]
  status?: "operational" | "degraded" | "offline"
  lastUpdate?: Date
  className?: string
}

export function StatusPanel({ title, metrics, status = "operational", lastUpdate, className }: StatusPanelProps) {
  const statusColors = {
    operational: "bg-green-500/10 text-green-500 border-green-500/20",
    degraded: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
    offline: "bg-red-500/10 text-red-500 border-red-500/20",
  }

  const metricStatusColors = {
    success: "text-green-500",
    warning: "text-yellow-500",
    error: "text-red-500",
    info: "text-blue-500",
  }

  return (
    <Card className={cn("", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">{title}</CardTitle>
          <Badge variant="outline" className={cn("text-xs", statusColors[status])}>
            {status}
          </Badge>
        </div>
        {lastUpdate && <p className="text-xs text-muted-foreground">Updated {lastUpdate.toLocaleTimeString()}</p>}
      </CardHeader>
      <CardContent className="space-y-3">
        {metrics.map((metric, index) => (
          <div key={index} className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">{metric.label}</p>
              <div className="flex items-baseline gap-2">
                <span
                  className={cn("text-2xl font-bold tabular-nums", metric.status && metricStatusColors[metric.status])}
                >
                  {metric.value}
                </span>
                {metric.unit && <span className="text-sm text-muted-foreground">{metric.unit}</span>}
                {metric.change !== undefined && (
                  <span className={cn("text-xs", metric.change >= 0 ? "text-green-500" : "text-red-500")}>
                    {metric.change >= 0 ? "+" : ""}
                    {metric.change.toFixed(1)}%
                  </span>
                )}
              </div>
            </div>
            {metric.trend && metric.trend.length > 0 && (
              <Sparkline
                data={metric.trend}
                width={60}
                height={24}
                color={metric.status ? `hsl(var(--${metric.status}))` : "hsl(var(--primary))"}
              />
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
