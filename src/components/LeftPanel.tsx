import { useState } from 'react';
import { motion } from 'framer-motion';
import { Globe, Activity, Satellite, Radio, ChevronRight, Target } from 'lucide-react';
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
  const [panelMode, setPanelMode] = useState<'main' | 'satellites'>('main');

  const worlds: { id: WorldType; label: string; color: string; icon: typeof Globe }[] = [
    { id: 'production', label: 'Production', color: 'text-green-400 border-green-400/50', icon: Globe },
    { id: 'staging', label: 'Staging', color: 'text-blue-400 border-blue-400/50', icon: Globe },
    { id: 'sandbox', label: 'Sandbox', color: 'text-yellow-400 border-yellow-400/50', icon: Globe },
    { id: 'fusion', label: 'Fusion View', color: 'text-purple-400 border-purple-400/50', icon: Globe },
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

        {/* Glyphs start at top */}
        <div className="flex flex-col gap-2 pt-4">
          {worlds.slice(0, 3).map((world) => {
            const Icon = world.icon;
            const isActive = currentWorld === world.id;
            return (
              <button
                key={world.id}
                onClick={() => onWorldChange(world.id)}
                className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                  isActive
                    ? `bg-slate-800 border ${world.color}`
                    : 'bg-slate-800/50 border border-transparent hover:border-slate-600'
                }`}
                title={world.label}
              >
                <Icon className={`w-4 h-4 ${isActive ? world.color.split(' ')[0] : 'text-slate-400'}`} />
              </button>
            );
          })}
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
            {panelMode === 'main' ? (
              <Globe className="w-5 h-5 text-cyan-400" />
            ) : (
              <Target className="w-5 h-5 text-red-400" />
            )}
            <h2 className="font-bold text-lg">
              {panelMode === 'main' ? 'Operator Controls' : 'Satellite Controls'}
            </h2>
          </div>
        </div>

        {/* Two-Position Selector */}
        <div className="bg-slate-800/50 rounded-lg p-2 border border-slate-700/50">
          <div className="flex items-center space-x-1">
            <button
              onClick={() => setPanelMode('main')}
              className={`flex-1 text-xs py-2 px-3 rounded-md transition-all ${
                panelMode === 'main'
                  ? 'bg-cyan-500 text-white'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700'
              }`}
            >
              Main Menu
            </button>
            <button
              onClick={() => setPanelMode('satellites')}
              className={`flex-1 text-xs py-2 px-3 rounded-md transition-all ${
                panelMode === 'satellites'
                  ? 'bg-red-500 text-white'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700'
              }`}
            >
              Satellite Control
            </button>
          </div>
        </div>

        <Separator className="bg-slate-700/50" />

        {panelMode === 'main' ? (
          <>
            <div>
              <h3 className="text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">World Selection</h3>
              <div className="space-y-2">
                {worlds.map((world) => {
                  const Icon = world.icon;
                  const isActive = currentWorld === world.id;
                  return (
                    <Button
                      key={world.id}
                      variant={isActive ? 'default' : 'ghost'}
                      className={`w-full justify-start ${
                        isActive
                          ? `bg-slate-800 border ${world.color} hover:bg-slate-800/80`
                          : 'hover:bg-slate-800'
                      }`}
                      onClick={() => onWorldChange(world.id)}
                    >
                      <Icon className={`w-4 h-4 mr-2 ${isActive ? world.color.split(' ')[0] : 'text-slate-400'}`} />
                      {world.label}
                    </Button>
                  );
                })}
              </div>
            </div>

            <Separator className="bg-slate-700/50" />

            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold text-slate-300">Quick Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-green-400" />
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
                    <Radio className="w-4 h-4 text-cyan-400" />
                    <span className="text-xs text-slate-400">Active Links</span>
                  </div>
                  <span className="font-bold text-cyan-400">{stats.activeLinks}</span>
                </div>
              </CardContent>
            </Card>

            <div className="p-3 bg-slate-800/30 rounded-lg border border-slate-700/50">
              <div className="text-xs text-slate-400 mb-1">Current World</div>
              <div className="font-semibold">{worlds.find(w => w.id === currentWorld)?.label}</div>
            </div>
          </>
        ) : (
          <>
            {/* Satellite Control Panel Content */}
            <div className="bg-slate-800/50 rounded-lg p-4 border border-cyan-500/20">
              <div className="flex items-center space-x-2 mb-3">
                <Target className="w-4 h-4 text-red-400" />
                <span className="text-sm font-semibold text-slate-200 uppercase tracking-wider">
                  Quick Bird Jump
                </span>
              </div>
              <div className="relative mb-4">
                <select className="w-full bg-slate-900 border border-cyan-500/30 text-cyan-400 text-sm rounded px-3 py-2 pr-8 appearance-none focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400">
                  <option value="">Select Satellite Target</option>
                  <option value="Alpha">Alpha</option>
                  <option value="Beta">Beta</option>
                  <option value="Gamma">Gamma</option>
                  <option value="Delta">Delta</option>
                </select>
                <Target className="w-3 h-3 text-cyan-500 absolute right-3 top-3 pointer-events-none" />
              </div>
            </div>

            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold text-slate-300">Constellation Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Total Satellites:</span>
                  <span className="text-green-400 font-mono">12</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Visible Now:</span>
                  <span className="text-cyan-400 font-mono">8</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Orbital Pattern:</span>
                  <span className="text-green-400 font-mono">12/4/1</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Altitude:</span>
                  <span className="text-cyan-400 font-mono">~21,000 km</span>
                </div>
              </CardContent>
            </Card>

            <div className="bg-slate-800/50 rounded-lg p-3 border border-amber-500/20">
              <div className="text-xs text-slate-400 mb-2">Ground Tracking</div>
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Last Update:</span>
                  <span className="text-slate-300 font-mono">{new Date().toLocaleTimeString()}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Auto-Refresh:</span>
                  <span className="text-green-400 font-mono">30s</span>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </motion.div>
  );
}
