"use client"
import { cn } from "@/lib/utils"

interface RadialGaugeProps {
  value: number
  min?: number
  max?: number
  label?: string
  unit?: string
  size?: number
  thickness?: number
  color?: string
  backgroundColor?: string
  showValue?: boolean
  className?: string
}

export function RadialGauge({
  value,
  min = 0,
  max = 100,
  label,
  unit = "",
  size = 120,
  thickness = 12,
  color = "hsl(var(--primary))",
  backgroundColor = "hsl(var(--muted))",
  showValue = true,
  className,
}: RadialGaugeProps) {
  const percentage = ((value - min) / (max - min)) * 100
  const radius = (size - thickness) / 2
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (percentage / 100) * circumference

  return (
    <div className={cn("inline-flex flex-col items-center gap-2", className)}>
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="rotate-[-90deg]">
          {/* Background circle */}
          <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={backgroundColor} strokeWidth={thickness} />
          {/* Progress circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={thickness}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-500 ease-out"
          />
        </svg>
        {showValue && (
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-bold">{value.toFixed(0)}</span>
            {unit && <span className="text-xs text-muted-foreground">{unit}</span>}
          </div>
        )}
      </div>
      {label && <span className="text-sm font-medium">{label}</span>}
    </div>
  )
}
