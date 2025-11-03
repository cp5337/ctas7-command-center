import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";

interface AnimationControls {
  earthRotationSpeed: number;
  linkPulseSpeed: number;
  satelliteRotationSpeed: number;
  crossRoutingFrequency: number;
  solarOptimization: boolean;
  showGroundLinks: boolean;
  showInterSatLinks: boolean;
  showRadiationBelts: boolean;
}

interface AnimationControlPanelProps {
  onControlChange: (controls: AnimationControls) => void;
}

export function AnimationControlPanel({
  onControlChange,
}: AnimationControlPanelProps) {
  const [controls, setControls] = useState<AnimationControls>({
    earthRotationSpeed: 0.25, // degrees per minute
    linkPulseSpeed: 1.0, // pulse frequency multiplier
    satelliteRotationSpeed: 1.0, // satellite spin multiplier
    crossRoutingFrequency: 0.5, // how often cross-routing changes
    solarOptimization: true,
    showGroundLinks: true,
    showInterSatLinks: true,
    showRadiationBelts: true,
  });

  // Performance monitoring state
  const [performanceMode, setPerformanceMode] = useState<
    "quality" | "balanced" | "performance"
  >("balanced");
  const [frameRate, setFrameRate] = useState<number>(30);
  const [entityCulling, setEntityCulling] = useState<boolean>(true);
  const [animationSmoothing, setAnimationSmoothing] = useState<boolean>(true);

  const updateControl = (key: keyof AnimationControls, value: any) => {
    const newControls = { ...controls, [key]: value };
    setControls(newControls);
    onControlChange(newControls);
  };

  const resetToDefaults = () => {
    const defaultControls: AnimationControls = {
      earthRotationSpeed: 0.25,
      linkPulseSpeed: 1.0,
      satelliteRotationSpeed: 1.0,
      crossRoutingFrequency: 0.5,
      solarOptimization: true,
      showGroundLinks: true,
      showInterSatLinks: true,
      showRadiationBelts: true,
    };
    setControls(defaultControls);
    onControlChange(defaultControls);
  };

  return (
    <Card className="absolute top-4 left-4 w-80 bg-black/90 backdrop-blur border-gray-700 text-white z-50">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center justify-between">
          🎛️ Animation Controls
          <Button
            variant="ghost"
            size="sm"
            onClick={resetToDefaults}
            className="text-xs"
          >
            Reset
          </Button>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Earth Rotation Speed */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="text-sm font-medium">🌍 Earth Rotation</label>
            <span className="text-xs text-gray-400">
              {controls.earthRotationSpeed.toFixed(2)}°/min
            </span>
          </div>
          <Slider
            value={[controls.earthRotationSpeed]}
            onValueChange={([value]) =>
              updateControl("earthRotationSpeed", value)
            }
            min={0}
            max={2.0}
            step={0.05}
            className="w-full"
          />
        </div>

        {/* Link Pulse Speed */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="text-sm font-medium">⚡ Laser Pulse Speed</label>
            <span className="text-xs text-gray-400">
              {controls.linkPulseSpeed.toFixed(1)}x
            </span>
          </div>
          <Slider
            value={[controls.linkPulseSpeed]}
            onValueChange={([value]) => updateControl("linkPulseSpeed", value)}
            min={0.1}
            max={3.0}
            step={0.1}
            className="w-full"
          />
        </div>

        {/* Satellite Rotation Speed */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="text-sm font-medium">🛰️ Satellite Spin</label>
            <span className="text-xs text-gray-400">
              {controls.satelliteRotationSpeed.toFixed(1)}x
            </span>
          </div>
          <Slider
            value={[controls.satelliteRotationSpeed]}
            onValueChange={([value]) =>
              updateControl("satelliteRotationSpeed", value)
            }
            min={0}
            max={5.0}
            step={0.1}
            className="w-full"
          />
        </div>

        {/* Cross-Routing Frequency */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="text-sm font-medium">🔄 Cross-Routing</label>
            <span className="text-xs text-gray-400">
              {controls.crossRoutingFrequency.toFixed(1)}x
            </span>
          </div>
          <Slider
            value={[controls.crossRoutingFrequency]}
            onValueChange={([value]) =>
              updateControl("crossRoutingFrequency", value)
            }
            min={0}
            max={2.0}
            step={0.1}
            className="w-full"
          />
        </div>

        {/* Toggle Switches */}
        <div className="space-y-3 pt-2 border-t border-gray-700">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">☀️ Solar Optimization</label>
            <Switch
              checked={controls.solarOptimization}
              onCheckedChange={(checked) =>
                updateControl("solarOptimization", checked)
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">🌐 Ground Links</label>
            <Switch
              checked={controls.showGroundLinks}
              onCheckedChange={(checked) =>
                updateControl("showGroundLinks", checked)
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">🔗 Inter-Sat Links</label>
            <Switch
              checked={controls.showInterSatLinks}
              onCheckedChange={(checked) =>
                updateControl("showInterSatLinks", checked)
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">☢️ Radiation Belts</label>
            <Switch
              checked={controls.showRadiationBelts}
              onCheckedChange={(checked) =>
                updateControl("showRadiationBelts", checked)
              }
            />
          </div>
        </div>

        {/* Quick Presets */}
        <div className="space-y-2 pt-2 border-t border-gray-700">
          <label className="text-sm font-medium">🎯 Quick Presets</label>
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const preset = {
                  ...controls,
                  earthRotationSpeed: 1.0,
                  linkPulseSpeed: 2.0,
                  crossRoutingFrequency: 1.5,
                };
                setControls(preset);
                onControlChange(preset);
              }}
              className="text-xs"
            >
              Fast Mode
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const preset = {
                  ...controls,
                  earthRotationSpeed: 0.1,
                  linkPulseSpeed: 0.5,
                  crossRoutingFrequency: 0.2,
                };
                setControls(preset);
                onControlChange(preset);
              }}
              className="text-xs"
            >
              Slow Mode
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
