// Enhanced satellite data for Walker Delta FSO constellation
export interface SatelliteData {
  name: string;
  lat: number;
  lon: number;
  alt: number;
  velocity: number;
  noradId: string;
  status: 'active' | 'tracking' | 'offline' | 'simulated';
  // Orbital parameters
  inclination: number;
  raan: number; // Right Ascension of Ascending Node
  meanAnomaly: number;
  plane: number;
  slot: number;
  // Cross-link information
  crossLinks: {
    forward: { node: string; status: 'good' | 'marginal' | 'poor' };
    backward: { node: string; status: 'good' | 'marginal' | 'poor' };
    left: { node: string; status: 'good' | 'marginal' | 'poor' };
    right: { node: string; status: 'good' | 'marginal' | 'poor' };
  };
  // Physical bus data
  busType: string;
  mass: number;
  powerLevel: number; // percentage
  payloadStatus: 'active' | 'standby' | 'offline';
  thermalStatus: 'nominal' | 'marginal' | 'critical';
}

export const generateMockSatelliteData = (): SatelliteData[] => {
  // Walker Delta constellation in Van Allen belt for Laser Light Free Space Optical satellites
  const walkerDeltaParams = {
    totalSats: 12,
    planes: 3,
    satsPerPlane: 4,
    phasing: 1,
    altitude: 15000, // Van Allen belt middle region (13,000-60,000 km)
    inclination: 55.0, // Walker Delta inclination
  };

  // Greek alphabet names for satellites
  const greekAlphabet = [
    'Alpha', 'Beta', 'Gamma', 'Delta', 'Epsilon', 'Zeta',
    'Eta', 'Theta', 'Iota', 'Kappa', 'Lambda', 'Mu'
  ];

  const time = Date.now() / 100000;
  const satellites = [];

  for (let plane = 0; plane < walkerDeltaParams.planes; plane++) {
    for (let sat = 0; sat < walkerDeltaParams.satsPerPlane; sat++) {
      const satIndex = plane * walkerDeltaParams.satsPerPlane + sat;

      // Walker Delta pattern calculations
      const meanAnomaly = (sat * 360 / walkerDeltaParams.satsPerPlane) +
                         (plane * walkerDeltaParams.phasing * 360 / walkerDeltaParams.totalSats) +
                         (time * 2); // orbital motion
      const raan = plane * 360 / walkerDeltaParams.planes; // Right Ascension of Ascending Node

      // Convert to lat/lon for display
      const lat = walkerDeltaParams.inclination * Math.sin((meanAnomaly + raan) * Math.PI / 180);
      const lon = ((meanAnomaly + raan + time) % 360) - 180;

      // Calculate cross-link neighbors in Walker Delta pattern
      const forwardSlot = (sat + 1) % walkerDeltaParams.satsPerPlane;
      const backwardSlot = (sat - 1 + walkerDeltaParams.satsPerPlane) % walkerDeltaParams.satsPerPlane;
      const leftPlane = (plane - 1 + walkerDeltaParams.planes) % walkerDeltaParams.planes;
      const rightPlane = (plane + 1) % walkerDeltaParams.planes;

      // Random link health simulation
      const linkHealth = () => {
        const rand = Math.random();
        return rand > 0.8 ? 'marginal' : rand > 0.95 ? 'poor' : 'good';
      };

      const statusTypes: ('active' | 'tracking' | 'offline' | 'simulated')[] = ['active', 'tracking', 'simulated'];
      const thermalStates: ('nominal' | 'marginal' | 'critical')[] = ['nominal', 'nominal', 'nominal', 'marginal'];

      satellites.push({
        name: greekAlphabet[satIndex],
        lat: lat,
        lon: lon,
        alt: walkerDeltaParams.altitude + (satIndex * 50),
        velocity: 4.2,
        noradId: `FSO${String(satIndex + 1).padStart(3, '0')}`,
        status: statusTypes[satIndex % statusTypes.length],
        // Orbital parameters
        inclination: walkerDeltaParams.inclination,
        raan: raan,
        meanAnomaly: meanAnomaly % 360,
        plane: plane,
        slot: sat,
        // Cross-link information
        crossLinks: {
          forward: {
            node: `(${plane},${forwardSlot})`,
            status: linkHealth() as 'good' | 'marginal' | 'poor'
          },
          backward: {
            node: `(${plane},${backwardSlot})`,
            status: linkHealth() as 'good' | 'marginal' | 'poor'
          },
          left: {
            node: `(${leftPlane},${sat})`,
            status: linkHealth() as 'good' | 'marginal' | 'poor'
          },
          right: {
            node: `(${rightPlane},${sat})`,
            status: linkHealth() as 'good' | 'marginal' | 'poor'
          }
        },
        // Physical bus data
        busType: 'MEO Optical Node',
        mass: 850 + (satIndex * 10), // kg
        powerLevel: 75 + Math.floor(Math.random() * 20), // 75-95%
        payloadStatus: (satIndex % 5 === 0 ? 'standby' : 'active') as 'active' | 'standby' | 'offline',
        thermalStatus: thermalStates[satIndex % thermalStates.length]
      });
    }
  }

  return satellites;
};