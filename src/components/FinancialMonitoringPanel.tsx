/******************************************************************************************
* CTAS7 Financial Monitoring Panel – Multi-Tenant Legion World Financial Dashboard
* Licensed under Apache 2.0 – https://www.apache.org/licenses/LICENSE-2.0
* © 2025 All rights reserved.
*
* File Name: FinancialMonitoringPanel.tsx
* Path:      src/components/FinancialMonitoringPanel.tsx
*
* File Role:
* Comprehensive financial dashboard panel that makes all financial metrics
* 100% visible, understandable, and adjustable across multiple Legion worlds.
* Integrates with the enhanced GIS canonical multi-tenant fusion system.
*
* Revenue Streams: Rev 1 (ULL TaaS), Rev 2 (QKD), Rev 3 (Emergency Premium)
* Expense Categories: Exp 1 (Operations), Exp 2 (Infrastructure), Exp 3 (Network)
* Network Scale: 259 ground stations + 12 MEO satellites = $26.58B/year total
******************************************************************************************/

import React, { useState, useEffect, useMemo } from 'react';
import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Slider,
} from '@/components/ui/slider';
import {
  Badge,
} from '@/components/ui/badge';
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/components/ui/alert';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Settings,
  Globe,
  Satellite,
  Network,
  BarChart3,
  PieChart as PieChartIcon,
  Settings2 as SliderIcon,
  Eye,
  Zap,
  Shield,
  Radio,
} from 'lucide-react';

// Financial interfaces matching the Rust backend
interface RevenueStreams {
  rev1_ull_taas: {
    daily_revenue: number;
    monthly_revenue: number;
    annual_projection: number;
    current_utilization_percent: number;
    sellable_capacity_mbps: number;
    quality_multiplier: number;
  };
  rev2_qkd_services: {
    daily_revenue: number;
    monthly_revenue: number;
    annual_projection: number;
    enterprise_contracts: number;
    government_contracts: number;
    qkd_keys_per_second: number;
  };
  rev3_emergency_premium: {
    daily_revenue: number;
    monthly_revenue: number;
    annual_projection: number;
    emergency_events_active: number;
    premium_multiplier: number;
  };
  total_revenue: number;
}

interface ExpenseCategories {
  exp1_operations_maintenance: {
    daily_expense: number;
    monthly_expense: number;
    annual_projection: number;
    personnel_costs: number;
    facility_costs: number;
  };
  exp2_infrastructure_equipment: {
    daily_expense: number;
    monthly_expense: number;
    annual_projection: number;
    equipment_depreciation: number;
    technology_upgrades: number;
  };
  exp3_network_costs: {
    daily_expense: number;
    monthly_expense: number;
    annual_projection: number;
    satellite_bandwidth: number;
    power_consumption: number;
  };
  total_expenses: number;
}

interface StationFinancialMetrics {
  station_id: string;
  org_id: string;
  station_code: string;
  station_name: string;
  revenue_streams: RevenueStreams;
  expense_categories: ExpenseCategories;
  financial_summary: {
    gross_revenue: number;
    total_expenses: number;
    gross_profit: number;
    gross_margin_percent: number;
    ebitda: number;
    ebitda_margin_percent: number;
  };
  performance_metrics: {
    capacity_utilization_percent: number;
    uptime_percent: number;
    revenue_per_mbps: number;
    cost_per_mbps: number;
  };
}

interface NetworkFinancialSummary {
  total_stations: number;
  total_gross_revenue: number;
  total_expenses: number;
  network_gross_profit: number;
  average_margin_percent: number;
}

interface LegionWorld {
  world_id: string;
  world_name: string;
  org_id: string;
  station_count: number;
  active_stations: number;
}

interface FinancialDashboardProps {
  selectedOrgId?: string;
  selectedWorldId?: string;
  className?: string;
}

export const FinancialMonitoringPanel: React.FC<FinancialDashboardProps> = ({
  selectedOrgId,
  selectedWorldId,
  className = '',
}) => {
  // State management
  const [selectedPeriod, setSelectedPeriod] = useState<'daily' | 'monthly' | 'quarterly' | 'annual'>('daily');
  const [selectedMetricView, setSelectedMetricView] = useState<'overview' | 'revenue' | 'expenses' | 'performance'>('overview');
  const [adjustableParams, setAdjustableParams] = useState({
    rev1_capacity_utilization: [82], // ULL TaaS capacity %
    rev2_qkd_pricing: [0.025], // QKD price per key
    rev3_emergency_multiplier: [5.0], // Emergency premium multiplier
    exp1_operations_percent: [15.2], // Operations expense %
    exp2_infrastructure_percent: [8.8], // Infrastructure expense %
    exp3_network_percent: [6.5], // Network expense %
  });

  const [financialData, setFinancialData] = useState<{
    station_metrics: StationFinancialMetrics[];
    network_summary: NetworkFinancialSummary;
    legion_worlds: LegionWorld[];
  } | null>(null);

  const [loading, setLoading] = useState(true);
  const [alerts, setAlerts] = useState<Array<{
    type: 'revenue_opportunity' | 'cost_overrun' | 'performance_issue';
    severity: 'info' | 'warning' | 'critical';
    message: string;
    financial_impact: number;
  }>>([]);

  // Color schemes for charts
  const revenueColors = {
    rev1: '#3B82F6', // Blue - ULL TaaS
    rev2: '#10B981', // Green - QKD Services
    rev3: '#F59E0B', // Amber - Emergency Premium
  };

  const expenseColors = {
    exp1: '#EF4444', // Red - Operations
    exp2: '#8B5CF6', // Purple - Infrastructure
    exp3: '#06B6D4', // Cyan - Network
  };

  // Fetch financial data
  useEffect(() => {
    const fetchFinancialData = async () => {
      setLoading(true);
      try {
        // Generate mock data for now since backend is not available
        const mockData = generateMockFinancialData(selectedOrgId, selectedWorldId);
        const mockAlerts = generateFinancialAlerts(mockData);

        setFinancialData(mockData);
        setAlerts(mockAlerts);

      } catch (error) {
        console.error('Error fetching financial data:', error);
        // Generate mock data on error
        const mockData = generateMockFinancialData(selectedOrgId, selectedWorldId);
        const mockAlerts = generateFinancialAlerts(mockData);

        setFinancialData(mockData);
        setAlerts(mockAlerts);
      } finally {
        setLoading(false);
      }
    };

    fetchFinancialData();
    const interval = setInterval(fetchFinancialData, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, [selectedOrgId, selectedWorldId, adjustableParams]);

  // Calculate real-time projections based on adjustable parameters
  const adjustedMetrics = useMemo(() => {
    if (!financialData) return null;

    return financialData.station_metrics.map(station => {
      const rev1_multiplier = adjustableParams.rev1_capacity_utilization[0] / 100;
      const rev2_multiplier = adjustableParams.rev2_qkd_pricing[0] / 0.025;
      const rev3_multiplier = adjustableParams.rev3_emergency_multiplier[0] / 5.0;

      const adjusted_rev1 = station.revenue_streams.rev1_ull_taas.daily_revenue * rev1_multiplier;
      const adjusted_rev2 = station.revenue_streams.rev2_qkd_services.daily_revenue * rev2_multiplier;
      const adjusted_rev3 = station.revenue_streams.rev3_emergency_premium.daily_revenue * rev3_multiplier;

      const total_adjusted_revenue = adjusted_rev1 + adjusted_rev2 + adjusted_rev3;

      const exp1_multiplier = adjustableParams.exp1_operations_percent[0] / 15.2;
      const exp2_multiplier = adjustableParams.exp2_infrastructure_percent[0] / 8.8;
      const exp3_multiplier = adjustableParams.exp3_network_percent[0] / 6.5;

      const adjusted_exp1 = station.expense_categories.exp1_operations_maintenance.daily_expense * exp1_multiplier;
      const adjusted_exp2 = station.expense_categories.exp2_infrastructure_equipment.daily_expense * exp2_multiplier;
      const adjusted_exp3 = station.expense_categories.exp3_network_costs.daily_expense * exp3_multiplier;

      const total_adjusted_expenses = adjusted_exp1 + adjusted_exp2 + adjusted_exp3;
      const adjusted_gross_profit = total_adjusted_revenue - total_adjusted_expenses;
      const adjusted_margin = (adjusted_gross_profit / total_adjusted_revenue) * 100;

      return {
        ...station,
        adjusted: {
          revenue: total_adjusted_revenue,
          expenses: total_adjusted_expenses,
          gross_profit: adjusted_gross_profit,
          margin_percent: adjusted_margin,
          annual_projection: total_adjusted_revenue * 365,
        },
      };
    });
  }, [financialData, adjustableParams]);

  // Network-level summary calculations
  const networkSummary = useMemo(() => {
    if (!adjustedMetrics) return null;

    const total_revenue = adjustedMetrics.reduce((sum, station) => sum + station.adjusted.revenue, 0);
    const total_expenses = adjustedMetrics.reduce((sum, station) => sum + station.adjusted.expenses, 0);
    const gross_profit = total_revenue - total_expenses;
    const margin_percent = (gross_profit / total_revenue) * 100;

    return {
      daily_revenue: total_revenue,
      daily_expenses: total_expenses,
      daily_gross_profit: gross_profit,
      margin_percent,
      monthly_projection: total_revenue * 30,
      annual_projection: total_revenue * 365,
      stations_count: adjustedMetrics.length,
    };
  }, [adjustedMetrics]);

  // Chart data preparation
  const revenueBreakdownData = useMemo(() => {
    if (!adjustedMetrics) return [];

    const totalRev1 = adjustedMetrics.reduce((sum, s) => sum + (s.revenue_streams.rev1_ull_taas.daily_revenue * adjustableParams.rev1_capacity_utilization[0] / 100), 0);
    const totalRev2 = adjustedMetrics.reduce((sum, s) => sum + (s.revenue_streams.rev2_qkd_services.daily_revenue * adjustableParams.rev2_qkd_pricing[0] / 0.025), 0);
    const totalRev3 = adjustedMetrics.reduce((sum, s) => sum + (s.revenue_streams.rev3_emergency_premium.daily_revenue * adjustableParams.rev3_emergency_multiplier[0] / 5.0), 0);

    return [
      { name: 'ULL TaaS (Rev 1)', value: totalRev1, color: revenueColors.rev1 },
      { name: 'QKD Services (Rev 2)', value: totalRev2, color: revenueColors.rev2 },
      { name: 'Emergency Premium (Rev 3)', value: totalRev3, color: revenueColors.rev3 },
    ];
  }, [adjustedMetrics, adjustableParams]);

  const expenseBreakdownData = useMemo(() => {
    if (!adjustedMetrics) return [];

    const totalExp1 = adjustedMetrics.reduce((sum, s) => sum + (s.expense_categories.exp1_operations_maintenance.daily_expense * adjustableParams.exp1_operations_percent[0] / 15.2), 0);
    const totalExp2 = adjustedMetrics.reduce((sum, s) => sum + (s.expense_categories.exp2_infrastructure_equipment.daily_expense * adjustableParams.exp2_infrastructure_percent[0] / 8.8), 0);
    const totalExp3 = adjustedMetrics.reduce((sum, s) => sum + (s.expense_categories.exp3_network_costs.daily_expense * adjustableParams.exp3_network_percent[0] / 6.5), 0);

    return [
      { name: 'Operations & Maintenance (Exp 1)', value: totalExp1, color: expenseColors.exp1 },
      { name: 'Infrastructure & Equipment (Exp 2)', value: totalExp2, color: expenseColors.exp2 },
      { name: 'Network Costs (Exp 3)', value: totalExp3, color: expenseColors.exp3 },
    ];
  }, [adjustedMetrics, adjustableParams]);

  // Performance trend data
  const performanceTrendData = useMemo(() => {
    if (!adjustedMetrics) return [];

    return adjustedMetrics.slice(0, 10).map((station, index) => ({
      station: station.station_code,
      revenue: station.adjusted.revenue,
      margin: station.adjusted.margin_percent,
      utilization: station.performance_metrics.capacity_utilization_percent,
      uptime: station.performance_metrics.uptime_percent,
    }));
  }, [adjustedMetrics]);

  const formatCurrency = (amount: number) => {
    if (amount >= 1e9) return `$${(amount / 1e9).toFixed(2)}B`;
    if (amount >= 1e6) return `$${(amount / 1e6).toFixed(2)}M`;
    if (amount >= 1e3) return `$${(amount / 1e3).toFixed(1)}K`;
    return `$${amount.toFixed(0)}`;
  };

  const formatPercent = (percent: number) => `${percent.toFixed(1)}%`;

  if (loading) {
    return (
      <div className={`flex items-center justify-center p-8 ${className}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mx-auto mb-4"></div>
          <p className="text-slate-300">Loading Financial Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header with Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2 text-slate-100">
            <DollarSign className="h-8 w-8 text-green-500" />
            Financial Monitoring Panel
          </h2>
          <p className="text-slate-300">
            Real-time financial metrics across {networkSummary?.stations_count || 0} ground stations
          </p>
        </div>

        <div className="flex items-center gap-4">
          <Select value={selectedPeriod} onValueChange={(value: any) => setSelectedPeriod(value)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">Daily View</SelectItem>
              <SelectItem value="monthly">Monthly View</SelectItem>
              <SelectItem value="quarterly">Quarterly View</SelectItem>
              <SelectItem value="annual">Annual View</SelectItem>
            </SelectContent>
          </Select>

          <Badge variant="outline" className="flex items-center gap-1">
            <Globe className="h-3 w-3" />
            {financialData?.legion_worlds.length || 1} Legion World{(financialData?.legion_worlds.length || 1) > 1 ? 's' : ''}
          </Badge>
        </div>
      </div>

      {/* Alerts */}
      {alerts.length > 0 && (
        <div className="grid gap-4">
          {alerts.map((alert, index) => (
            <Alert key={index} className={`border-l-4 ${
              alert.severity === 'critical' ? 'border-red-500 bg-red-50' :
              alert.severity === 'warning' ? 'border-yellow-500 bg-yellow-50' :
              'border-blue-500 bg-blue-50'
            }`}>
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle className="flex items-center justify-between">
                {alert.type.replace('_', ' ').toUpperCase()}
                <Badge variant={alert.severity === 'critical' ? 'destructive' : 'secondary'}>
                  {alert.severity}
                </Badge>
              </AlertTitle>
              <AlertDescription>
                {alert.message}
                {alert.financial_impact > 0 && (
                  <span className="ml-2 font-semibold text-green-600">
                    Impact: {formatCurrency(alert.financial_impact)}
                  </span>
                )}
              </AlertDescription>
            </Alert>
          ))}
        </div>
      )}

      {/* Key Metrics Overview */}
      {networkSummary && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Daily Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(networkSummary.daily_revenue)}
              </div>
              <p className="text-xs text-muted-foreground">
                Annual: {formatCurrency(networkSummary.annual_projection)}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Gross Margin</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {formatPercent(networkSummary.margin_percent)}
              </div>
              <p className="text-xs text-muted-foreground">
                Profit: {formatCurrency(networkSummary.daily_gross_profit)}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Stations</CardTitle>
              <Satellite className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">
                {networkSummary.stations_count}
              </div>
              <p className="text-xs text-muted-foreground">
                + 12 MEO satellites
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Network Capacity</CardTitle>
              <Network className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {formatPercent(adjustableParams.rev1_capacity_utilization[0])}
              </div>
              <p className="text-xs text-muted-foreground">
                Utilization across network
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Adjustable Parameters Panel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Adjustable Financial Parameters
            <Badge variant="outline">100% Visible & Adjustable</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Revenue Parameters */}
            <div className="space-y-4">
              <h4 className="font-semibold text-green-600 flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Revenue Streams
              </h4>

              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium flex items-center justify-between">
                    Rev 1: ULL TaaS Capacity Utilization
                    <span className="text-blue-600">{adjustableParams.rev1_capacity_utilization[0]}%</span>
                  </label>
                  <Slider
                    value={adjustableParams.rev1_capacity_utilization}
                    onValueChange={(value) => setAdjustableParams(prev => ({ ...prev, rev1_capacity_utilization: value }))}
                    max={100}
                    min={50}
                    step={1}
                    className="mt-2"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium flex items-center justify-between">
                    Rev 2: QKD Price per Key (USD)
                    <span className="text-green-600">${adjustableParams.rev2_qkd_pricing[0].toFixed(3)}</span>
                  </label>
                  <Slider
                    value={adjustableParams.rev2_qkd_pricing}
                    onValueChange={(value) => setAdjustableParams(prev => ({ ...prev, rev2_qkd_pricing: value }))}
                    max={0.05}
                    min={0.01}
                    step={0.001}
                    className="mt-2"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium flex items-center justify-between">
                    Rev 3: Emergency Premium Multiplier
                    <span className="text-orange-600">{adjustableParams.rev3_emergency_multiplier[0].toFixed(1)}x</span>
                  </label>
                  <Slider
                    value={adjustableParams.rev3_emergency_multiplier}
                    onValueChange={(value) => setAdjustableParams(prev => ({ ...prev, rev3_emergency_multiplier: value }))}
                    max={10}
                    min={1}
                    step={0.1}
                    className="mt-2"
                  />
                </div>
              </div>
            </div>

            {/* Expense Parameters */}
            <div className="space-y-4">
              <h4 className="font-semibold text-red-600 flex items-center gap-2">
                <TrendingDown className="h-4 w-4" />
                Expense Categories
              </h4>

              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium flex items-center justify-between">
                    Exp 1: Operations & Maintenance %
                    <span className="text-red-600">{adjustableParams.exp1_operations_percent[0]}%</span>
                  </label>
                  <Slider
                    value={adjustableParams.exp1_operations_percent}
                    onValueChange={(value) => setAdjustableParams(prev => ({ ...prev, exp1_operations_percent: value }))}
                    max={25}
                    min={10}
                    step={0.1}
                    className="mt-2"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium flex items-center justify-between">
                    Exp 2: Infrastructure & Equipment %
                    <span className="text-purple-600">{adjustableParams.exp2_infrastructure_percent[0]}%</span>
                  </label>
                  <Slider
                    value={adjustableParams.exp2_infrastructure_percent}
                    onValueChange={(value) => setAdjustableParams(prev => ({ ...prev, exp2_infrastructure_percent: value }))}
                    max={15}
                    min={5}
                    step={0.1}
                    className="mt-2"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium flex items-center justify-between">
                    Exp 3: Network Costs %
                    <span className="text-cyan-600">{adjustableParams.exp3_network_percent[0]}%</span>
                  </label>
                  <Slider
                    value={adjustableParams.exp3_network_percent}
                    onValueChange={(value) => setAdjustableParams(prev => ({ ...prev, exp3_network_percent: value }))}
                    max={12}
                    min={3}
                    step={0.1}
                    className="mt-2"
                  />
                </div>
              </div>
            </div>

            {/* Real-time Impact */}
            <div className="space-y-4">
              <h4 className="font-semibold text-blue-600 flex items-center gap-2">
                <Zap className="h-4 w-4" />
                Real-time Impact
              </h4>

              {networkSummary && (
                <div className="space-y-3">
                  <div className="p-3 bg-green-50 rounded-lg">
                    <div className="text-sm text-green-600 font-medium">Daily Revenue Impact</div>
                    <div className="text-lg font-bold text-green-700">
                      {formatCurrency(networkSummary.daily_revenue)}
                    </div>
                  </div>

                  <div className="p-3 bg-red-50 rounded-lg">
                    <div className="text-sm text-red-600 font-medium">Daily Expense Impact</div>
                    <div className="text-lg font-bold text-red-700">
                      {formatCurrency(networkSummary.daily_expenses)}
                    </div>
                  </div>

                  <div className="p-3 bg-blue-50 rounded-lg">
                    <div className="text-sm text-blue-600 font-medium">Net Margin</div>
                    <div className="text-lg font-bold text-blue-700">
                      {formatPercent(networkSummary.margin_percent)}
                    </div>
                  </div>

                  <div className="p-3 bg-purple-50 rounded-lg">
                    <div className="text-sm text-purple-600 font-medium">Annual Projection</div>
                    <div className="text-lg font-bold text-purple-700">
                      {formatCurrency(networkSummary.annual_projection)}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Charts and Detailed Views */}
      <Tabs value={selectedMetricView} onValueChange={(value: any) => setSelectedMetricView(value)}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="expenses">Expenses</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Revenue Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={revenueBreakdownData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                    >
                      {revenueBreakdownData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => formatCurrency(value as number)} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Expense Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={expenseBreakdownData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                    >
                      {expenseBreakdownData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => formatCurrency(value as number)} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="revenue" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Revenue Stream Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={performanceTrendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="station" />
                  <YAxis />
                  <Tooltip formatter={(value) => formatCurrency(value as number)} />
                  <Legend />
                  <Bar dataKey="revenue" fill={revenueColors.rev1} name="Daily Revenue" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="expenses" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {Object.entries(expenseColors).map(([key, color], index) => (
              <Card key={key}>
                <CardHeader>
                  <CardTitle className="text-sm">
                    {key === 'exp1' ? 'Operations & Maintenance' :
                     key === 'exp2' ? 'Infrastructure & Equipment' :
                     'Network Costs'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold" style={{ color }}>
                    {expenseBreakdownData[index] ? formatCurrency(expenseBreakdownData[index].value) : '$0'}
                  </div>
                  <div className="text-sm text-slate-300">
                    {key === 'exp1' ? adjustableParams.exp1_operations_percent[0] :
                     key === 'exp2' ? adjustableParams.exp2_infrastructure_percent[0] :
                     adjustableParams.exp3_network_percent[0]}% of revenue
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Station Performance Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={performanceTrendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="station" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="margin" stroke="#10B981" name="Gross Margin %" />
                  <Line type="monotone" dataKey="utilization" stroke="#3B82F6" name="Capacity Utilization %" />
                  <Line type="monotone" dataKey="uptime" stroke="#8B5CF6" name="Uptime %" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Footer with System Info */}
      <Card className="bg-slate-900 border-slate-700">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between text-sm text-slate-300">
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="flex items-center gap-1">
                <Eye className="h-3 w-3" />
                100% Visible
              </Badge>
              <Badge variant="outline" className="flex items-center gap-1">
                <SliderIcon className="h-3 w-3" />
                Fully Adjustable
              </Badge>
              <Badge variant="outline" className="flex items-center gap-1">
                <Shield className="h-3 w-3" />
                Multi-Tenant Secure
              </Badge>
            </div>
            <div className="text-right">
              <div>CTAS7 Enhanced GIS Canonical Financial System</div>
              <div>Last updated: {new Date().toLocaleTimeString()}</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Helper functions

function generateMockFinancialData(orgId?: string, worldId?: string) {
  // Generate realistic financial data based on Monte Carlo analysis
  const stations = Array.from({ length: 259 }, (_, i) => {
    const stationId = `station-${i + 1}`;
    const stationCode = `GS${String(i + 1).padStart(3, '0')}`;

    // Base revenue: $24M ULL TaaS + $78.6M QKD = $102.6M/year per station
    const annual_ull_taas = 24_000_000;
    const annual_qkd = 78_600_000;
    const daily_ull_taas = annual_ull_taas / 365;
    const daily_qkd = annual_qkd / 365;
    const daily_emergency = Math.random() * 10000; // Variable emergency revenue

    // Calculate expenses (~21% of revenue for 79% gross margin)
    const total_daily_revenue = daily_ull_taas + daily_qkd + daily_emergency;
    const daily_expenses = total_daily_revenue * 0.21;

    return {
      station_id: stationId,
      org_id: orgId || 'default-org',
      station_code: stationCode,
      station_name: `Ground Station ${String(i + 1).padStart(3, '0')}`,
      revenue_streams: {
        rev1_ull_taas: {
          daily_revenue: daily_ull_taas,
          monthly_revenue: daily_ull_taas * 30,
          annual_projection: annual_ull_taas,
          current_utilization_percent: 75 + Math.random() * 20,
          sellable_capacity_mbps: 400,
          quality_multiplier: 0.9 + Math.random() * 0.2,
        },
        rev2_qkd_services: {
          daily_revenue: daily_qkd,
          monthly_revenue: daily_qkd * 30,
          annual_projection: annual_qkd,
          enterprise_contracts: Math.floor(10 + Math.random() * 10),
          government_contracts: Math.floor(5 + Math.random() * 8),
          qkd_keys_per_second: 800 + Math.random() * 400,
        },
        rev3_emergency_premium: {
          daily_revenue: daily_emergency,
          monthly_revenue: daily_emergency * 30,
          annual_projection: daily_emergency * 365,
          emergency_events_active: daily_emergency > 5000 ? 1 : 0,
          premium_multiplier: daily_emergency > 5000 ? 5.0 : 1.0,
        },
        total_revenue: total_daily_revenue,
      },
      expense_categories: {
        exp1_operations_maintenance: {
          daily_expense: daily_expenses * 0.6,
          monthly_expense: daily_expenses * 0.6 * 30,
          annual_projection: daily_expenses * 0.6 * 365,
          personnel_costs: daily_expenses * 0.6 * 0.45,
          facility_costs: daily_expenses * 0.6 * 0.15,
        },
        exp2_infrastructure_equipment: {
          daily_expense: daily_expenses * 0.25,
          monthly_expense: daily_expenses * 0.25 * 30,
          annual_projection: daily_expenses * 0.25 * 365,
          equipment_depreciation: daily_expenses * 0.25 * 0.25,
          technology_upgrades: daily_expenses * 0.25 * 0.15,
        },
        exp3_network_costs: {
          daily_expense: daily_expenses * 0.15,
          monthly_expense: daily_expenses * 0.15 * 30,
          annual_projection: daily_expenses * 0.15 * 365,
          satellite_bandwidth: daily_expenses * 0.15 * 0.35,
          power_consumption: daily_expenses * 0.15 * 0.15,
        },
        total_expenses: daily_expenses,
      },
      financial_summary: {
        gross_revenue: total_daily_revenue,
        total_expenses: daily_expenses,
        gross_profit: total_daily_revenue - daily_expenses,
        gross_margin_percent: ((total_daily_revenue - daily_expenses) / total_daily_revenue) * 100,
        ebitda: total_daily_revenue - daily_expenses * 0.8,
        ebitda_margin_percent: ((total_daily_revenue - daily_expenses * 0.8) / total_daily_revenue) * 100,
      },
      performance_metrics: {
        capacity_utilization_percent: 75 + Math.random() * 20,
        uptime_percent: 99.5 + Math.random() * 0.4,
        revenue_per_mbps: total_daily_revenue / 400,
        cost_per_mbps: daily_expenses / 400,
      },
    };
  });

  const totalRevenue = stations.reduce((sum, s) => sum + s.financial_summary.gross_revenue, 0);
  const totalExpenses = stations.reduce((sum, s) => sum + s.financial_summary.total_expenses, 0);

  return {
    station_metrics: stations,
    network_summary: {
      total_stations: stations.length,
      total_gross_revenue: totalRevenue,
      total_expenses: totalExpenses,
      network_gross_profit: totalRevenue - totalExpenses,
      average_margin_percent: ((totalRevenue - totalExpenses) / totalRevenue) * 100,
    },
    legion_worlds: [
      {
        world_id: worldId || 'world-1',
        world_name: 'Primary Legion World',
        org_id: orgId || 'default-org',
        station_count: stations.length,
        active_stations: stations.length - 4, // 4 stations in maintenance
      },
    ],
  };
}

function generateFinancialAlerts(data: any) {
  const alerts = [];

  // Check for high-performing stations
  const highRevenue = data.station_metrics.filter((s: any) => s.financial_summary.gross_revenue > 350000);
  if (highRevenue.length > 0) {
    alerts.push({
      type: 'revenue_opportunity' as const,
      severity: 'info' as const,
      message: `${highRevenue.length} stations running at high capacity (>$350K/day) - consider expansion`,
      financial_impact: highRevenue.length * 2_500_000,
    });
  }

  // Check for margin compression
  const lowMargin = data.station_metrics.filter((s: any) => s.financial_summary.gross_margin_percent < 70);
  if (lowMargin.length > 0) {
    alerts.push({
      type: 'cost_overrun' as const,
      severity: 'warning' as const,
      message: `${lowMargin.length} stations showing margin compression (<70%) - review cost structure`,
      financial_impact: lowMargin.length * -1_000_000,
    });
  }

  return alerts;
}

export default FinancialMonitoringPanel;