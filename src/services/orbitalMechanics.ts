/**
 * Orbital Mechanics and Ground Station Tracking Service
 * Handles Walker Delta constellation orbital mechanics and ground station calculations
 */

export interface OrbitalElements {
  semiMajorAxis: number;  // km
  eccentricity: number;
  inclination: number;    // degrees
  raan: number;          // Right Ascension of Ascending Node (degrees)
  argumentOfPeriapsis: number; // degrees
  meanAnomaly: number;   // degrees
}

export interface CartesianCoordinates {
  x: number;
  y: number;
  z: number;
}

export interface GeodeticCoordinates {
  lat: number;  // degrees
  lon: number;  // degrees
  alt: number;  // km
}

export interface GroundStationLookAngles {
  azimuth: number;    // degrees
  elevation: number;  // degrees
  range: number;      // km
  declination: number; // degrees from zenith
  slewing: {
    azimuthRate: number;   // deg/sec
    elevationRate: number; // deg/sec
    required: boolean;
  };
}

export interface WalkerDeltaConstellation {
  totalSatellites: number;
  planes: number;
  satellitesPerPlane: number;
  altitude: number;     // km
  inclination: number;  // degrees
  phasing: number;      // phasing factor
}

// Earth parameters
const EARTH_RADIUS_KM = 6378.137;
const EARTH_FLATTENING = 1 / 298.257223563;
const MU_EARTH = 398600.4418; // km³/s²

// Van Allen Belt Walker Delta Configuration - 12/4/1 Pattern
export const WALKER_DELTA_CONFIG: WalkerDeltaConstellation = {
  totalSatellites: 12,
  planes: 3,              // 12 satellites / 4 per plane = 3 planes
  satellitesPerPlane: 4,  // 4 satellites per plane
  altitude: 15000,        // Middle Van Allen belt
  inclination: 55.0,
  phasing: 1              // Walker Delta phasing parameter
};

/**
 * Convert degrees to radians
 */
function deg2rad(degrees: number): number {
  return degrees * Math.PI / 180;
}

/**
 * Convert radians to degrees
 */
function rad2deg(radians: number): number {
  return radians * 180 / Math.PI;
}

/**
 * Calculate orbital period using Kepler's third law
 */
function calculateOrbitalPeriod(altitude: number): number {
  const a = EARTH_RADIUS_KM + altitude; // semi-major axis
  return 2 * Math.PI * Math.sqrt(Math.pow(a, 3) / MU_EARTH);
}

/**
 * Generate Walker Delta orbital elements for satellite at plane/slot position
 */
export function generateWalkerDeltaElements(
  plane: number,
  slot: number,
  config: WalkerDeltaConstellation = WALKER_DELTA_CONFIG
): OrbitalElements {
  const altitude = config.altitude;
  const semiMajorAxis = EARTH_RADIUS_KM + altitude;

  // Walker Delta parameters
  const raan = (plane * 360 / config.planes) % 360;
  const meanAnomaly = (slot * 360 / config.satellitesPerPlane +
                      plane * config.phasing * 360 / config.totalSatellites) % 360;

  return {
    semiMajorAxis,
    eccentricity: 0, // Circular orbit
    inclination: config.inclination,
    raan,
    argumentOfPeriapsis: 0,
    meanAnomaly
  };
}

/**
 * Propagate orbital elements to current time
 */
export function propagateOrbit(
  elements: OrbitalElements,
  timeSeconds: number
): OrbitalElements {
  const period = calculateOrbitalPeriod(elements.semiMajorAxis - EARTH_RADIUS_KM);
  const meanMotion = 360 / period; // degrees per second

  const currentMeanAnomaly = (elements.meanAnomaly + meanMotion * timeSeconds) % 360;

  return {
    ...elements,
    meanAnomaly: currentMeanAnomaly
  };
}

/**
 * Convert orbital elements to Earth-Centered, Earth-Fixed (ECEF) coordinates
 */
export function orbitalElementsToECEF(elements: OrbitalElements): CartesianCoordinates {
  // Convert to radians
  const i = deg2rad(elements.inclination);
  const raan = deg2rad(elements.raan);
  const argPe = deg2rad(elements.argumentOfPeriapsis);
  const M = deg2rad(elements.meanAnomaly);

  // For circular orbit, true anomaly = mean anomaly
  const trueAnomaly = M;

  // Position in orbital plane
  const r = elements.semiMajorAxis;
  const x_orbit = r * Math.cos(trueAnomaly);
  const y_orbit = r * Math.sin(trueAnomaly);
  const z_orbit = 0;

  // Rotation matrices to convert to ECEF
  // R3(-Ω) * R1(-i) * R3(-ω)
  const cosRaan = Math.cos(-raan);
  const sinRaan = Math.sin(-raan);
  const cosI = Math.cos(-i);
  const sinI = Math.sin(-i);
  const cosArgPe = Math.cos(-argPe);
  const sinArgPe = Math.sin(-argPe);

  // Combined rotation matrix elements
  const r11 = cosRaan * cosArgPe - sinRaan * cosI * sinArgPe;
  const r12 = -cosRaan * sinArgPe - sinRaan * cosI * cosArgPe;
  const r13 = sinRaan * sinI;

  const r21 = sinRaan * cosArgPe + cosRaan * cosI * sinArgPe;
  const r22 = -sinRaan * sinArgPe + cosRaan * cosI * cosArgPe;
  const r23 = -cosRaan * sinI;

  const r31 = sinI * sinArgPe;
  const r32 = sinI * cosArgPe;
  const r33 = cosI;

  // Transform to ECEF
  const x = r11 * x_orbit + r12 * y_orbit + r13 * z_orbit;
  const y = r21 * x_orbit + r22 * y_orbit + r23 * z_orbit;
  const z = r31 * x_orbit + r32 * y_orbit + r33 * z_orbit;

  return { x, y, z };
}

/**
 * Convert ECEF to geodetic coordinates (lat/lon/alt)
 */
export function ecefToGeodetic(ecef: CartesianCoordinates): GeodeticCoordinates {
  const x = ecef.x;
  const y = ecef.y;
  const z = ecef.z;

  const a = EARTH_RADIUS_KM;
  const e2 = 2 * EARTH_FLATTENING - EARTH_FLATTENING * EARTH_FLATTENING;

  const lon = Math.atan2(y, x);
  const p = Math.sqrt(x * x + y * y);

  let lat = Math.atan2(z, p * (1 - e2));
  let h = 0;

  // Iterative solution for latitude and height
  for (let i = 0; i < 5; i++) {
    const N = a / Math.sqrt(1 - e2 * Math.sin(lat) * Math.sin(lat));
    h = p / Math.cos(lat) - N;
    lat = Math.atan2(z, p * (1 - e2 * N / (N + h)));
  }

  return {
    lat: rad2deg(lat),
    lon: rad2deg(lon),
    alt: h
  };
}

/**
 * Calculate look angles from ground station to satellite
 */
export function calculateLookAngles(
  groundStationLat: number,
  groundStationLon: number,
  groundStationAlt: number,
  satelliteLat: number,
  satelliteLon: number,
  satelliteAlt: number
): GroundStationLookAngles {
  // Convert to ECEF for both ground station and satellite
  const gsEcef = geodeticToECEF(groundStationLat, groundStationLon, groundStationAlt);
  const satEcef = geodeticToECEF(satelliteLat, satelliteLon, satelliteAlt);

  // Vector from ground station to satellite
  const dx = satEcef.x - gsEcef.x;
  const dy = satEcef.y - gsEcef.y;
  const dz = satEcef.z - gsEcef.z;

  const range = Math.sqrt(dx * dx + dy * dy + dz * dz);

  // Convert to local topocentric coordinates (East-North-Up)
  const lat = deg2rad(groundStationLat);
  const lon = deg2rad(groundStationLon);

  const east = -Math.sin(lon) * dx + Math.cos(lon) * dy;
  const north = -Math.sin(lat) * Math.cos(lon) * dx - Math.sin(lat) * Math.sin(lon) * dy + Math.cos(lat) * dz;
  const up = Math.cos(lat) * Math.cos(lon) * dx + Math.cos(lat) * Math.sin(lon) * dy + Math.sin(lat) * dz;

  // Calculate azimuth and elevation
  const azimuth = rad2deg(Math.atan2(east, north));
  const elevation = rad2deg(Math.asin(up / range));
  const declination = 90 - elevation; // degrees from zenith

  // Azimuth should be 0-360 degrees
  const azimuthNormalized = azimuth < 0 ? azimuth + 360 : azimuth;

  return {
    azimuth: azimuthNormalized,
    elevation,
    range,
    declination,
    slewing: {
      azimuthRate: 0, // TODO: Calculate rates based on satellite velocity
      elevationRate: 0,
      required: elevation > 5 // Only slew if satellite is above 5 degree elevation
    }
  };
}

/**
 * Convert geodetic to ECEF coordinates
 */
function geodeticToECEF(lat: number, lon: number, alt: number): CartesianCoordinates {
  const a = EARTH_RADIUS_KM;
  const e2 = 2 * EARTH_FLATTENING - EARTH_FLATTENING * EARTH_FLATTENING;

  const latRad = deg2rad(lat);
  const lonRad = deg2rad(lon);

  const N = a / Math.sqrt(1 - e2 * Math.sin(latRad) * Math.sin(latRad));

  const x = (N + alt) * Math.cos(latRad) * Math.cos(lonRad);
  const y = (N + alt) * Math.cos(latRad) * Math.sin(lonRad);
  const z = (N * (1 - e2) + alt) * Math.sin(latRad);

  return { x, y, z };
}

/**
 * Get current satellite positions for entire Walker Delta constellation
 */
export function getWalkerDeltaPositions(timestamp: Date = new Date()): Array<{
  plane: number;
  slot: number;
  elements: OrbitalElements;
  position: GeodeticCoordinates;
  ecef: CartesianCoordinates;
}> {
  const positions = [];
  const timeSeconds = timestamp.getTime() / 1000;

  for (let plane = 0; plane < WALKER_DELTA_CONFIG.planes; plane++) {
    for (let slot = 0; slot < WALKER_DELTA_CONFIG.satellitesPerPlane; slot++) {
      const baseElements = generateWalkerDeltaElements(plane, slot);
      const currentElements = propagateOrbit(baseElements, timeSeconds);
      const ecef = orbitalElementsToECEF(currentElements);
      const geodetic = ecefToGeodetic(ecef);

      positions.push({
        plane,
        slot,
        elements: currentElements,
        position: geodetic,
        ecef
      });
    }
  }

  return positions;
}

/**
 * Calculate ground station tracking for all satellites
 */
export function calculateGroundStationTracking(
  groundStations: Array<{lat: number, lon: number, altitude: number, name: string}>,
  timestamp: Date = new Date()
): Map<string, Array<{
  satellite: string;
  lookAngles: GroundStationLookAngles;
  visible: boolean;
}>> {
  // Greek alphabet names for satellites
  const greekAlphabet = [
    'Alpha', 'Beta', 'Gamma', 'Delta', 'Epsilon', 'Zeta',
    'Eta', 'Theta', 'Iota', 'Kappa', 'Lambda', 'Mu'
  ];

  const trackingData = new Map();
  const satellitePositions = getWalkerDeltaPositions(timestamp);

  groundStations.forEach(station => {
    const stationTracking = satellitePositions.map((satPos) => {
      const lookAngles = calculateLookAngles(
        station.lat,
        station.lon,
        station.altitude / 1000, // Convert to km
        satPos.position.lat,
        satPos.position.lon,
        satPos.position.alt
      );

      const satIndex = satPos.plane * 3 + satPos.slot;

      return {
        satellite: greekAlphabet[satIndex] || `Satellite-${satIndex}`,
        lookAngles,
        visible: lookAngles.elevation > 10 // Visible above 10 degrees elevation
      };
    });

    trackingData.set(station.name, stationTracking);
  });

  return trackingData;
}