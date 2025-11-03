"use client"
import { Line, LineChart, Area, AreaChart, XAxis, YAxis, CartesianGrid } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart"
import { cn } from "@/lib/utils"

interface TelemetryDataPoint {
  timestamp: number
  value: number
  label?: string
}

interface TelemetryChartProps {
  data: TelemetryDataPoint[]
  title?: string
  unit?: string
  color?: string
  variant?: "line" | "area"
  showGrid?: boolean
  height?: number
  thresholds?: { value: number; label: string; color: string }[]
  className?: string
}

export function TelemetryChart({
  data,
  title,
  unit = "",
  color = "hsl(var(--chart-1))",
  variant = "line",
  showGrid = true,
  height = 300,
  thresholds = [],
  className,
}: TelemetryChartProps) {
  const chartConfig = {
    value: {
      label: title || "Value",
      color,
    },
  } satisfies ChartConfig

  const ChartComponent = variant === "area" ? AreaChart : LineChart
  const DataComponent = variant === "area" ? Area : Line

  return (
    <div className={cn("w-full", className)}>
      {title && (
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-sm font-medium">{title}</h3>
          {unit && <span className="text-xs text-muted-foreground">{unit}</span>}
        </div>
      )}
      <ChartContainer config={chartConfig} className="w-full" style={{ height }}>
        <ChartComponent data={data}>
          {showGrid && <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />}
          <XAxis
            dataKey="timestamp"
            tickFormatter={(value) => new Date(value).toLocaleTimeString()}
            className="text-xs"
          />
          <YAxis className="text-xs" />
          <ChartTooltip
            content={
              <ChartTooltipContent
                labelFormatter={(value) => new Date(value as number).toLocaleString()}
                formatter={(value) => [`${value} ${unit}`, "Value"]}
              />
            }
          />
          <DataComponent
            type="monotone"
            dataKey="value"
            stroke={color}
            fill={variant === "area" ? color : undefined}
            fillOpacity={variant === "area" ? 0.2 : undefined}
            strokeWidth={2}
            dot={false}
          />
          {thresholds.map((threshold, index) => (
            <Line
              key={index}
              type="monotone"
              dataKey={() => threshold.value}
              stroke={threshold.color}
              strokeDasharray="5 5"
              strokeWidth={1}
              dot={false}
            />
          ))}
        </ChartComponent>
      </ChartContainer>
    </div>
  )
}
