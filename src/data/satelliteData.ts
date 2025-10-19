// Preserved satellite data from GISViewer.tsx
export interface SatelliteData {
  name: string;
  lat: number;
  lon: number;
  alt: number;
  velocity: number;
  noradId: string;
  status: string;
}

export const generateMockSatelliteData = (): SatelliteData[] => {
  // Generate mock MEO satellite data - preserved from original implementation
  return [
    {
      name: 'GPS BIIR-2 (PRN 13)',
      lat: 55.2 * Math.sin(Date.now() / 100000),
      lon: (Date.now() / 50000) % 360 - 180,
      alt: 20200,
      velocity: 3.87,
      noradId: '28474',
      status: 'active'
    },
    {
      name: 'GPS BIIR-3 (PRN 11)',
      lat: 55.2 * Math.sin((Date.now() / 100000) + Math.PI / 6),
      lon: ((Date.now() / 50000) + 30) % 360 - 180,
      alt: 20180,
      velocity: 3.89,
      noradId: '26360',
      status: 'tracking'
    },
    {
      name: 'GPS BIIR-4 (PRN 20)',
      lat: 55.2 * Math.sin((Date.now() / 100000) + Math.PI / 3),
      lon: ((Date.now() / 50000) + 60) % 360 - 180,
      alt: 20220,
      velocity: 3.85,
      noradId: '26407',
      status: 'active'
    },
    {
      name: 'GPS BIIR-5 (PRN 28)',
      lat: 55.2 * Math.sin((Date.now() / 100000) + Math.PI / 2),
      lon: ((Date.now() / 50000) + 90) % 360 - 180,
      alt: 20195,
      velocity: 3.88,
      noradId: '26605',
      status: 'active'
    },
    {
      name: 'GPS BIIR-6 (PRN 14)',
      lat: 55.2 * Math.sin((Date.now() / 100000) + 2 * Math.PI / 3),
      lon: ((Date.now() / 50000) + 120) % 360 - 180,
      alt: 20210,
      velocity: 3.86,
      noradId: '26690',
      status: 'tracking'
    },
    {
      name: 'GPS BIIR-7 (PRN 18)',
      lat: 55.2 * Math.sin((Date.now() / 100000) + 5 * Math.PI / 6),
      lon: ((Date.now() / 50000) + 150) % 360 - 180,
      alt: 20185,
      velocity: 3.90,
      noradId: '28129',
      status: 'active'
    },
    {
      name: 'GPS BIIR-8 (PRN 16)',
      lat: 55.2 * Math.sin((Date.now() / 100000) + Math.PI),
      lon: ((Date.now() / 50000) + 180) % 360 - 180,
      alt: 20215,
      velocity: 3.84,
      noradId: '28190',
      status: 'active'
    },
    {
      name: 'GPS BIIR-9 (PRN 21)',
      lat: 55.2 * Math.sin((Date.now() / 100000) + 7 * Math.PI / 6),
      lon: ((Date.now() / 50000) + 210) % 360 - 180,
      alt: 20205,
      velocity: 3.87,
      noradId: '28361',
      status: 'tracking'
    },
    {
      name: 'GPS BIIR-10 (PRN 22)',
      lat: 55.2 * Math.sin((Date.now() / 100000) + 4 * Math.PI / 3),
      lon: ((Date.now() / 50000) + 240) % 360 - 180,
      alt: 20190,
      velocity: 3.89,
      noradId: '28874',
      status: 'active'
    },
    {
      name: 'GPS BIIR-11 (PRN 19)',
      lat: 55.2 * Math.sin((Date.now() / 100000) + 3 * Math.PI / 2),
      lon: ((Date.now() / 50000) + 270) % 360 - 180,
      alt: 20200,
      velocity: 3.86,
      noradId: '29486',
      status: 'active'
    },
    {
      name: 'GPS BIIR-12 (PRN 23)',
      lat: 55.2 * Math.sin((Date.now() / 100000) + 5 * Math.PI / 3),
      lon: ((Date.now() / 50000) + 300) % 360 - 180,
      alt: 20225,
      velocity: 3.83,
      noradId: '29601',
      status: 'tracking'
    },
    {
      name: 'GPS BIIR-13 (PRN 02)',
      lat: 55.2 * Math.sin((Date.now() / 100000) + 11 * Math.PI / 6),
      lon: ((Date.now() / 50000) + 330) % 360 - 180,
      alt: 20175,
      velocity: 3.91,
      noradId: '32260',
      status: 'active'
    }
  ];
};