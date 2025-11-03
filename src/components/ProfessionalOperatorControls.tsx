// Professional Operator Interface - No Emojis, Clean Design
// Closed by default, hover states, contextual info, edge glow for active states

import React, { useState, useCallback } from "react";
import { MonteCarloGPU, LasVegasRandomizer } from "../utils/gpu-algorithms";

interface OperatorControlState {
  earthRotation: number;
  laserPulseSpeed: number;
  satelliteSpin: number;
  crossRouting: number;
  solarOptimization: boolean;
  groundLinks: boolean;
  interSatLinks: boolean;
  radiationBelts: boolean;
}

interface LayerVisibility {
  groundStations: { visible: boolean; opacity: number; tiers: boolean[] };
  satellites: { visible: boolean; opacity: number };
  orbitalPaths: { visible: boolean; opacity: number };
  radiationBelts: { visible: boolean; opacity: number };
  orbitalZones: { visible: boolean; opacity: number };
}

const ProfessionalOperatorControls: React.FC = () => {
  const [controlsCollapsed, setControlsCollapsed] = useState(true);
  const [layersCollapsed, setLayersCollapsed] = useState(true);
  const [timeCollapsed, setTimeCollapsed] = useState(true);

  const [controls, setControls] = useState<OperatorControlState>({
    earthRotation: 0.25,
    laserPulseSpeed: 0.5,
    satelliteSpin: 1.0,
    crossRouting: 0.4,
    solarOptimization: false,
    groundLinks: false,
    interSatLinks: false,
    radiationBelts: false,
  });

  const [layers, setLayers] = useState<LayerVisibility>({
    groundStations: { visible: true, opacity: 100, tiers: [true, true, true] },
    satellites: { visible: true, opacity: 65 },
    orbitalPaths: { visible: true, opacity: 10 },
    radiationBelts: { visible: true, opacity: 30 },
    orbitalZones: { visible: false, opacity: 0 },
  });

  const [animationSpeed, setAnimationSpeed] = useState(1);
  const [isAnimating, setIsAnimating] = useState(false);

  // GPU Monte Carlo and Las Vegas algorithms
  const [monteCarloGPU] = useState(() => new MonteCarloGPU());
  const [lasVegasRandom] = useState(() => new LasVegasRandomizer());

  // Professional control panel styles - no emojis, minimal design
  const controlStyles = {
    container: "fixed top-4 left-4 z-50 font-mono text-sm select-none",
    panel:
      "bg-gray-900/95 border border-gray-700/50 backdrop-blur-sm rounded-sm",
    header:
      "px-3 py-2 border-b border-gray-700/30 cursor-pointer transition-all duration-200",
    headerCollapsed:
      "hover:border-cyan-500/30 hover:shadow-[0_0_8px_rgba(6,182,212,0.3)]",
    headerActive: "border-cyan-500/50 shadow-[0_0_12px_rgba(6,182,212,0.4)]",
    content: "px-3 py-2 space-y-3",
    control: "flex items-center justify-between py-1 group",
    label: "text-gray-300 text-xs uppercase tracking-wide transition-colors",
    labelHover: "group-hover:text-cyan-400",
    value: "text-cyan-400 font-bold ml-3",
    slider: "w-16 h-1 bg-gray-700 rounded-full appearance-none cursor-pointer",
    toggle:
      "w-3 h-3 border border-gray-600 rounded-sm cursor-pointer transition-all",
    toggleActive:
      "bg-cyan-500 border-cyan-500 shadow-[0_0_6px_rgba(6,182,212,0.6)]",
    glyph: "w-2 h-2 mr-2 transition-all duration-200",
    glyphInactive: "bg-gray-600 rounded-full opacity-40",
    glyphActive:
      "bg-cyan-500 rounded-full shadow-[0_0_8px_rgba(6,182,212,0.8)]",
    glyphHover: "bg-cyan-400 shadow-[0_0_6px_rgba(6,182,212,0.6)] scale-110",
  };

  // GPU-accelerated Monte Carlo simulation for weather patterns
  const runMonteCarloWeather = useCallback(
    async (years: number = 5) => {
      const scenarios = await monteCarloGPU.simulateWeatherPatterns({
        years,
        iterations: 10000,
        variables: ["temperature", "precipitation", "wind", "humidity"],
        uncertaintyBounds: { temperature: 2.0, precipitation: 0.3 },
      });

      // Las Vegas algorithm for random scenario selection
      const selectedScenarios = lasVegasRandom.selectOptimalScenarios(
        scenarios,
        {
          maxIterations: 1000,
          successProbability: 0.95,
          criteria: "extremeWeatherEvents",
        }
      );

      return selectedScenarios;
    },
    [monteCarloGPU, lasVegasRandom]
  );

  // Right-click contextual information
  const handleRightClick = (e: React.MouseEvent, info: string) => {
    e.preventDefault();
    // Show contextual tooltip with technical information
    console.log(`Context: ${info}`);
  };

  const ControlPanel = ({ title, isCollapsed, onToggle, children }: any) => (
    <div className={controlStyles.panel}>
      <div
        className={`${controlStyles.header} ${
          isCollapsed
            ? controlStyles.headerCollapsed
            : controlStyles.headerActive
        }`}
        onClick={onToggle}
        onContextMenu={(e) =>
          handleRightClick(e, `${title} configuration panel`)
        }
      >
        <span className="text-gray-300 text-xs font-bold tracking-wider uppercase">
          {title}
        </span>
        <span className="text-gray-600 ml-2 text-xs">
          {isCollapsed ? "▶" : "▼"}
        </span>
      </div>
      {!isCollapsed && <div className={controlStyles.content}>{children}</div>}
    </div>
  );

  const ControlSlider = ({
    label,
    value,
    onChange,
    min = 0,
    max = 1,
    step = 0.01,
    unit = "",
    info,
  }: any) => (
    <div
      className={controlStyles.control}
      onContextMenu={(e) => handleRightClick(e, info)}
    >
      <div className="flex items-center">
        <div
          className={`${controlStyles.glyph} ${
            value > 0 ? controlStyles.glyphActive : controlStyles.glyphInactive
          } group-hover:${controlStyles.glyphHover}`}
        />
        <span className={`${controlStyles.label} ${controlStyles.labelHover}`}>
          {label}
        </span>
      </div>
      <div className="flex items-center">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className={controlStyles.slider}
        />
        <span className={controlStyles.value}>
          {typeof value === "number" ? value.toFixed(2) : value}
          {unit}
        </span>
      </div>
    </div>
  );

  const ControlToggle = ({ label, value, onChange, info }: any) => (
    <div
      className={controlStyles.control}
      onContextMenu={(e) => handleRightClick(e, info)}
    >
      <div className="flex items-center">
        <div
          className={`${controlStyles.glyph} ${
            value ? controlStyles.glyphActive : controlStyles.glyphInactive
          } group-hover:${controlStyles.glyphHover}`}
        />
        <span className={`${controlStyles.label} ${controlStyles.labelHover}`}>
          {label}
        </span>
      </div>
      <div
        className={`${controlStyles.toggle} ${
          value ? controlStyles.toggleActive : ""
        }`}
        onClick={() => onChange(!value)}
      />
    </div>
  );

  const LayerControl = ({
    label,
    visible,
    opacity,
    onChange,
    onOpacityChange,
    info,
  }: any) => (
    <div
      className={controlStyles.control}
      onContextMenu={(e) => handleRightClick(e, info)}
    >
      <div className="flex items-center">
        <div
          className={`${controlStyles.glyph} ${
            visible ? controlStyles.glyphActive : controlStyles.glyphInactive
          } group-hover:${controlStyles.glyphHover}`}
        />
        <span className={`${controlStyles.label} ${controlStyles.labelHover}`}>
          {label}
        </span>
      </div>
      <div className="flex items-center space-x-2">
        <div
          className={`${controlStyles.toggle} ${
            visible ? controlStyles.toggleActive : ""
          }`}
          onClick={() => onChange(!visible)}
        />
        {visible && (
          <>
            <input
              type="range"
              min={0}
              max={100}
              value={opacity}
              onChange={(e) => onOpacityChange(parseInt(e.target.value))}
              className={`${controlStyles.slider} w-12`}
            />
            <span className={`${controlStyles.value} text-xs`}>{opacity}%</span>
          </>
        )}
      </div>
    </div>
  );

  return (
    <div className={controlStyles.container}>
      {/* Animation Controls */}
      <ControlPanel
        title="ANIMATION"
        isCollapsed={controlsCollapsed}
        onToggle={() => setControlsCollapsed(!controlsCollapsed)}
      >
        <ControlSlider
          label="EARTH ROT"
          value={controls.earthRotation}
          onChange={(val: number) =>
            setControls((prev) => ({ ...prev, earthRotation: val }))
          }
          max={2}
          unit="/min"
          info="Earth rotation speed in revolutions per minute"
        />
        <ControlSlider
          label="LASER PULSE"
          value={controls.laserPulseSpeed}
          onChange={(val: number) =>
            setControls((prev) => ({ ...prev, laserPulseSpeed: val }))
          }
          max={2}
          unit="x"
          info="Laser communication pulse frequency multiplier"
        />
        <ControlSlider
          label="SAT SPIN"
          value={controls.satelliteSpin}
          onChange={(val: number) =>
            setControls((prev) => ({ ...prev, satelliteSpin: val }))
          }
          max={5}
          unit="x"
          info="Satellite rotation speed multiplier"
        />
        <ControlSlider
          label="X-ROUTING"
          value={controls.crossRouting}
          onChange={(val: number) =>
            setControls((prev) => ({ ...prev, crossRouting: val }))
          }
          max={1}
          unit="x"
          info="Cross-satellite routing efficiency factor"
        />

        <div className="border-t border-gray-700/30 pt-3 mt-3">
          <ControlToggle
            label="SOLAR OPT"
            value={controls.solarOptimization}
            onChange={(val: boolean) =>
              setControls((prev) => ({ ...prev, solarOptimization: val }))
            }
            info="Solar panel optimization tracking enabled"
          />
          <ControlToggle
            label="GND LINKS"
            value={controls.groundLinks}
            onChange={(val: boolean) =>
              setControls((prev) => ({ ...prev, groundLinks: val }))
            }
            info="Ground station communication links visible"
          />
          <ControlToggle
            label="ISAT LINKS"
            value={controls.interSatLinks}
            onChange={(val: boolean) =>
              setControls((prev) => ({ ...prev, interSatLinks: val }))
            }
            info="Inter-satellite communication links visible"
          />
          <ControlToggle
            label="RAD BELTS"
            value={controls.radiationBelts}
            onChange={(val: boolean) =>
              setControls((prev) => ({ ...prev, radiationBelts: val }))
            }
            info="Van Allen radiation belt visualization"
          />
        </div>
      </ControlPanel>

      {/* Layer Visibility */}
      <div className="mt-2">
        <ControlPanel
          title="LAYERS"
          isCollapsed={layersCollapsed}
          onToggle={() => setLayersCollapsed(!layersCollapsed)}
        >
          <LayerControl
            label="GND STATIONS"
            visible={layers.groundStations.visible}
            opacity={layers.groundStations.opacity}
            onChange={(visible: boolean) =>
              setLayers((prev) => ({
                ...prev,
                groundStations: { ...prev.groundStations, visible },
              }))
            }
            onOpacityChange={(opacity: number) =>
              setLayers((prev) => ({
                ...prev,
                groundStations: { ...prev.groundStations, opacity },
              }))
            }
            info="Ground station network (289 active stations)"
          />

          {layers.groundStations.visible && (
            <div className="ml-4 space-y-1 border-l border-gray-700/30 pl-3">
              {[
                "Tier 1 (Primary)",
                "Tier 2 (Secondary)",
                "Tier 3 (Backup)",
              ].map((tier, idx) => (
                <div
                  key={tier}
                  className="flex items-center justify-between py-0.5"
                >
                  <span className="text-gray-400 text-xs">{tier}</span>
                  <div
                    className={`${controlStyles.toggle} scale-75 ${
                      layers.groundStations.tiers[idx]
                        ? controlStyles.toggleActive
                        : ""
                    }`}
                    onClick={() => {
                      const newTiers = [...layers.groundStations.tiers];
                      newTiers[idx] = !newTiers[idx];
                      setLayers((prev) => ({
                        ...prev,
                        groundStations: {
                          ...prev.groundStations,
                          tiers: newTiers,
                        },
                      }));
                    }}
                  />
                </div>
              ))}
            </div>
          )}

          <LayerControl
            label="SATELLITES"
            visible={layers.satellites.visible}
            opacity={layers.satellites.opacity}
            onChange={(visible: boolean) =>
              setLayers((prev) => ({
                ...prev,
                satellites: { ...prev.satellites, visible },
              }))
            }
            onOpacityChange={(opacity: number) =>
              setLayers((prev) => ({
                ...prev,
                satellites: { ...prev.satellites, opacity },
              }))
            }
            info="Active satellite constellation tracking"
          />

          <LayerControl
            label="ORBITAL PATHS"
            visible={layers.orbitalPaths.visible}
            opacity={layers.orbitalPaths.opacity}
            onChange={(visible: boolean) =>
              setLayers((prev) => ({
                ...prev,
                orbitalPaths: { ...prev.orbitalPaths, visible },
              }))
            }
            onOpacityChange={(opacity: number) =>
              setLayers((prev) => ({
                ...prev,
                orbitalPaths: { ...prev.orbitalPaths, opacity },
              }))
            }
            info="Predicted orbital trajectories and ground tracks"
          />

          <LayerControl
            label="RADIATION"
            visible={layers.radiationBelts.visible}
            opacity={layers.radiationBelts.opacity}
            onChange={(visible: boolean) =>
              setLayers((prev) => ({
                ...prev,
                radiationBelts: { ...prev.radiationBelts, visible },
              }))
            }
            onOpacityChange={(opacity: number) =>
              setLayers((prev) => ({
                ...prev,
                radiationBelts: { ...prev.radiationBelts, opacity },
              }))
            }
            info="Van Allen radiation belt intensity mapping"
          />

          <LayerControl
            label="ORB ZONES"
            visible={layers.orbitalZones.visible}
            opacity={layers.orbitalZones.opacity}
            onChange={(visible: boolean) =>
              setLayers((prev) => ({
                ...prev,
                orbitalZones: { ...prev.orbitalZones, visible },
              }))
            }
            onOpacityChange={(opacity: number) =>
              setLayers((prev) => ({
                ...prev,
                orbitalZones: { ...prev.orbitalZones, opacity },
              }))
            }
            info="Orbital zone classifications and exclusion areas"
          />
        </ControlPanel>
      </div>

      {/* Time Controls */}
      <div className="mt-2">
        <ControlPanel
          title="TIME"
          isCollapsed={timeCollapsed}
          onToggle={() => setTimeCollapsed(!timeCollapsed)}
        >
          <div className="flex items-center space-x-2 mb-3">
            <button
              className="px-2 py-1 bg-gray-800 border border-gray-600 text-gray-300 text-xs hover:border-cyan-500 hover:text-cyan-400 transition-all"
              onClick={() => setIsAnimating(!isAnimating)}
            >
              {isAnimating ? "PAUSE" : "PLAY"}
            </button>
            <button
              className="px-2 py-1 bg-gray-800 border border-gray-600 text-gray-300 text-xs hover:border-cyan-500 hover:text-cyan-400 transition-all"
              onClick={() => setAnimationSpeed(1)}
            >
              RESET
            </button>
          </div>

          <ControlSlider
            label="SPEED"
            value={animationSpeed}
            onChange={setAnimationSpeed}
            min={0.1}
            max={100}
            step={0.1}
            unit="x"
            info="Animation time multiplier"
          />

          <div className="mt-3 pt-3 border-t border-gray-700/30">
            <div className="flex items-center justify-between">
              <span className="text-gray-400 text-xs">STATUS</span>
              <div className="flex items-center">
                <div
                  className={`w-2 h-2 rounded-full mr-2 ${
                    isAnimating
                      ? "bg-green-500 shadow-[0_0_6px_rgba(34,197,94,0.6)]"
                      : "bg-gray-600"
                  }`}
                />
                <span
                  className={`text-xs ${
                    isAnimating ? "text-green-400" : "text-gray-500"
                  }`}
                >
                  {isAnimating ? "ANIMATING" : "PAUSED"}
                </span>
              </div>
            </div>
          </div>
        </ControlPanel>
      </div>

      {/* GPU Monte Carlo Controls */}
      <div className="mt-2">
        <ControlPanel
          title="MONTE CARLO"
          isCollapsed={true}
          onToggle={() => {}}
        >
          <button
            className="w-full px-2 py-1 bg-gray-800 border border-gray-600 text-gray-300 text-xs hover:border-cyan-500 hover:text-cyan-400 transition-all"
            onClick={() => runMonteCarloWeather(5)}
          >
            RUN 5-YEAR WEATHER SIM
          </button>
        </ControlPanel>
      </div>
    </div>
  );
};

export default ProfessionalOperatorControls;
