import * as satellite from 'satellite.js';

export interface N2YOConfig {
  apiKey: string;
  baseUrl: string;
}

export interface TLE {
  info: {
    satname: string;
    satid: number;
    transactionscount: number;
  };
  tle: string;
}

export interface SatellitePosition {
  satlatitude: number;
  satlongitude: number;
  sataltitude: number;
  azimuth: number;
  elevation: number;
  ra: number;
  dec: number;
  timestamp: number;
}

export interface SatellitePositions {
  info: {
    satname: string;
    satid: number;
    transactionscount: number;
  };
  positions: SatellitePosition[];
}

export interface VisualPass {
  startAz: number;
  startAzCompass: string;
  startEl: number;
  startUTC: number;
  maxAz: number;
  maxAzCompass: string;
  maxEl: number;
  maxUTC: number;
  endAz: number;
  endAzCompass: string;
  endEl: number;
  endUTC: number;
  mag: number;
  duration: number;
}

export interface VisualPasses {
  info: {
    satname: string;
    satid: number;
    passescount: number;
    transactionscount: number;
  };
  passes: VisualPass[];
}

export interface AboveSatellite {
  satid: number;
  satname: string;
  intDesignator: string;
  launchDate: string;
  satlat: number;
  satlng: number;
  satalt: number;
}

export interface SatellitesAbove {
  info: {
    category: string;
    transactionscount: number;
    satcount: number;
  };
  above: AboveSatellite[];
}

// MEO constellation satellite IDs for demonstration
export const MEO_SATELLITES = [
  { id: 28474, name: 'GPS BIIR-2 (PRN 13)' },
  { id: 26360, name: 'GPS BIIR-3 (PRN 11)' },
  { id: 26407, name: 'GPS BIIR-4 (PRN 20)' },
  { id: 26605, name: 'GPS BIIR-5 (PRN 28)' },
  { id: 26690, name: 'GPS BIIR-6 (PRN 14)' },
  { id: 28129, name: 'GPS BIIR-7 (PRN 18)' },
  { id: 28190, name: 'GPS BIIR-8 (PRN 16)' },
  { id: 28361, name: 'GPS BIIR-9 (PRN 21)' },
  { id: 28874, name: 'GPS BIIR-10 (PRN 22)' },
  { id: 29486, name: 'GPS BIIR-11 (PRN 19)' },
  { id: 29601, name: 'GPS BIIR-12 (PRN 23)' },
  { id: 32260, name: 'GPS BIIR-13 (PRN 02)' }
];

export class N2YOSatelliteAPI {
  private config: N2YOConfig;
  private rateLimitTracker: Map<string, { count: number; resetTime: number }> = new Map();

  constructor(config: N2YOConfig) {
    this.config = config;
  }

  private checkRateLimit(endpoint: string): boolean {
    const now = Date.now();
    const tracker = this.rateLimitTracker.get(endpoint);

    if (!tracker || now > tracker.resetTime) {
      this.rateLimitTracker.set(endpoint, { count: 1, resetTime: now + 3600000 }); // 1 hour
      return true;
    }

    const limits: Record<string, number> = {
      tle: 1000,
      positions: 1000,
      visualpasses: 100,
      radiopasses: 100,
      above: 100
    };

    if (tracker.count >= (limits[endpoint] || 100)) {
      console.warn(`Rate limit exceeded for ${endpoint}. Resets at ${new Date(tracker.resetTime).toISOString()}`);
      return false;
    }

    tracker.count++;
    return true;
  }

  private async fetchFromAPI<T>(endpoint: string): Promise<T> {
    if (!this.checkRateLimit(endpoint.split('/')[0])) {
      throw new Error(`Rate limit exceeded for ${endpoint}`);
    }

    const url = `${this.config.baseUrl}/${endpoint}&apiKey=${this.config.apiKey}`;

    try {
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.error) {
        throw new Error(`API Error: ${data.error}`);
      }

      return data;
    } catch (error) {
      console.error(`N2YO API Error for ${endpoint}:`, error);
      throw error;
    }
  }

  async getTLE(satelliteId: number): Promise<TLE> {
    return this.fetchFromAPI<TLE>(`tle/${satelliteId}?`);
  }

  async getSatellitePositions(
    satelliteId: number,
    observerLat: number,
    observerLng: number,
    observerAlt: number = 0,
    seconds: number = 300
  ): Promise<SatellitePositions> {
    return this.fetchFromAPI<SatellitePositions>(
      `positions/${satelliteId}/${observerLat}/${observerLng}/${observerAlt}/${seconds}?`
    );
  }

  async getVisualPasses(
    satelliteId: number,
    observerLat: number,
    observerLng: number,
    observerAlt: number = 0,
    days: number = 10,
    minVisibility: number = 300
  ): Promise<VisualPasses> {
    return this.fetchFromAPI<VisualPasses>(
      `visualpasses/${satelliteId}/${observerLat}/${observerLng}/${observerAlt}/${days}/${minVisibility}?`
    );
  }

  async getSatellitesAbove(
    observerLat: number,
    observerLng: number,
    observerAlt: number = 0,
    searchRadius: number = 70,
    categoryId: number = 0
  ): Promise<SatellitesAbove> {
    return this.fetchFromAPI<SatellitesAbove>(
      `above/${observerLat}/${observerLng}/${observerAlt}/${searchRadius}/${categoryId}?`
    );
  }

  // Enhanced method to get MEO constellation data
  async getMEOConstellation(
    observerLat: number = 39.8283,
    observerLng: number = -98.5795,
    observerAlt: number = 0
  ): Promise<Array<{
    satellite: typeof MEO_SATELLITES[0];
    positions: SatellitePositions;
    tle?: TLE;
  }>> {
    const results = [];

    for (const sat of MEO_SATELLITES) {
      try {
        // Get positions for each MEO satellite
        const positions = await this.getSatellitePositions(
          sat.id,
          observerLat,
          observerLng,
          observerAlt,
          3600 // 1 hour of positions
        );

        // Optionally get TLE data for orbital calculations
        let tle: TLE | undefined;
        try {
          tle = await this.getTLE(sat.id);
        } catch (error) {
          console.warn(`Could not fetch TLE for ${sat.name}:`, error);
        }

        results.push({
          satellite: sat,
          positions,
          tle
        });

        // Add delay to respect rate limits
        await new Promise(resolve => setTimeout(resolve, 100));

      } catch (error) {
        console.error(`Failed to fetch data for satellite ${sat.name}:`, error);
      }
    }

    return results;
  }

  // Method to calculate satellite position from TLE using satellite.js
  calculateSatellitePosition(
    tleData: TLE,
    observerLat: number,
    observerLng: number,
    observerAlt: number,
    timestamp?: Date
  ): {
    position: { latitude: number; longitude: number; altitude: number };
    lookAngles: { azimuth: number; elevation: number; rangeSat: number };
  } | null {
    try {
      const tleLine1 = tleData.tle.split('\n')[1];
      const tleLine2 = tleData.tle.split('\n')[2];

      const satrec = satellite.twoline2satrec(tleLine1, tleLine2);
      const now = timestamp || new Date();

      const positionAndVelocity = satellite.propagate(satrec, now);

      if (satellite.geosync.satelliteIsEclipsed(positionAndVelocity, now) || !positionAndVelocity.position) {
        return null;
      }

      const positionEci = positionAndVelocity.position as satellite.EciVec3<number>;

      const gmst = satellite.gstime(now);
      const positionEcf = satellite.eciToEcf(positionEci, gmst);
      const positionGd = satellite.ecfToGeodetic(positionEcf);

      const latitude = satellite.degreesLat(positionGd.latitude);
      const longitude = satellite.degreesLong(positionGd.longitude);
      const altitude = positionGd.height;

      // Calculate look angles from observer
      const observerGd = {
        latitude: satellite.degreesToRadians(observerLat),
        longitude: satellite.degreesToRadians(observerLng),
        height: observerAlt / 1000
      };

      const lookAngles = satellite.ecfToLookAngles(observerGd, positionEcf);

      return {
        position: { latitude, longitude, altitude },
        lookAngles: {
          azimuth: satellite.degrees(lookAngles.azimuth),
          elevation: satellite.degrees(lookAngles.elevation),
          rangeSat: lookAngles.rangeSat
        }
      };
    } catch (error) {
      console.error('Error calculating satellite position:', error);
      return null;
    }
  }

  // Batch method to get multiple satellite positions efficiently
  async getBatchSatelliteData(
    satelliteIds: number[],
    observerLat: number,
    observerLng: number,
    observerAlt: number = 0
  ): Promise<Map<number, { positions: SatellitePositions; tle?: TLE }>> {
    const results = new Map();

    for (const id of satelliteIds) {
      try {
        const positions = await this.getSatellitePositions(id, observerLat, observerLng, observerAlt, 1800);
        let tle: TLE | undefined;

        try {
          tle = await this.getTLE(id);
        } catch (error) {
          console.warn(`Could not fetch TLE for satellite ${id}:`, error);
        }

        results.set(id, { positions, tle });

        // Rate limiting delay
        await new Promise(resolve => setTimeout(resolve, 150));

      } catch (error) {
        console.error(`Failed to fetch data for satellite ${id}:`, error);
      }
    }

    return results;
  }

  // Method to predict satellite passes for planning
  async predictMEOPasses(
    observerLat: number,
    observerLng: number,
    observerAlt: number = 0,
    days: number = 7
  ): Promise<Array<{
    satellite: typeof MEO_SATELLITES[0];
    passes: VisualPasses;
  }>> {
    const results = [];

    for (const sat of MEO_SATELLITES.slice(0, 6)) { // Limit to first 6 to avoid rate limits
      try {
        const passes = await this.getVisualPasses(
          sat.id,
          observerLat,
          observerLng,
          observerAlt,
          days,
          300 // 5 minute minimum visibility
        );

        results.push({ satellite: sat, passes });

        // Rate limiting delay
        await new Promise(resolve => setTimeout(resolve, 600));

      } catch (error) {
        console.error(`Failed to fetch passes for ${sat.name}:`, error);
      }
    }

    return results;
  }
}

export default N2YOSatelliteAPI;