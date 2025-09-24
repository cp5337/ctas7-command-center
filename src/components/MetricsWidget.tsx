import React from 'react';
import { SystemMetric } from '../types';
import { TrendingUp, TrendingDown, Minus, AlertTriangle, CheckCircle, AlertCircle } from 'lucide-react';

interface MetricsWidgetProps {
  metrics: SystemMetric[];
}

export const MetricsWidget: React.FC<MetricsWidgetProps> = ({ metrics }) => {
  const getTrendIcon = (trend: SystemMetric['trend']) => {
    switch (trend) {
      case 'up':
        return <TrendingUp size={16} className="text-green-400" />;
      case 'down':
        return <TrendingDown size={16} className="text-red-400" />;
      default:
        return <Minus size={16} className="text-slate-400" />;
    }
  };

  const getStatusIcon = (status: SystemMetric['status']) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle size={16} className="text-green-400" />;
      case 'warning':
        return <AlertCircle size={16} className="text-yellow-400" />;
      case 'critical':
        return <AlertTriangle size={16} className="text-red-400" />;
    }
  };

  const getStatusColor = (status: SystemMetric['status']) => {
    switch (status) {
      case 'healthy':
        return 'from-green-900/20 to-green-800/20 border-green-500/20';
      case 'warning':
        return 'from-yellow-900/20 to-yellow-800/20 border-yellow-500/20';
      case 'critical':
        return 'from-red-900/20 to-red-800/20 border-red-500/20';
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {metrics.map((metric) => (
        <div
          key={metric.id}
          className={`bg-gradient-to-r ${getStatusColor(metric.status)} rounded-lg p-4 border backdrop-blur-sm`}
        >
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-slate-200 font-medium text-sm">{metric.name}</h3>
            <div className="flex items-center space-x-1">
              {getStatusIcon(metric.status)}
              {getTrendIcon(metric.trend)}
            </div>
          </div>
          
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-bold text-cyan-400">
              {metric.value.toLocaleString()}
            </span>
            <span className="text-slate-400 text-sm">{metric.unit}</span>
          </div>
          
          <div className="mt-2 h-1 bg-slate-700 rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all duration-500 ${
                metric.status === 'healthy' ? 'bg-green-400' :
                metric.status === 'warning' ? 'bg-yellow-400' : 'bg-red-400'
              }`}
              style={{ width: `${Math.min(100, (metric.value / 100) * 100)}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
};