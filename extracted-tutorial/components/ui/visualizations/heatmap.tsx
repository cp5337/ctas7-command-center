"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface HeatmapCell {
  x: number
  y: number
  value: number
  label?: string
}

interface HeatmapProps {
  data: HeatmapCell[]
  width?: number
  height?: number
  cellSize?: number
  gap?: number
  colorScale?: string[]
  showLabels?: boolean
  showTooltip?: boolean
  className?: string
}

export function Heatmap({
  data,
  width = 400,
  height = 300,
  cellSize = 20,
  gap = 2,
  colorScale = ["#1e293b", "#38bdf8", "#0ea5e9", "#0284c7", "#0369a1"],
  showLabels = false,
  showTooltip = true,
  className,
}: HeatmapProps) {
  const [hoveredCell, setHoveredCell] = React.useState<HeatmapCell | null>(null)
  const [tooltipPos, setTooltipPos] = React.useState({ x: 0, y: 0 })

  const minValue = Math.min(...data.map((d) => d.value))
  const maxValue = Math.max(...data.map((d) => d.value))

  const getColor = (value: number) => {
    const normalized = (value - minValue) / (maxValue - minValue || 1)
    const index = Math.floor(normalized * (colorScale.length - 1))
    return colorScale[Math.max(0, Math.min(colorScale.length - 1, index))]
  }

  const handleMouseEnter = (cell: HeatmapCell, event: React.MouseEvent) => {
    setHoveredCell(cell)
    setTooltipPos({ x: event.clientX, y: event.clientY })
  }

  return (
    <div className={cn("relative", className)}>
      <svg width={width} height={height}>
        {data.map((cell, index) => (
          <g key={index}>
            <rect
              x={cell.x * (cellSize + gap)}
              y={cell.y * (cellSize + gap)}
              width={cellSize}
              height={cellSize}
              fill={getColor(cell.value)}
              className="transition-opacity hover:opacity-80 cursor-pointer"
              onMouseEnter={(e) => handleMouseEnter(cell, e)}
              onMouseLeave={() => setHoveredCell(null)}
            />
            {showLabels && cell.label && (
              <text
                x={cell.x * (cellSize + gap) + cellSize / 2}
                y={cell.y * (cellSize + gap) + cellSize / 2}
                textAnchor="middle"
                dominantBaseline="middle"
                className="text-xs fill-white pointer-events-none"
              >
                {cell.label}
              </text>
            )}
          </g>
        ))}
      </svg>
      {showTooltip && hoveredCell && (
        <div
          className="fixed z-50 rounded-lg border bg-popover px-3 py-2 text-sm shadow-md"
          style={{
            left: tooltipPos.x + 10,
            top: tooltipPos.y + 10,
          }}
        >
          <div className="font-medium">{hoveredCell.label || `(${hoveredCell.x}, ${hoveredCell.y})`}</div>
          <div className="text-muted-foreground">Value: {hoveredCell.value.toFixed(2)}</div>
        </div>
      )}
    </div>
  )
}
