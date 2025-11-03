"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface LinearMeterProps {
  value: number
  min?: number
  max?: number
  label?: string
  unit?: string
  orientation?: "horizontal" | "vertical"
  height?: number
  width?: number
  color?: string
  backgroundColor?: string
  showValue?: boolean
  showScale?: boolean
  thresholds?: { value: number; color: string }[]
  className?: string
}

export function LinearMeter({
  value,
  min = 0,
  max = 100,
  label,
  unit = "",
  orientation = "horizontal",
  height = 24,
  width = 200,
  color = "hsl(var(--primary))",
  backgroundColor = "hsl(var(--muted))",
  showValue = true,
  showScale = false,
  thresholds = [],
  className,
}: LinearMeterProps) {
  const percentage = ((value - min) / (max - min)) * 100
  const clampedPercentage = Math.max(0, Math.min(100, percentage))

  // Determine color based on thresholds
  const activeColor = React.useMemo(() => {
    const sortedThresholds = [...thresholds].sort((a, b) => b.value - a.value)
    for (const threshold of sortedThresholds) {
      if (value >= threshold.value) {
        return threshold.color
      }
    }
    return color
  }, [value, thresholds, color])

  const isVertical = orientation === "vertical"

  return (
    <div className={cn("flex gap-2", isVertical ? "flex-col items-center" : "items-center", className)}>
      {label && !isVertical && <span className="text-sm font-medium min-w-24">{label}</span>}
      <div
        className="relative rounded-full overflow-hidden"
        style={{
          width: isVertical ? height : width,
          height: isVertical ? width : height,
          backgroundColor,
        }}
      >
        <div
          className="absolute transition-all duration-300 ease-out"
          style={{
            backgroundColor: activeColor,
            ...(isVertical
              ? {
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height: `${clampedPercentage}%`,
                }
              : {
                  top: 0,
                  left: 0,
                  bottom: 0,
                  width: `${clampedPercentage}%`,
                }),
          }}
        />
        {showScale && (
          <div className="absolute inset-0 flex items-center justify-around">
            {[25, 50, 75].map((tick) => (
              <div
                key={tick}
                className="w-px h-2 bg-background/50"
                style={isVertical ? { width: "50%", height: "1px" } : {}}
              />
            ))}
          </div>
        )}
      </div>
      {showValue && (
        <span className="text-sm font-mono tabular-nums min-w-16 text-right">
          {value.toFixed(1)} {unit}
        </span>
      )}
      {label && isVertical && <span className="text-sm font-medium">{label}</span>}
    </div>
  )
}
