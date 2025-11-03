"use client"

import { useState } from "react"
import { Line, LineChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Satellite, Radio, TrendingUp, Activity, Plus, Download, Upload } from "lucide-react"

interface RevenueStream {
  name: string
  value: number
  color: string
}

interface ExpenseCategory {
  name: string
  value: number
  color: string
}

interface SatelliteData {
  id: string
  name: string
  status: "active" | "maintenance" | "offline"
  revenue: number
  uptime: number
  throughput: number
  orbit: string
}

export default function FinancialDashboard() {
  const [satellites, setSatellites] = useState(12)
  const [groundStations, setGroundStations] = useState(275)
  const [networkUtilization, setNetworkUtilization] = useState(87)

  const [satelliteData] = useState<SatelliteData[]>([
    {
      id: "SAT-01",
      name: "LaserLight Alpha",
      status: "active",
      revenue: 2.34,
      uptime: 99.8,
      throughput: 847,
      orbit: "MEO-1",
    },
    {
      id: "SAT-02",
      name: "LaserLight Beta",
      status: "active",
      revenue: 2.28,
      uptime: 99.6,
      throughput: 823,
      orbit: "MEO-1",
    },
    {
      id: "SAT-03",
      name: "LaserLight Gamma",
      status: "active",
      revenue: 2.19,
      uptime: 99.9,
      throughput: 891,
      orbit: "MEO-2",
    },
    {
      id: "SAT-04",
      name: "LaserLight Delta",
      status: "active",
      revenue: 2.15,
      uptime: 98.7,
      throughput: 756,
      orbit: "MEO-2",
    },
    {
      id: "SAT-05",
      name: "LaserLight Epsilon",
      status: "active",
      revenue: 2.31,
      uptime: 99.5,
      throughput: 834,
      orbit: "MEO-3",
    },
    {
      id: "SAT-06",
      name: "LaserLight Zeta",
      status: "active",
      revenue: 2.26,
      uptime: 99.7,
      throughput: 867,
      orbit: "MEO-3",
    },
    {
      id: "SAT-07",
      name: "LaserLight Eta",
      status: "maintenance",
      revenue: 1.82,
      uptime: 95.2,
      throughput: 612,
      orbit: "MEO-4",
    },
    {
      id: "SAT-08",
      name: "LaserLight Theta",
      status: "active",
      revenue: 2.22,
      uptime: 99.4,
      throughput: 798,
      orbit: "MEO-4",
    },
    {
      id: "SAT-09",
      name: "LaserLight Iota",
      status: "active",
      revenue: 2.29,
      uptime: 99.8,
      throughput: 856,
      orbit: "MEO-5",
    },
    {
      id: "SAT-10",
      name: "LaserLight Kappa",
      status: "active",
      revenue: 2.17,
      uptime: 99.3,
      throughput: 781,
      orbit: "MEO-5",
    },
    {
      id: "SAT-11",
      name: "LaserLight Lambda",
      status: "active",
      revenue: 2.33,
      uptime: 99.9,
      throughput: 903,
      orbit: "MEO-6",
    },
    {
      id: "SAT-12",
      name: "LaserLight Mu",
      status: "active",
      revenue: 2.24,
      uptime: 99.6,
      throughput: 812,
      orbit: "MEO-6",
    },
  ])

  const [revenueStreams, setRevenueStreams] = useState<RevenueStream[]>([
    { name: "ULL TaaS", value: 14.2, color: "oklch(0.75 0.15 195)" },
    { name: "QKD Services", value: 8.6, color: "oklch(0.65 0.18 280)" },
    { name: "Emergency Premium", value: 3.4, color: "oklch(0.70 0.16 160)" },
  ])

  const [expenseCategories, setExpenseCategories] = useState<ExpenseCategory[]>([
    { name: "Operations", value: 4.8, color: "oklch(0.80 0.12 80)" },
    { name: "Infrastructure", value: 3.2, color: "oklch(0.60 0.20 320)" },
    { name: "Network", value: 2.1, color: "oklch(0.70 0.16 160)" },
  ])

  const totalRevenue = revenueStreams.reduce((sum, stream) => sum + stream.value, 0)
  const totalExpenses = expenseCategories.reduce((sum, cat) => sum + cat.value, 0)
  const dailyProfit = ((totalRevenue - totalExpenses) * 1000000000) / 365

  const generateMonthlyData = () => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    return months.map((month, i) => ({
      month,
      revenue: totalRevenue * (0.85 + Math.random() * 0.3),
      expenses: totalExpenses * (0.9 + Math.random() * 0.2),
    }))
  }

  const [chartData] = useState(generateMonthlyData())

  const addRevenueStream = (name: string, value: number) => {
    setRevenueStreams([
      ...revenueStreams,
      {
        name,
        value,
        color: `oklch(${0.6 + Math.random() * 0.2} ${0.12 + Math.random() * 0.08} ${Math.random() * 360})`,
      },
    ])
  }

  const addExpenseCategory = (name: string, value: number) => {
    setExpenseCategories([
      ...expenseCategories,
      {
        name,
        value,
        color: `oklch(${0.6 + Math.random() * 0.2} ${0.12 + Math.random() * 0.08} ${Math.random() * 360})`,
      },
    ])
  }

  const exportToGoogleSheets = () => {
    const csvContent = [
      ["LaserLight Financial Dashboard Export"],
      [""],
      ["Key Metrics"],
      ["Annual Revenue", `$${totalRevenue.toFixed(2)}B`],
      ["Daily Profit", `$${(dailyProfit / 1000000).toFixed(2)}M`],
      ["Active Satellites", satellites],
      ["Ground Stations", groundStations],
      ["Network Utilization", `${networkUtilization}%`],
      [""],
      ["Revenue Streams"],
      ["Name", "Value (Billions)"],
      ...revenueStreams.map((s) => [s.name, s.value]),
      [""],
      ["Expense Categories"],
      ["Name", "Value (Billions)"],
      ...expenseCategories.map((e) => [e.name, e.value]),
    ]
      .map((row) => row.join(","))
      .join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "laserlight-financial-data.csv"
    a.click()
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "text-emerald-400"
      case "maintenance":
        return "text-amber-400"
      case "offline":
        return "text-rose-400"
      default:
        return "text-slate-400"
    }
  }

  const getStatusIndicator = (status: string) => {
    switch (status) {
      case "active":
        return "bg-emerald-400"
      case "maintenance":
        return "bg-amber-400"
      case "offline":
        return "bg-rose-400"
      default:
        return "bg-slate-400"
    }
  }

  return (
    <div className="min-h-screen bg-slate-900">
      <div className="p-4 md:p-5">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-slate-100">Financial Dashboard</h1>
            <p className="text-xs text-slate-400 mt-0.5">Real-time revenue and expense tracking</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={exportToGoogleSheets}
              className="bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-slate-100"
            >
              <Download className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
            <Dialog>
              <DialogTrigger asChild>
                <Button size="sm" className="bg-cyan-500 text-slate-900 hover:bg-cyan-400 font-medium">
                  <Upload className="mr-2 h-4 w-4" />
                  Import Data
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-slate-800 border-slate-700">
                <DialogHeader>
                  <DialogTitle className="text-slate-100">Import from Google Sheets</DialogTitle>
                  <DialogDescription className="text-slate-400">
                    Paste your Google Sheets CSV data or upload a file to import financial data.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label className="text-slate-300">CSV Data</Label>
                    <textarea
                      className="w-full min-h-[200px] rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500"
                      placeholder="Paste CSV data here..."
                    />
                  </div>
                  <Button className="w-full bg-cyan-500 text-slate-900 hover:bg-cyan-400">Import Data</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* KPI Bar */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-3">
            <div className="flex items-center gap-1.5 mb-2">
              <TrendingUp className="h-4 w-4 text-cyan-400" />
              <span className="text-xs uppercase tracking-wider text-slate-400 font-medium">Annual Revenue</span>
            </div>
            <div className="font-mono text-2xl font-bold text-slate-100">${totalRevenue.toFixed(2)}B</div>
            <div className="mt-1.5 text-xs text-emerald-400">+12.5% YoY</div>
          </div>

          <div className="bg-slate-800 border border-slate-700 rounded-lg p-3">
            <div className="flex items-center gap-1.5 mb-2">
              <Activity className="h-4 w-4 text-emerald-400" />
              <span className="text-xs uppercase tracking-wider text-slate-400 font-medium">Daily Profit</span>
            </div>
            <div className="font-mono text-2xl font-bold text-slate-100">${(dailyProfit / 1000000).toFixed(2)}M</div>
            <div className="mt-1.5 text-xs text-emerald-400">+8.3% vs target</div>
          </div>

          <div className="bg-slate-800 border border-slate-700 rounded-lg p-3">
            <div className="flex items-center gap-1.5 mb-2">
              <Satellite className="h-4 w-4 text-purple-400" />
              <span className="text-xs uppercase tracking-wider text-slate-400 font-medium">Ground Stations</span>
            </div>
            <div className="font-mono text-2xl font-bold text-slate-100">{groundStations}</div>
            <div className="mt-1.5 text-xs text-slate-400">{satellites} satellites active</div>
          </div>

          <div className="bg-slate-800 border border-slate-700 rounded-lg p-3">
            <div className="flex items-center gap-1.5 mb-2">
              <Radio className="h-4 w-4 text-amber-400" />
              <span className="text-xs uppercase tracking-wider text-slate-400 font-medium">Network Utilization</span>
            </div>
            <div className="font-mono text-2xl font-bold text-slate-100">{networkUtilization}%</div>
            <div className="mt-1.5 text-xs text-slate-400">Optimal range</div>
          </div>
        </div>

        {/* Satellite Fleet Revenue */}
        <div className="mb-4">
          <div className="mb-3">
            <h2 className="text-base font-semibold text-slate-100 mb-0.5">Satellite Fleet Revenue</h2>
            <p className="text-xs text-slate-400">Individual satellite performance and revenue contribution</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {satelliteData.map((sat) => (
              <div
                key={sat.id}
                className="bg-slate-800 border border-slate-700 rounded-lg p-3 hover:border-slate-600 transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Satellite className="h-4 w-4 text-cyan-400" />
                    <div>
                      <div className="text-sm font-semibold text-slate-100">{sat.id}</div>
                      <div className="text-xs text-slate-400">{sat.orbit}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className={`w-1.5 h-1.5 rounded-full ${getStatusIndicator(sat.status)}`} />
                    <span className={`text-xs font-medium ${getStatusColor(sat.status)}`}>{sat.status}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div>
                    <div className="text-xs text-slate-400 mb-0.5">Annual Revenue</div>
                    <div className="font-mono text-lg font-bold text-slate-100">${sat.revenue.toFixed(2)}B</div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1.5 border-t border-slate-700">
                    <div>
                      <div className="text-xs text-slate-400 mb-0.5">Uptime</div>
                      <div className="font-mono text-sm font-semibold text-emerald-400">{sat.uptime}%</div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-400 mb-0.5">Throughput</div>
                      <div className="font-mono text-sm font-semibold text-cyan-400">{sat.throughput} Gbps</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
          {/* Revenue Chart */}
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
            <div className="mb-3">
              <h2 className="text-base font-semibold text-slate-100 mb-0.5">Revenue Streams</h2>
              <p className="text-xs text-slate-400">Annual breakdown by service type</p>
            </div>

            <div className="h-[220px] mb-3">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <XAxis dataKey="month" stroke="rgb(148 163 184)" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis
                    stroke="rgb(148 163 184)"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `$${value.toFixed(1)}B`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgb(30 41 59)",
                      border: "1px solid rgb(51 65 85)",
                      borderRadius: "8px",
                      color: "rgb(241 245 249)",
                    }}
                    formatter={(value: number) => [`$${value.toFixed(2)}B`, "Revenue"]}
                  />
                  <Line type="monotone" dataKey="revenue" stroke="rgb(34 211 238)" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-2">
              {revenueStreams.map((stream, i) => (
                <div key={i} className="flex items-center justify-between py-1.5">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: stream.color }} />
                    <span className="text-sm text-slate-300">{stream.name}</span>
                  </div>
                  <span className="font-mono text-sm font-semibold text-slate-100">${stream.value.toFixed(2)}B</span>
                </div>
              ))}
              <Dialog>
                <DialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full mt-2 text-cyan-400 hover:text-cyan-300 hover:bg-slate-700/50"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Revenue Stream
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-slate-800 border-slate-700">
                  <DialogHeader>
                    <DialogTitle className="text-slate-100">Add Revenue Stream</DialogTitle>
                    <DialogDescription className="text-slate-400">Add a new revenue source to track</DialogDescription>
                  </DialogHeader>
                  <form
                    onSubmit={(e) => {
                      e.preventDefault()
                      const formData = new FormData(e.currentTarget)
                      const name = formData.get("name") as string
                      const value = Number.parseFloat(formData.get("value") as string)
                      if (name && value) {
                        addRevenueStream(name, value)
                        e.currentTarget.reset()
                      }
                    }}
                  >
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label className="text-slate-300">Stream Name</Label>
                        <Input
                          id="name"
                          name="name"
                          placeholder="e.g., Data Transit Services"
                          className="bg-slate-900 border-slate-700 text-slate-100"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-slate-300">Annual Value (Billions)</Label>
                        <Input
                          id="value"
                          name="value"
                          type="number"
                          step="0.1"
                          placeholder="e.g., 2.5"
                          className="bg-slate-900 border-slate-700 text-slate-100"
                        />
                      </div>
                      <Button type="submit" className="w-full bg-cyan-500 text-slate-900 hover:bg-cyan-400">
                        Add Stream
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Expenses Chart */}
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
            <div className="mb-3">
              <h2 className="text-base font-semibold text-slate-100 mb-0.5">Operating Expenses</h2>
              <p className="text-xs text-slate-400">Annual breakdown by category</p>
            </div>

            <div className="h-[220px] mb-3">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <XAxis dataKey="month" stroke="rgb(148 163 184)" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis
                    stroke="rgb(148 163 184)"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `$${value.toFixed(1)}B`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgb(30 41 59)",
                      border: "1px solid rgb(51 65 85)",
                      borderRadius: "8px",
                      color: "rgb(241 245 249)",
                    }}
                    formatter={(value: number) => [`$${value.toFixed(2)}B`, "Expenses"]}
                  />
                  <Line type="monotone" dataKey="expenses" stroke="rgb(244 63 94)" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-2">
              {expenseCategories.map((category, i) => (
                <div key={i} className="flex items-center justify-between py-1.5">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: category.color }} />
                    <span className="text-sm text-slate-300">{category.name}</span>
                  </div>
                  <span className="font-mono text-sm font-semibold text-slate-100">${category.value.toFixed(2)}B</span>
                </div>
              ))}
              <Dialog>
                <DialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full mt-2 text-cyan-400 hover:text-cyan-300 hover:bg-slate-700/50"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Expense Category
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-slate-800 border-slate-700">
                  <DialogHeader>
                    <DialogTitle className="text-slate-100">Add Expense Category</DialogTitle>
                    <DialogDescription className="text-slate-400">
                      Add a new expense category to track
                    </DialogDescription>
                  </DialogHeader>
                  <form
                    onSubmit={(e) => {
                      e.preventDefault()
                      const formData = new FormData(e.currentTarget)
                      const name = formData.get("name") as string
                      const value = Number.parseFloat(formData.get("value") as string)
                      if (name && value) {
                        addExpenseCategory(name, value)
                        e.currentTarget.reset()
                      }
                    }}
                  >
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label className="text-slate-300">Category Name</Label>
                        <Input
                          id="exp-name"
                          name="name"
                          placeholder="e.g., R&D"
                          className="bg-slate-900 border-slate-700 text-slate-100"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-slate-300">Annual Value (Billions)</Label>
                        <Input
                          id="exp-value"
                          name="value"
                          type="number"
                          step="0.1"
                          placeholder="e.g., 1.2"
                          className="bg-slate-900 border-slate-700 text-slate-100"
                        />
                      </div>
                      <Button type="submit" className="w-full bg-cyan-500 text-slate-900 hover:bg-cyan-400">
                        Add Category
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>

        {/* Adjustable Parameters */}
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
          <div className="mb-3">
            <h2 className="text-base font-semibold text-slate-100 mb-0.5">Network Parameters</h2>
            <p className="text-xs text-slate-400">Adjust real-time operational metrics</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm text-slate-300">MEO Satellites</Label>
                <span className="font-mono text-sm font-semibold text-cyan-400">{satellites}</span>
              </div>
              <Slider
                value={[satellites]}
                onValueChange={(value) => setSatellites(value[0])}
                min={1}
                max={24}
                step={1}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm text-slate-300">Ground Stations</Label>
                <span className="font-mono text-sm font-semibold text-cyan-400">{groundStations}</span>
              </div>
              <Slider
                value={[groundStations]}
                onValueChange={(value) => setGroundStations(value[0])}
                min={50}
                max={500}
                step={5}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm text-slate-300">Network Utilization</Label>
                <span className="font-mono text-sm font-semibold text-cyan-400">{networkUtilization}%</span>
              </div>
              <Slider
                value={[networkUtilization]}
                onValueChange={(value) => setNetworkUtilization(value[0])}
                min={0}
                max={100}
                step={1}
                className="w-full"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}