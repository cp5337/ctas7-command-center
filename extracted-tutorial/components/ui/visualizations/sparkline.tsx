"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface SparklineProps {
  data: number[]
  width?: number
  height?: number
  color?: string
  fillColor?: string
  strokeWidth?: number
  showDots?: boolean
  className?: string
}

export function Sparkline({
  data,
  width = 100,
  height = 30,
  color = "hsl(var(--primary))",
  fillColor,
  strokeWidth = 2,
  showDots = false,
  className,
}: SparklineProps) {
  const points = React.useMemo(() => {
    if (data.length === 0) return ""

    const min = Math.min(...data)
    const max = Math.max(...data)
    const range = max - min || 1

    return data
      .map((value, index) => {
        const x = (index / (data.length - 1)) * width
        const y = height - ((value - min) / range) * height
        return `${x},${y}`
      })
      .join(" ")
  }, [data, width, height])

  const pathD = React.useMemo(() => {
    if (!points) return ""
    const pointsArray = points.split(" ")
    if (pointsArray.length === 0) return ""

    let path = `M ${pointsArray[0]}`
    for (let i = 1; i < pointsArray.length; i++) {
      path += ` L ${pointsArray[i]}`
    }
    return path
  }, [points])

  const fillPathD = React.useMemo(() => {
    if (!pathD || !fillColor) return ""
    return `${pathD} L ${width},${height} L 0,${height} Z`
  }, [pathD, fillColor, width, height])

  return (
    <svg width={width} height={height} className={cn("inline-block", className)}>
      {fillColor && <path d={fillPathD} fill={fillColor} opacity={0.2} />}
      <path
        d={pathD}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {showDots &&
        points.split(" ").map((point, index) => {
          const [x, y] = point.split(",").map(Number)
          return <circle key={index} cx={x} cy={y} r={2} fill={color} />
        })}
    </svg>
  )
}
