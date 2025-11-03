import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";

interface OperatorControlsProps {
  cesiumViewer?: any;
  onConfigChange?: (config: ViewerConfig) => void;
}

interface ViewerConfig {
  briefingMode: boolean;
  showUI: boolean;
  showTimeline: boolean;
  showInfoPanel: boolean;
  showToolbar: boolean;
  showCredits: boolean;
  terrainEnabled: boolean;
  imageryOpacity: number;
  clockMultiplier: number;
}

export const CesiumOperatorControls: React.FC<OperatorControlsProps> = ({
  cesiumViewer,
  onConfigChange,
}) => {
  const [config, setConfig] = useState<ViewerConfig>({
    briefingMode: false,
    showUI: true,
    showTimeline: true,
    showInfoPanel: false,
    showToolbar: true,
    showCredits: false,
    terrainEnabled: true,
    imageryOpacity: 1.0,
    clockMultiplier: 1.0,
  });

  const [isCollapsed, setIsCollapsed] = useState(false);

  // Apply configuration to Cesium viewer
  useEffect(() => {
    if (!cesiumViewer) return;

    try {
      // Briefing mode - clean everything
      if (config.briefingMode) {
        cesiumViewer.cesiumWidget.creditContainer.style.display = "none";
        cesiumViewer.timeline.container.style.display = "none";
        cesiumViewer.animation.container.style.display = "none";
        cesiumViewer.fullscreenButton.container.style.display = "none";
        cesiumViewer.vrButton.container.style.display = "none";
        cesiumViewer.geocoder.container.style.display = "none";
        cesiumViewer.homeButton.container.style.display = "none";
        cesiumViewer.sceneModePicker.container.style.display = "none";
        cesiumViewer.baseLayerPicker.container.style.display = "none";
        cesiumViewer.navigationHelpButton.container.style.display = "none";

        // Remove selection indicator
        cesiumViewer.selectionIndicator.container.style.display = "none";
        cesiumViewer.infoBox.container.style.display = "none";
      } else {
        // Restore individual controls based on settings
        cesiumViewer.cesiumWidget.creditContainer.style.display =
          config.showCredits ? "block" : "none";
        cesiumViewer.timeline.container.style.display = config.showTimeline
          ? "block"
          : "none";
        cesiumViewer.animation.container.style.display = config.showUI
          ? "block"
          : "none";
        cesiumViewer.fullscreenButton.container.style.display = config.showUI
          ? "block"
          : "none";
        cesiumViewer.geocoder.container.style.display = config.showUI
          ? "block"
          : "none";
        cesiumViewer.homeButton.container.style.display = config.showUI
          ? "block"
          : "none";
        cesiumViewer.sceneModePicker.container.style.display = config.showUI
          ? "block"
          : "none";
        cesiumViewer.baseLayerPicker.container.style.display = config.showUI
          ? "block"
          : "none";
        cesiumViewer.navigationHelpButton.container.style.display =
          config.showUI ? "block" : "none";

        cesiumViewer.selectionIndicator.container.style.display =
          config.showInfoPanel ? "block" : "none";
        cesiumViewer.infoBox.container.style.display = config.showInfoPanel
          ? "block"
          : "none";
      }

      // Terrain and imagery controls
      cesiumViewer.terrainProvider = config.terrainEnabled
        ? cesiumViewer.terrainProvider
        : new Cesium.EllipsoidTerrainProvider();

      // Clock multiplier for time control
      cesiumViewer.clock.multiplier = config.clockMultiplier;

      onConfigChange?.(config);
    } catch (error) {
      console.error("Error applying Cesium configuration:", error);
    }
  }, [config, cesiumViewer, onConfigChange]);

  const handleConfigChange = (key: keyof ViewerConfig, value: any) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
  };

  const presetConfigs = {
    briefing: () => {
      setConfig({
        briefingMode: true,
        showUI: false,
        showTimeline: false,
        showInfoPanel: false,
        showToolbar: false,
        showCredits: false,
        terrainEnabled: true,
        imageryOpacity: 1.0,
        clockMultiplier: 1.0,
      });
    },
    operations: () => {
      setConfig({
        briefingMode: false,
        showUI: true,
        showTimeline: true,
        showInfoPanel: true,
        showToolbar: true,
        showCredits: false,
        terrainEnabled: true,
        imageryOpacity: 1.0,
        clockMultiplier: 1.0,
      });
    },
    minimal: () => {
      setConfig({
        briefingMode: false,
        showUI: false,
        showTimeline: true,
        showInfoPanel: false,
        showToolbar: false,
        showCredits: false,
        terrainEnabled: false,
        imageryOpacity: 0.8,
        clockMultiplier: 10.0,
      });
    },
  };

  if (isCollapsed) {
    return (
      <Card className="fixed top-4 right-4 w-12 bg-slate-900/95 border-slate-700 z-50">
        <CardContent className="p-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsCollapsed(false)}
            className="text-slate-300 hover:text-white w-full"
          >
            ⚙️
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="fixed top-4 right-4 w-80 bg-slate-900/95 border-slate-700 text-slate-100 z-50">
      <CardHeader className="pb-2 border-b border-slate-700">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-200">
            OPERATOR CONTROLS
          </h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsCollapsed(true)}
            className="text-slate-400 hover:text-white p-1 h-6 w-6"
          >
            ×
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-3 space-y-4">
        {/* Quick Presets */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-slate-300 uppercase tracking-wide">
            MISSION PRESETS
          </label>
          <div className="grid grid-cols-3 gap-2">
            <Button
              onClick={presetConfigs.briefing}
              size="sm"
              variant={config.briefingMode ? "default" : "outline"}
              className="text-xs py-1 h-8 bg-red-900 hover:bg-red-800 border-red-700"
            >
              BRIEFING
            </Button>
            <Button
              onClick={presetConfigs.operations}
              size="sm"
              variant={
                !config.briefingMode && config.showUI ? "default" : "outline"
              }
              className="text-xs py-1 h-8 bg-blue-900 hover:bg-blue-800 border-blue-700"
            >
              OPS
            </Button>
            <Button
              onClick={presetConfigs.minimal}
              size="sm"
              variant="outline"
              className="text-xs py-1 h-8 border-slate-600 hover:bg-slate-700"
            >
              MIN
            </Button>
          </div>
        </div>

        {/* Interface Controls */}
        <div className="space-y-3 border-t border-slate-700 pt-3">
          <label className="text-xs font-medium text-slate-300 uppercase tracking-wide">
            INTERFACE
          </label>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-300">UI Controls</span>
              <Switch
                checked={config.showUI}
                onCheckedChange={(checked) =>
                  handleConfigChange("showUI", checked)
                }
                disabled={config.briefingMode}
              />
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-300">Timeline</span>
              <Switch
                checked={config.showTimeline}
                onCheckedChange={(checked) =>
                  handleConfigChange("showTimeline", checked)
                }
                disabled={config.briefingMode}
              />
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-300">Info Panels</span>
              <Switch
                checked={config.showInfoPanel}
                onCheckedChange={(checked) =>
                  handleConfigChange("showInfoPanel", checked)
                }
                disabled={config.briefingMode}
              />
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-300">Credits</span>
              <Switch
                checked={config.showCredits}
                onCheckedChange={(checked) =>
                  handleConfigChange("showCredits", checked)
                }
                disabled={config.briefingMode}
              />
            </div>
          </div>
        </div>

        {/* Visual Controls */}
        <div className="space-y-3 border-t border-slate-700 pt-3">
          <label className="text-xs font-medium text-slate-300 uppercase tracking-wide">
            VISUALIZATION
          </label>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-300">Terrain</span>
              <Switch
                checked={config.terrainEnabled}
                onCheckedChange={(checked) =>
                  handleConfigChange("terrainEnabled", checked)
                }
              />
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-300">Imagery Opacity</span>
                <span className="text-xs text-slate-400">
                  {Math.round(config.imageryOpacity * 100)}%
                </span>
              </div>
              <Slider
                value={[config.imageryOpacity]}
                onValueChange={([value]) =>
                  handleConfigChange("imageryOpacity", value)
                }
                max={1}
                min={0}
                step={0.1}
                className="w-full"
              />
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-300">Time Multiplier</span>
                <span className="text-xs text-slate-400">
                  {config.clockMultiplier}x
                </span>
              </div>
              <Slider
                value={[config.clockMultiplier]}
                onValueChange={([value]) =>
                  handleConfigChange("clockMultiplier", value)
                }
                max={3600}
                min={0.1}
                step={0.1}
                className="w-full"
              />
            </div>
          </div>
        </div>

        {/* Status Indicator */}
        <div className="border-t border-slate-700 pt-3">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400">Mode:</span>
            <span
              className={`font-medium ${
                config.briefingMode
                  ? "text-red-400"
                  : config.showUI
                  ? "text-blue-400"
                  : "text-yellow-400"
              }`}
            >
              {config.briefingMode
                ? "BRIEFING"
                : config.showUI
                ? "OPERATIONAL"
                : "MINIMAL"}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CesiumOperatorControls;
