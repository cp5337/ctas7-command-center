// Professional Operator Interface Script for CTAS-7 Ground Station
// Replaces cartoon emoji controls with military-grade interface

class ProfessionalControlInterface {
  constructor() {
    this.panelCollapsed = false;
    this.currentPreset = "briefing";
    this.glyphStates = new Map();
    this.tooltipTimeout = null;

    this.init();
  }

  init() {
    this.setupEventListeners();
    this.startPerformanceMonitoring();
    this.initializeGlyphStates();

    // Set initial briefing mode
    this.setPreset("briefing");

    console.log("🛰️ CTAS-7 Professional Interface Initialized");
  }

  setupEventListeners() {
    // Panel collapse/expand
    document.addEventListener("keydown", (e) => {
      if (e.key === "Tab" && e.ctrlKey) {
        e.preventDefault();
        this.togglePanel();
      }

      // Preset hotkeys
      if (e.ctrlKey && e.altKey) {
        switch (e.key) {
          case "1":
            this.setPreset("operational");
            break;
          case "2":
            this.setPreset("briefing");
            break;
          case "3":
            this.setPreset("minimal");
            break;
          case "4":
            this.setPreset("debug");
            break;
        }
      }
    });

    // Right-click context menu for advanced controls
    document.addEventListener("contextmenu", (e) => {
      if (e.target.classList.contains("control-glyph")) {
        e.preventDefault();
        this.showContextMenu(e, e.target);
      }
    });

    // Mouse wheel for fine control adjustments
    document.addEventListener("wheel", (e) => {
      if (e.target.classList.contains("control-slider") && e.ctrlKey) {
        e.preventDefault();
        const step = parseFloat(e.target.step) || 0.1;
        const delta = e.deltaY > 0 ? -step : step;
        e.target.value = Math.max(
          parseFloat(e.target.min),
          Math.min(parseFloat(e.target.max), parseFloat(e.target.value) + delta)
        );
        e.target.dispatchEvent(new Event("input"));
      }
    });
  }

  initializeGlyphStates() {
    // Initialize all glyph states
    this.glyphStates.set("earth", { active: true, status: "nominal" });
    this.glyphStates.set("sat", { active: true, status: "nominal" });
    this.glyphStates.set("laser", { active: true, status: "warning" });
    this.glyphStates.set("routing", { active: true, status: "nominal" });
    this.glyphStates.set("solar", { active: false, status: "inactive" });
    this.glyphStates.set("ground", { active: true, status: "nominal" });
    this.glyphStates.set("intersat", { active: true, status: "nominal" });
    this.glyphStates.set("radiation", { active: false, status: "critical" });
  }

  updateGlyphStatus(glyphId, status) {
    const glyph = document.getElementById(glyphId + "Glyph");
    if (!glyph) return;

    // Remove all status classes
    glyph.classList.remove("active", "warning", "critical", "inactive");

    // Add appropriate status class
    glyph.classList.add(status);

    // Update internal state
    const currentState = this.glyphStates.get(glyphId) || {};
    this.glyphStates.set(glyphId, {
      ...currentState,
      status,
      lastUpdate: Date.now(),
    });

    // Add subtle animation for status changes
    glyph.style.transform = "scale(1.1)";
    setTimeout(() => {
      glyph.style.transform = "scale(1.0)";
    }, 150);
  }

  togglePanel() {
    const panel = document.getElementById("controlPanel");
    const btn = panel.querySelector(".collapse-btn");
    this.panelCollapsed = !this.panelCollapsed;

    if (this.panelCollapsed) {
      panel.classList.add("collapsed");
      btn.textContent = "⟩";
    } else {
      panel.classList.remove("collapsed");
      btn.textContent = "⟨";
    }

    // Store preference
    localStorage.setItem("ctas7_panel_collapsed", this.panelCollapsed);
  }

  setPreset(presetName) {
    const presets = {
      operational: {
        name: "Operational Mode",
        description: "Full system visibility for active operations",
        config: {
          earth: 0.25,
          sat: 1.0,
          laser: 0.5,
          routing: 0.4,
          solar: false,
          ground: true,
          intersat: true,
          radiation: false,
        },
        glyphs: {
          earth: "active",
          sat: "active",
          laser: "warning",
          routing: "active",
          solar: "inactive",
          ground: "active",
          intersat: "active",
          radiation: "inactive",
        },
      },
      briefing: {
        name: "Briefing Mode",
        description: "Clean view optimized for presentations",
        config: {
          earth: 0.1,
          sat: 0.5,
          laser: 0.2,
          routing: 0.6,
          solar: false,
          ground: true,
          intersat: false,
          radiation: false,
        },
        glyphs: {
          earth: "active",
          sat: "active",
          laser: "active",
          routing: "active",
          solar: "inactive",
          ground: "active",
          intersat: "inactive",
          radiation: "inactive",
        },
      },
      minimal: {
        name: "Minimal Mode",
        description: "Essential elements only",
        config: {
          earth: 0.0,
          sat: 0.0,
          laser: 0.0,
          routing: 0.0,
          solar: false,
          ground: false,
          intersat: false,
          radiation: false,
        },
        glyphs: {
          earth: "inactive",
          sat: "inactive",
          laser: "inactive",
          routing: "inactive",
          solar: "inactive",
          ground: "inactive",
          intersat: "inactive",
          radiation: "inactive",
        },
      },
      debug: {
        name: "Debug Mode",
        description: "Maximum visibility for troubleshooting",
        config: {
          earth: 1.0,
          sat: 2.0,
          laser: 1.5,
          routing: 1.0,
          solar: true,
          ground: true,
          intersat: true,
          radiation: true,
        },
        glyphs: {
          earth: "critical",
          sat: "critical",
          laser: "critical",
          routing: "warning",
          solar: "warning",
          ground: "active",
          intersat: "active",
          radiation: "critical",
        },
      },
    };

    const preset = presets[presetName];
    if (!preset) return;

    this.currentPreset = presetName;

    // Update UI elements
    document.querySelectorAll(".preset-btn").forEach((btn) => {
      btn.classList.remove("active");
      if (btn.textContent.toLowerCase() === presetName) {
        btn.classList.add("active");
      }
    });

    // Apply slider configurations
    Object.entries(preset.config).forEach(([key, value]) => {
      if (typeof value === "number") {
        const slider = document.getElementById(key + "Slider");
        if (slider) {
          slider.value = value;
          this.updateSliderValue(slider, key + "Value");
        }
      } else if (typeof value === "boolean") {
        const toggle = document.getElementById(key + "Toggle");
        if (toggle) {
          if (value) {
            toggle.classList.add("active");
          } else {
            toggle.classList.remove("active");
          }
        }
      }
    });

    // Apply glyph states
    Object.entries(preset.glyphs).forEach(([key, status]) => {
      this.updateGlyphStatus(key, status);
    });

    // Log preset change
    console.log(`🎯 Preset changed to: ${preset.name}`);

    // Store preference
    localStorage.setItem("ctas7_current_preset", presetName);
  }

  updateSliderValue(slider, valueId) {
    const value = parseFloat(slider.value);
    const valueElement = document.getElementById(valueId);

    if (!valueElement) return;

    // Format value based on type
    if (valueId.includes("earth")) {
      valueElement.textContent = value.toFixed(2) + "°/min";
    } else {
      valueElement.textContent = value.toFixed(1) + "x";
    }

    // Auto-update glyph status based on value
    const glyphKey = valueId.replace("Value", "");
    let status = "inactive";

    if (value === 0) {
      status = "inactive";
    } else if (value > 1.5) {
      status = "critical";
    } else if (value > 0.8) {
      status = "warning";
    } else {
      status = "active";
    }

    this.updateGlyphStatus(glyphKey, status);
  }

  showContextMenu(event, glyph) {
    // Create context menu for advanced glyph controls
    const menu = document.createElement("div");
    menu.className = "context-menu";
    menu.style.cssText = `
            position: fixed;
            left: ${event.pageX}px;
            top: ${event.pageY}px;
            background: #1a1a1a;
            border: 1px solid #333;
            border-radius: 4px;
            padding: 8px 0;
            z-index: 2000;
            min-width: 180px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.8);
        `;

    const menuItems = [
      {
        label: "Force Active",
        action: () =>
          this.updateGlyphStatus(glyph.id.replace("Glyph", ""), "active"),
      },
      {
        label: "Set Warning",
        action: () =>
          this.updateGlyphStatus(glyph.id.replace("Glyph", ""), "warning"),
      },
      {
        label: "Set Critical",
        action: () =>
          this.updateGlyphStatus(glyph.id.replace("Glyph", ""), "critical"),
      },
      {
        label: "Deactivate",
        action: () =>
          this.updateGlyphStatus(glyph.id.replace("Glyph", ""), "inactive"),
      },
      { label: "---", action: null },
      {
        label: "Reset to Default",
        action: () => this.resetGlyph(glyph.id.replace("Glyph", "")),
      },
    ];

    menuItems.forEach((item) => {
      if (item.label === "---") {
        const separator = document.createElement("div");
        separator.style.cssText =
          "height: 1px; background: #333; margin: 4px 0;";
        menu.appendChild(separator);
        return;
      }

      const menuItem = document.createElement("div");
      menuItem.textContent = item.label;
      menuItem.style.cssText = `
                padding: 6px 12px;
                cursor: pointer;
                font-size: 11px;
                color: #ccc;
                transition: background 0.2s ease;
            `;

      menuItem.addEventListener("mouseenter", () => {
        menuItem.style.background = "#333";
        menuItem.style.color = "#00ff00";
      });

      menuItem.addEventListener("mouseleave", () => {
        menuItem.style.background = "transparent";
        menuItem.style.color = "#ccc";
      });

      if (item.action) {
        menuItem.addEventListener("click", () => {
          item.action();
          document.body.removeChild(menu);
        });
      }

      menu.appendChild(menuItem);
    });

    document.body.appendChild(menu);

    // Remove menu on outside click
    const removeMenu = (e) => {
      if (!menu.contains(e.target)) {
        document.body.removeChild(menu);
        document.removeEventListener("click", removeMenu);
      }
    };

    setTimeout(() => {
      document.addEventListener("click", removeMenu);
    }, 100);
  }

  resetGlyph(glyphKey) {
    const defaultStates = {
      earth: "active",
      sat: "active",
      laser: "warning",
      routing: "active",
      solar: "inactive",
      ground: "active",
      intersat: "active",
      radiation: "critical",
    };

    this.updateGlyphStatus(glyphKey, defaultStates[glyphKey] || "inactive");
  }

  startPerformanceMonitoring() {
    let frameCount = 0;
    let lastTime = performance.now();

    const updateFPS = () => {
      frameCount++;
      const currentTime = performance.now();

      if (currentTime - lastTime >= 1000) {
        const fps = Math.round((frameCount * 1000) / (currentTime - lastTime));
        const fpsElement = document.getElementById("fpsCounter");
        if (fpsElement) {
          fpsElement.textContent = fps;

          // Color-code FPS based on performance
          if (fps >= 55) {
            fpsElement.style.color = "#00ff00";
          } else if (fps >= 30) {
            fpsElement.style.color = "#ff9500";
          } else {
            fpsElement.style.color = "#ff3333";
          }
        }

        frameCount = 0;
        lastTime = currentTime;
      }

      requestAnimationFrame(updateFPS);
    };

    updateFPS();
  }

  // Public API for integration
  getState() {
    return {
      preset: this.currentPreset,
      collapsed: this.panelCollapsed,
      glyphs: Object.fromEntries(this.glyphStates),
    };
  }

  setState(state) {
    if (state.preset) this.setPreset(state.preset);
    if (
      typeof state.collapsed === "boolean" &&
      state.collapsed !== this.panelCollapsed
    ) {
      this.togglePanel();
    }
    if (state.glyphs) {
      Object.entries(state.glyphs).forEach(([key, glyph]) => {
        if (glyph.status) this.updateGlyphStatus(key, glyph.status);
      });
    }
  }
}

// Initialize when DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  window.ctas7Interface = new ProfessionalControlInterface();
});

// Global functions for HTML event handlers
function togglePanel() {
  if (window.ctas7Interface) {
    window.ctas7Interface.togglePanel();
  }
}

function updateValue(slider, valueId) {
  if (window.ctas7Interface) {
    window.ctas7Interface.updateSliderValue(slider, valueId);
  }
}

function toggleOption(option) {
  const toggle = document.getElementById(option + "Toggle");
  const glyph = document.getElementById(option + "Glyph");

  toggle.classList.toggle("active");

  if (window.ctas7Interface) {
    const status = toggle.classList.contains("active") ? "active" : "inactive";
    window.ctas7Interface.updateGlyphStatus(option, status);
  }
}

function setPreset(preset) {
  if (window.ctas7Interface) {
    window.ctas7Interface.setPreset(preset);
  }
}

function showTooltip(event, text) {
  const tooltip = document.getElementById("tooltip");
  if (tooltip) {
    tooltip.textContent = text;
    tooltip.style.left = event.pageX + 10 + "px";
    tooltip.style.top = event.pageY - 10 + "px";
    tooltip.classList.add("show");
  }
}

function hideTooltip() {
  const tooltip = document.getElementById("tooltip");
  if (tooltip) {
    tooltip.classList.remove("show");
  }
}
