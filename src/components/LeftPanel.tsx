import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Home, Satellite, Radio, ChevronRight,
  Globe, Orbit, Radar, Target,
  MapPin, Tower, Antenna, TowerControl,
  Database, ExternalLink, Table, FileText,
  Settings
} from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Separator } from './ui/separator';

type WorldType = 'production' | 'staging' | 'sandbox' | 'fusion';

interface LeftPanelProps {
  currentWorld: WorldType;
  onWorldChange: (world: WorldType) => void;
  stats: {
    groundStations: number;
    satellites: number;
    activeLinks: number;
  };
}

export function LeftPanel({ currentWorld, onWorldChange, stats }: LeftPanelProps) {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [selectedFocus, setSelectedFocus] = useState<'home' | 'satellite' | 'ground'>('home');
  const [selectedView, setSelectedView] = useState<string>('');

  // Top navigation group (3 icons)
  const navigationFocus = [
    { id: 'home', label: 'Home Landing', icon: Home, color: 'text-cyan-400' },
    { id: 'satellite', label: 'Satellite Focus', icon: Satellite, color: 'text-blue-400' },
    { id: 'ground', label: 'Ground Station Focus', icon: Radio, color: 'text-green-400' }
  ];

  // Satellite views group (4 icons)
  const satelliteViews = [
    { id: 'sat-overview', label: 'Satellite Overview', icon: Globe, color: 'text-blue-400' },
    { id: 'sat-orbits', label: 'Orbital Paths', icon: Orbit, color: 'text-cyan-400' },
    { id: 'sat-radar', label: 'Radar View', icon: Radar, color: 'text-purple-400' },
    { id: 'sat-target', label: 'Target Tracking', icon: Target, color: 'text-red-400' }
  ];

  // Ground station views group (4 icons)
  const groundViews = [
    { id: 'ground-map', label: 'Ground Station Map', icon: MapPin, color: 'text-green-400' },
    { id: 'ground-tower', label: 'Tower Control', icon: Tower, color: 'text-amber-400' },
    { id: 'ground-antenna', label: 'Antenna Status', icon: Antenna, color: 'text-orange-400' },
    { id: 'ground-control', label: 'Control Center', icon: TowerControl, color: 'text-emerald-400' }
  ];

  // Data sources group (4 icons)
  const dataSources = [
    { id: 'data-external', label: 'External API', icon: ExternalLink, color: 'text-yellow-400' },
    { id: 'data-tables', label: 'Data Tables', icon: Table, color: 'text-indigo-400' },
    { id: 'data-db', label: 'Database', icon: Database, color: 'text-violet-400' },
    { id: 'data-reports', label: 'Reports', icon: FileText, color: 'text-slate-400' }
  ];

  if (isCollapsed) {
    return (
      <motion.div
        initial={false}
        animate={{ width: 48 }}
        className="fixed left-0 top-0 h-screen bg-slate-900/95 backdrop-blur-xl border-r border-slate-700/50 z-40 flex flex-col items-center"
        onMouseEnter={() => setIsCollapsed(false)}
      >
        {/* Chevron Indicator */}
        <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2">
          <div className="w-6 h-12 bg-slate-800/90 border border-slate-600/50 hover:border-cyan-400/50 rounded-r-lg flex items-center justify-center transition-all duration-200">
            <ChevronRight className="w-3 h-3 text-slate-400 hover:text-cyan-400" />
          </div>
        </div>

        {/* Navigation group - 3 at top */}
        <div className="flex flex-col gap-2 pt-4">
          {navigationFocus.map((item) => {
            const Icon = item.icon;
            const isActive = selectedFocus === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setSelectedFocus(item.id as any)}
                className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                  isActive
                    ? `bg-slate-800 border border-cyan-400/50`
                    : 'bg-slate-800/50 border border-transparent hover:border-slate-600'
                }`}
                title={item.label}
              >
                <Icon className={`w-4 h-4 ${isActive ? item.color : 'text-slate-400'}`} />
              </button>
            );
          })}
        </div>

        {/* Satellite views group - 4 icons */}
        <div className="flex flex-col gap-1 mt-4">
          {satelliteViews.map((item) => {
            const Icon = item.icon;
            const isActive = selectedView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setSelectedView(item.id)}
                className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                  isActive
                    ? `bg-slate-800 border border-blue-400/50`
                    : 'bg-slate-800/50 border border-transparent hover:border-slate-600'
                }`}
                title={item.label}
              >
                <Icon className={`w-3 h-3 ${isActive ? item.color : 'text-slate-400'}`} />
              </button>
            );
          })}
        </div>

        {/* Dividing line */}
        <div className="w-6 h-px bg-slate-600/50 mx-auto my-2"></div>

        {/* Ground station views group - 4 icons */}
        <div className="flex flex-col gap-1">
          {groundViews.map((item) => {
            const Icon = item.icon;
            const isActive = selectedView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setSelectedView(item.id)}
                className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                  isActive
                    ? `bg-slate-800 border border-green-400/50`
                    : 'bg-slate-800/50 border border-transparent hover:border-slate-600'
                }`}
                title={item.label}
              >
                <Icon className={`w-3 h-3 ${isActive ? item.color : 'text-slate-400'}`} />
              </button>
            );
          })}
        </div>

        {/* Dividing line */}
        <div className="w-6 h-px bg-slate-600/50 mx-auto my-2"></div>

        {/* Data sources group - 4 icons */}
        <div className="flex flex-col gap-1">
          {dataSources.map((item) => {
            const Icon = item.icon;
            const isActive = selectedView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setSelectedView(item.id)}
                className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                  isActive
                    ? `bg-slate-800 border border-yellow-400/50`
                    : 'bg-slate-800/50 border border-transparent hover:border-slate-600'
                }`}
                title={item.label}
              >
                <Icon className={`w-3 h-3 ${isActive ? item.color : 'text-slate-400'}`} />
              </button>
            );
          })}
        </div>

        {/* Settings at bottom */}
        <div className="mt-auto pb-4">
          <button
            className="w-8 h-8 rounded-lg bg-slate-800/50 border border-transparent hover:border-slate-600 flex items-center justify-center transition-all"
            title="Settings & Options"
          >
            <Settings className="w-4 h-4 text-slate-400" />
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={false}
      animate={{ width: 280 }}
      className="fixed left-0 top-0 h-screen bg-slate-900/95 backdrop-blur-xl border-r border-slate-700/50 z-40 overflow-y-auto"
      onMouseLeave={() => setIsCollapsed(true)}
    >
      <div className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Home className="w-5 h-5 text-cyan-400" />
            <h2 className="font-bold text-lg">View Controls</h2>
          </div>
        </div>

        <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700/50">
          <div className="text-xs text-slate-400 mb-2 uppercase tracking-wider">Current Focus</div>
          <div className="font-semibold text-cyan-400 capitalize">{selectedFocus} Mode</div>
        </div>

        <Separator className="bg-slate-700/50" />

        <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700/50">
          <div className="text-xs text-slate-400 mb-2 uppercase tracking-wider">Selected View</div>
          <div className="font-semibold text-slate-200">
            {selectedView ? selectedView.replace(/[_-]/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'None selected'}
          </div>
        </div>

        <Separator className="bg-slate-700/50" />

        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-slate-300">System Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Radio className="w-4 h-4 text-green-400" />
                <span className="text-xs text-slate-400">Ground Stations</span>
              </div>
              <span className="font-bold text-green-400">{stats.groundStations}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Satellite className="w-4 h-4 text-blue-400" />
                <span className="text-xs text-slate-400">Satellites</span>
              </div>
              <span className="font-bold text-blue-400">{stats.satellites}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ExternalLink className="w-4 h-4 text-cyan-400" />
                <span className="text-xs text-slate-400">Active Links</span>
              </div>
              <span className="font-bold text-cyan-400">{stats.activeLinks}</span>
            </div>
          </CardContent>
        </Card>

        <div className="p-3 bg-slate-800/30 rounded-lg border border-slate-700/50">
          <div className="text-xs text-slate-400 mb-1">Current World</div>
          <div className="font-semibold text-purple-400">{currentWorld}</div>
        </div>
      </div>
    </motion.div>
  );
}
