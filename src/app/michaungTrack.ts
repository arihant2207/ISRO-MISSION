export interface TrackPoint {
  time: string;
  nature: string;
  lat: number;
  lon: number;
  windKt: number;
  presHpa: number;
  category?: string;
}

export const MICHAUNG_IBTRACS_TRACK: TrackPoint[] = [
  { time: '2023-11-30 06:00:00', nature: 'DS', lat: 7.5, lon: 88.0, windKt: 30, presHpa: 1000 },
  { time: '2023-11-30 09:00:00', nature: 'DS', lat: 7.9, lon: 87.6, windKt: 30, presHpa: 1000 },
  { time: '2023-11-30 12:00:00', nature: 'DS', lat: 8.2, lon: 87.2, windKt: 30, presHpa: 1000 },
  { time: '2023-11-30 15:00:00', nature: 'DS', lat: 8.3, lon: 86.8, windKt: 30, presHpa: 1000 },
  { time: '2023-11-30 18:00:00', nature: 'DS', lat: 8.4, lon: 86.4, windKt: 30, presHpa: 1000 },
  { time: '2023-11-30 21:00:00', nature: 'DS', lat: 8.5, lon: 86.0, windKt: 30, presHpa: 1000 },
  { time: '2023-12-01 00:00:00', nature: 'MX', lat: 8.8, lon: 85.8, windKt: 20, presHpa: 1002 },
  { time: '2023-12-01 03:00:00', nature: 'MX', lat: 9.0, lon: 85.6, windKt: 20, presHpa: 1002 },
  { time: '2023-12-01 06:00:00', nature: 'MX', lat: 9.2, lon: 85.4, windKt: 25, presHpa: 1002 },
  { time: '2023-12-01 09:00:00', nature: 'MX', lat: 9.5, lon: 85.3, windKt: 30, presHpa: 1000 },
  { time: '2023-12-01 12:00:00', nature: 'MX', lat: 9.7, lon: 85.1, windKt: 25, presHpa: 1001 },
  { time: '2023-12-01 15:00:00', nature: 'MX', lat: 9.8, lon: 85.0, windKt: 30, presHpa: 1000 },
  { time: '2023-12-01 18:00:00', nature: 'MX', lat: 9.9, lon: 84.8, windKt: 25, presHpa: 1000 },
  { time: '2023-12-01 21:00:00', nature: 'MX', lat: 9.9, lon: 84.5, windKt: 30, presHpa: 1000 },
  { time: '2023-12-02 00:00:00', nature: 'MX', lat: 10.1, lon: 84.1, windKt: 30, presHpa: 998 },
  { time: '2023-12-02 03:00:00', nature: 'MX', lat: 10.2, lon: 83.8, windKt: 30, presHpa: 997 },
  { time: '2023-12-02 06:00:00', nature: 'TS', lat: 10.3, lon: 83.6, windKt: 30, presHpa: 997 },
  { time: '2023-12-02 09:00:00', nature: 'TS', lat: 10.4, lon: 83.5, windKt: 30, presHpa: 1000 },
  { time: '2023-12-02 12:00:00', nature: 'TS', lat: 10.5, lon: 83.5, windKt: 30, presHpa: 997 },
  { time: '2023-12-02 15:00:00', nature: 'TS', lat: 10.7, lon: 83.3, windKt: 30, presHpa: 1000 },
  { time: '2023-12-02 18:00:00', nature: 'TS', lat: 10.8, lon: 83.1, windKt: 30, presHpa: 996 },
  { time: '2023-12-02 21:00:00', nature: 'TS', lat: 11.0, lon: 83.0, windKt: 30, presHpa: 1000 },
  { time: '2023-12-03 00:00:00', nature: 'TS', lat: 11.3, lon: 82.9, windKt: 35, presHpa: 995 },
  { time: '2023-12-03 03:00:00', nature: 'TS', lat: 11.5, lon: 82.7, windKt: 35, presHpa: 995 },
  { time: '2023-12-03 06:00:00', nature: 'TS', lat: 11.9, lon: 82.5, windKt: 35, presHpa: 995 },
  { time: '2023-12-03 09:00:00', nature: 'TS', lat: 12.1, lon: 82.4, windKt: 35, presHpa: 995 },
  { time: '2023-12-03 12:00:00', nature: 'TS', lat: 12.3, lon: 82.3, windKt: 35, presHpa: 995 },
  { time: '2023-12-03 15:00:00', nature: 'TS', lat: 12.5, lon: 82.1, windKt: 40, presHpa: 994 },
  { time: '2023-12-03 18:00:00', nature: 'TS', lat: 12.8, lon: 81.8, windKt: 45, presHpa: 992 },
  { time: '2023-12-03 21:00:00', nature: 'TS', lat: 12.9, lon: 81.6, windKt: 45, presHpa: 992 },
  { time: '2023-12-04 00:00:00', nature: 'TS', lat: 13.1, lon: 81.4, windKt: 45, presHpa: 992 },
  { time: '2023-12-04 03:00:00', nature: 'TS', lat: 13.3, lon: 81.1, windKt: 50, presHpa: 988 },
  { time: '2023-12-04 06:00:00', nature: 'TS', lat: 13.5, lon: 80.9, windKt: 50, presHpa: 988 },
  { time: '2023-12-04 09:00:00', nature: 'TS', lat: 13.7, lon: 80.7, windKt: 50, presHpa: 988 },
  { time: '2023-12-04 12:00:00', nature: 'TS', lat: 14.0, lon: 80.6, windKt: 55, presHpa: 986 },
  { time: '2023-12-04 15:00:00', nature: 'TS', lat: 14.2, lon: 80.4, windKt: 55, presHpa: 986 },
  { time: '2023-12-04 18:00:00', nature: 'TS', lat: 14.4, lon: 80.3, windKt: 55, presHpa: 986 },
  { time: '2023-12-04 21:00:00', nature: 'TS', lat: 14.6, lon: 80.2, windKt: 55, presHpa: 986 },
  { time: '2023-12-05 00:00:00', nature: 'TS', lat: 14.9, lon: 80.1, windKt: 50, presHpa: 988 },
  { time: '2023-12-05 03:00:00', nature: 'TS', lat: 15.2, lon: 80.1, windKt: 50, presHpa: 988 },
  { time: '2023-12-05 06:00:00', nature: 'TS', lat: 15.6, lon: 80.2, windKt: 50, presHpa: 988 },
  { time: '2023-12-05 09:00:00', nature: 'TS', lat: 15.8, lon: 80.2, windKt: 50, presHpa: 990 },
  { time: '2023-12-05 12:00:00', nature: 'TS', lat: 16.0, lon: 80.2, windKt: 40, presHpa: 996 },
  { time: '2023-12-05 15:00:00', nature: 'TS', lat: 16.4, lon: 80.3, windKt: 35, presHpa: 998 },
  { time: '2023-12-05 18:00:00', nature: 'TS', lat: 16.9, lon: 80.4, windKt: 30, presHpa: 1000 },
  { time: '2023-12-05 21:00:00', nature: 'TS', lat: 17.1, lon: 80.5, windKt: 30, presHpa: 1000 },
  { time: '2023-12-06 00:00:00', nature: 'TS', lat: 17.3, lon: 80.6, windKt: 20, presHpa: 1004 },
  { time: '2023-12-06 03:00:00', nature: 'TS', lat: 17.7, lon: 80.8, windKt: 30, presHpa: 1000 },
  { time: '2023-12-06 06:00:00', nature: 'TS', lat: 18.3, lon: 81.1, windKt: 30, presHpa: 1000 }
];

export const MICHAUNG_METADATA = {
  name: "Cyclone Michaung",
  season: 2023,
  basin: "North Indian Ocean (Bay of Bengal)",
  satellite: "INSAT-3D / 3DS",
  channel: "IR 10.8 µm",
  dateRange: "30 Nov 2023 - 06 Dec 2023",
  peakWindKmh: 110,
  minPressureHpa: 988,
  landfallLocation: "Bapatla, Andhra Pradesh",
  ibtracsId: "2023334N08088",
  csvAvailable: true,
  gifAvailable: true
};
