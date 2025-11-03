"use client"

import * as React from "react"
import { TelemetryChart } from "@/components/ui/visualizations/telemetry-chart"
import { RadialGauge } from "@/components/ui/visualizations/radial-gauge"
import { LinearMeter } from "@/components/ui/visualizations/linear-meter"
import { Sparkline } from "@/components/ui/visualizations/sparkline"
import { StatusPanel } from "@/components/ui/visualizations/status-panel"
import { Heatmap } from "@/components/ui/visualizations/heatmap"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function VisualizationsPage() {
  // Generate sample telemetry data
  const telemetryData = React.useMemo(() => {
    const now = Date.now()
    return Array.from({ length: 50 }, (_, i) => ({
      timestamp: now - (50 - i) * 60000,
      value: 50 + Math.sin(i / 5) * 20 + Math.random() * 10,
    }))
  }, [])

  const sparklineData = [45, 52, 48, 65, 72, 68, 75, 82, 78, 85, 90, 88]

  const heatmapData = React.useMemo(() => {
    const data: Array<{ x: number; y: number; value: number; label?: string }> = []
    for (let x = 0; x < 15; x++) {
      for (let y = 0; y < 10; y++) {
        data.push({
          x,
          y,
          value: Math.random() * 100,
          label: `${x},${y}`,
        })
      }
    }
    return data
  }, [])

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div>
        <h1 className="text-4xl font-bold mb-2">Data Visualizations</h1>
        <p className="text-muted-foreground">
          Comprehensive visualization components for satellite telemetry and industrial dashboards
        </p>
      </div>

      {/* Telemetry Charts */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Telemetry Charts</h2>
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Line Chart</CardTitle>
              <CardDescription>Real-time signal strength monitoring</CardDescription>
            </CardHeader>
            <CardContent>
              <TelemetryChart
                data={telemetryData}
                title="Signal Strength"
                unit="dBm"
                variant="line"
                color="hsl(var(--chart-1))"
                thresholds={[
                  { value: 70, label: "Warning", color: "hsl(var(--warning))" },
                  { value: 40, label: "Critical", color: "hsl(var(--destructive))" },
                ]}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Area Chart</CardTitle>
              <CardDescription>Bandwidth utilization over time</CardDescription>
            </CardHeader>
            <CardContent>
              <TelemetryChart
                data={telemetryData}
                title="Bandwidth"
                unit="Mbps"
                variant="area"
                color="hsl(var(--chart-2))"
              />
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Gauges */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Radial Gauges</h2>
        <Card>
          <CardHeader>
            <CardTitle>System Metrics</CardTitle>
            <CardDescription>Circular progress indicators for key metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-8 justify-center">
              <RadialGauge value={85} label="Signal Quality" unit="%" color="hsl(var(--chart-1))" />
              <RadialGauge value={62} label="Battery" unit="%" color="hsl(var(--chart-2))" />
              <RadialGauge value={42} label="Fuel" unit="%" color="hsl(var(--warning))" />
              <RadialGauge value={15} label="Storage" unit="GB" max={200} color="hsl(var(--destructive))" />
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Linear Meters */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Linear Meters</h2>
        <Card>
          <CardHeader>
            <CardTitle>Horizontal Meters</CardTitle>
            <CardDescription>Linear progress indicators with threshold colors</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <LinearMeter
              value={85}
              label="CPU Usage"
              unit="%"
              thresholds={[
                { value: 80, color: "hsl(var(--destructive))" },
                { value: 60, color: "hsl(var(--warning))" },
              ]}
            />
            <LinearMeter value={42} label="Memory" unit="GB" max={64} showScale />
            <LinearMeter value={1250} label="Network" unit="Mbps" max={2000} color="hsl(var(--chart-2))" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Vertical Meters</CardTitle>
            <CardDescription>Vertical orientation for compact displays</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-8 justify-center">
              <LinearMeter value={75} label="Temp" unit="°C" max={100} orientation="vertical" width={300} />
              <LinearMeter value={45} label="Pressure" unit="PSI" max={100} orientation="vertical" width={300} />
              <LinearMeter value={92} label="Altitude" unit="km" max={100} orientation="vertical" width={300} />
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Sparklines */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Sparklines</h2>
        <Card>
          <CardHeader>
            <CardTitle>Compact Trend Indicators</CardTitle>
            <CardDescription>Inline mini-charts for quick trend visualization</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium min-w-32">Signal Strength:</span>
              <Sparkline data={sparklineData} width={120} height={30} color="hsl(var(--chart-1))" />
              <span className="text-sm text-muted-foreground">+12.5%</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium min-w-32">Latency:</span>
              <Sparkline
                data={[120, 115, 125, 110, 105, 100, 95, 90, 85, 80, 75, 70]}
                width={120}
                height={30}
                color="hsl(var(--chart-2))"
                fillColor="hsl(var(--chart-2))"
              />
              <span className="text-sm text-green-500">-41.7%</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium min-w-32">Throughput:</span>
              <Sparkline
                data={[50, 55, 52, 58, 62, 65, 70, 68, 72, 75, 78, 80]}
                width={120}
                height={30}
                color="hsl(var(--chart-3))"
                showDots
              />
              <span className="text-sm text-green-500">+60.0%</span>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Status Panels */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Status Panels</h2>
        <div className="grid gap-6 md:grid-cols-3">
          <StatusPanel
            title="Satellite Alpha"
            status="operational"
            lastUpdate={new Date()}
            metrics={[
              { label: "Signal", value: 85, unit: "dBm", status: "success", trend: sparklineData, change: 5.2 },
              { label: "Latency", value: 45, unit: "ms", status: "success", trend: [50, 48, 46, 45, 44, 45] },
              { label: "Uptime", value: "99.9", unit: "%", status: "success" },
            ]}
          />
          <StatusPanel
            title="Satellite Beta"
            status="degraded"
            lastUpdate={new Date()}
            metrics={[
              {
                label: "Signal",
                value: 62,
                unit: "dBm",
                status: "warning",
                trend: [70, 68, 65, 63, 62, 62],
                change: -11.4,
              },
              { label: "Latency", value: 125, unit: "ms", status: "warning", trend: [100, 105, 110, 115, 120, 125] },
              { label: "Uptime", value: "98.2", unit: "%", status: "warning" },
            ]}
          />
          <StatusPanel
            title="Satellite Gamma"
            status="offline"
            lastUpdate={new Date(Date.now() - 300000)}
            metrics={[
              { label: "Signal", value: 0, unit: "dBm", status: "error", trend: [50, 40, 30, 20, 10, 0] },
              { label: "Latency", value: 0, unit: "ms", status: "error" },
              { label: "Uptime", value: "0.0", unit: "%", status: "error" },
            ]}
          />
        </div>
      </section>

      {/* Heatmap */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Heatmap</h2>
        <Card>
          <CardHeader>
            <CardTitle>Coverage Map</CardTitle>
            <CardDescription>Signal strength distribution across geographic regions</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Heatmap data={heatmapData} width={600} height={400} cellSize={30} gap={4} />
          </CardContent>
        </Card>
      </section>

      {/* Code Examples */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Usage Examples</h2>
        <Card>
          <CardHeader>
            <CardTitle>Implementation</CardTitle>
            <CardDescription>How to use these visualization components</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg bg-muted p-4 font-mono text-sm">
              <pre>{`import { TelemetryChart } from '@/components/ui/visualizations/telemetry-chart'
import { RadialGauge } from '@/components/ui/visualizations/radial-gauge'
import { StatusPanel } from '@/components/ui/visualizations/status-panel'

// Real-time telemetry chart
<TelemetryChart
  data={telemetryData}
  title="Signal Strength"
  unit="dBm"
  variant="line"
  thresholds={[
    { value: 70, label: 'Warning', color: 'hsl(var(--warning))' }
  ]}
/>

// Radial gauge for metrics
<RadialGauge
  value={85}
  label="Battery"
  unit="%"
  color="hsl(var(--chart-1))"
/>

// Status panel with multiple metrics
<StatusPanel
  title="Satellite Status"
  status="operational"
  metrics={[
    { label: 'Signal', value: 85, unit: 'dBm', trend: [...] }
  ]}
/>`}</pre>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  )
}
