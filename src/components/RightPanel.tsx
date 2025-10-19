import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Layers, Play, Pause, RotateCcw, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Checkbox } from './ui/checkbox';
import { Slider } from './ui/slider';
import { Label } from './ui/label';

export interface LayerConfig {
  id: string;
  label: string;
  visible: boolean;
  color: string;
  opacity: number;
  children?: LayerConfig[];
}

interface RightPanelProps {
  layers: LayerConfig[];
  onLayerToggle: (layerId: string, visible: boolean) => void;
  onLayerOpacityChange: (layerId: string, opacity: number) => void;
  timeControl: {
    isPlaying: boolean;
    speed: number;
  };
  onPlayPause: () => void;
  onSpeedChange: (speed: number) => void;
  onReset: () => void;
}

export function RightPanel({
  layers,
  onLayerToggle,
  onLayerOpacityChange,
  timeControl,
  onPlayPause,
  onSpeedChange,
  onReset,
}: RightPanelProps) {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [layersExpanded, setLayersExpanded] = useState(false);
  const [timeExpanded, setTimeExpanded] = useState(false);

  if (isCollapsed) {
    return (
      <motion.div
        initial={false}
        animate={{ width: 64 }}
        className="fixed right-0 top-0 h-screen bg-slate-900/95 backdrop-blur-xl border-l border-slate-700/50 z-40 flex flex-col items-center py-4"
      >
        <button
          onClick={() => setIsCollapsed(false)}
          className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-3 w-6 h-24 bg-slate-800/90 hover:bg-slate-700/90 border border-slate-600/50 hover:border-cyan-400/50 rounded-l-lg shadow-lg transition-all duration-200 flex items-center justify-center group touch-manipulation"
          aria-label="Expand panel"
        >
          <div className="flex flex-col gap-1">
            <div className="w-0.5 h-3 bg-slate-500 group-hover:bg-cyan-400 rounded transition-colors" />
            <div className="w-0.5 h-3 bg-slate-500 group-hover:bg-cyan-400 rounded transition-colors" />
            <div className="w-0.5 h-3 bg-slate-500 group-hover:bg-cyan-400 rounded transition-colors" />
          </div>
        </button>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsCollapsed(false)}
          className="mb-4 hover:bg-slate-800"
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>

        <div className="flex flex-col gap-3">
          <div className="w-10 h-10 rounded-lg bg-slate-800/50 border border-slate-600 flex items-center justify-center">
            <Layers className="w-5 h-5 text-slate-400" />
          </div>
          <div className="w-10 h-10 rounded-lg bg-slate-800/50 border border-slate-600 flex items-center justify-center">
            {timeControl.isPlaying ? (
              <Pause className="w-5 h-5 text-green-400" />
            ) : (
              <Play className="w-5 h-5 text-slate-400" />
            )}
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={false}
      animate={{ width: 320 }}
      className="fixed right-3 top-3 bottom-3 w-80 bg-gradient-to-br from-slate-900/95 via-slate-900/98 to-slate-950/95 backdrop-blur-xl rounded-2xl border border-slate-700/50 shadow-2xl z-40 overflow-hidden flex flex-col"
    >
      <div className="p-4 border-b border-slate-700/30 bg-slate-800/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-400/30">
              <Layers className="w-5 h-5 text-cyan-400" />
            </div>
            <h2 className="font-bold text-lg bg-gradient-to-br from-cyan-400 to-blue-500 bg-clip-text text-transparent">Controls</h2>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsCollapsed(true)}
            className="hover:bg-slate-800 rounded-lg"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">

        <Card className="bg-slate-800/40 border-slate-700/50 shadow-lg overflow-hidden">
          <CardHeader
            className="pb-3 cursor-pointer hover:bg-slate-800/60 transition-colors"
            onClick={() => setLayersExpanded(!layersExpanded)}
          >
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Layer Visibility
              </CardTitle>
              {layersExpanded ? (
                <ChevronUp className="w-4 h-4 text-slate-400" />
              ) : (
                <ChevronDown className="w-4 h-4 text-slate-400" />
              )}
            </div>
          </CardHeader>
          <AnimatePresence>
            {layersExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <CardContent className="space-y-4 pt-0">
                  {layers.map((layer) => (
              <div key={layer.id} className="space-y-2 p-2 rounded-lg hover:bg-slate-800/50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id={layer.id}
                      checked={layer.visible}
                      onCheckedChange={(checked) => onLayerToggle(layer.id, checked as boolean)}
                      className="data-[state=checked]:bg-cyan-500 data-[state=checked]:border-cyan-500"
                    />
                    <Label htmlFor={layer.id} className="text-sm cursor-pointer text-slate-200 font-medium">
                      {layer.label}
                    </Label>
                  </div>
                  <div
                    className="w-3 h-3 rounded-full ring-2 ring-slate-700/50"
                    style={{ backgroundColor: layer.color }}
                  />
                </div>

                {layer.visible && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="pl-6 space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-400">Opacity</span>
                      <span className="text-xs font-semibold text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded">{Math.round(layer.opacity * 100)}%</span>
                    </div>
                    <Slider
                      value={[layer.opacity * 100]}
                      onValueChange={([value]) => onLayerOpacityChange(layer.id, value / 100)}
                      max={100}
                      step={5}
                      className="w-full"
                    />
                  </motion.div>
                )}

                {layer.children && layer.visible && (
                  <div className="pl-6 space-y-2 border-l-2 border-slate-700 ml-3">
                    {layer.children.map((child) => (
                      <div key={child.id} className="flex items-center gap-2">
                        <Checkbox
                          id={child.id}
                          checked={child.visible}
                          onCheckedChange={(checked) => onLayerToggle(child.id, checked as boolean)}
                        />
                        <Label htmlFor={child.id} className="text-xs cursor-pointer text-slate-400">
                          {child.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
                </CardContent>
              </motion.div>
            )}
          </AnimatePresence>
        </Card>

        <Card className="bg-slate-800/40 border-slate-700/50 shadow-lg overflow-hidden">
          <CardHeader
            className="pb-3 cursor-pointer hover:bg-slate-800/60 transition-colors"
            onClick={() => setTimeExpanded(!timeExpanded)}
          >
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                Time Controls
              </CardTitle>
              {timeExpanded ? (
                <ChevronUp className="w-4 h-4 text-slate-400" />
              ) : (
                <ChevronDown className="w-4 h-4 text-slate-400" />
              )}
            </div>
          </CardHeader>
          <AnimatePresence>
            {timeExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <CardContent className="space-y-4 pt-0">
                  <div className="flex items-center justify-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={onPlayPause}
                      className={`rounded-lg transition-all ${
                        timeControl.isPlaying
                          ? 'bg-green-500/20 border-green-400/50 hover:bg-green-500/30 shadow-lg shadow-green-500/20'
                          : 'hover:bg-slate-800 border-slate-600'
                      }`}
                    >
                      {timeControl.isPlaying ? (
                        <Pause className="w-4 h-4 text-green-400" />
                      ) : (
                        <Play className="w-4 h-4 text-slate-300" />
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={onReset}
                      className="hover:bg-slate-800 border-slate-600 rounded-lg"
                    >
                      <RotateCcw className="w-4 h-4 text-slate-300" />
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-400">Animation Speed</span>
                      <span className="text-xs font-semibold text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded">{timeControl.speed}x</span>
                    </div>
                    <Slider
                      value={[timeControl.speed]}
                      onValueChange={([value]) => onSpeedChange(value)}
                      min={0.1}
                      max={100}
                      step={0.1}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-slate-500">
                      <span>0.1x</span>
                      <span>1x</span>
                      <span>10x</span>
                      <span>100x</span>
                    </div>
                  </div>

                  <div className="p-3 bg-gradient-to-br from-slate-800/50 to-slate-800/30 rounded-lg border border-slate-700/50">
                    <div className="text-xs text-slate-400 mb-2">Status</div>
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-2 h-2 rounded-full ${
                          timeControl.isPlaying ? 'bg-green-400 animate-pulse shadow-lg shadow-green-400/50' : 'bg-slate-500'
                        }`}
                      />
                      <span className="text-sm font-semibold text-slate-200">
                        {timeControl.isPlaying ? 'Animating' : 'Paused'}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </motion.div>
            )}
          </AnimatePresence>
        </Card>

        <div className="p-3 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-lg border border-blue-400/30 shadow-lg">
          <div className="text-xs text-blue-400 font-semibold mb-2 flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
            Quick Presets
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            <Button
              size="sm"
              variant="outline"
              className="text-xs h-7 border-slate-600 hover:bg-slate-800 hover:border-cyan-400/50 transition-all"
              onClick={() => {
                layers.forEach(layer => onLayerToggle(layer.id, true));
              }}
            >
              All Layers
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="text-xs h-7 border-slate-600 hover:bg-slate-800 hover:border-cyan-400/50 transition-all"
              onClick={() => {
                layers.forEach(layer => onLayerToggle(layer.id, false));
              }}
            >
              Clear All
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
