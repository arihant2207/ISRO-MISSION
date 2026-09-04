import {
  Satellite, Activity, AlertTriangle, Download, Settings,
  LayoutDashboard, Play, Pause, SkipForward, SkipBack,
  RefreshCw, Maximize2, Eye, Brain, BarChart2, FileText, Film,
  CheckCircle, TrendingUp, Bell, User, Lock, Wifi,
  Shield, Database, Layers, ArrowRight, LogOut, Cpu, Radio, Target,
} from "lucide-react";

export const METRIC_TREND = [
  { t: "00:00", ssim: 0.82, base: 0.68 },
  { t: "07:30", ssim: 0.89, base: 0.68 },
  { t: "15:00", ssim: 0.94, base: 0.70 },
  { t: "22:30", ssim: 0.91, base: 0.69 },
  { t: "30:00", ssim: 0.96, base: 0.71 },
];

export const MODEL_RADAR = [
  { m: "SSIM", ai: 94, base: 68 },
  { m: "PSNR", ai: 88, base: 65 },
  { m: "FSIM", ai: 91, base: 70 },
  { m: "LPIPS", ai: 85, base: 62 },
  { m: "MAE", ai: 89, base: 67 },
  { m: "MSE", ai: 82, base: 60 },
];

export const INFER_DATA = [
  { frame: "F1→F2", ms: 2.3 },
  { frame: "F2→F3", ms: 2.1 },
  { frame: "F3→F4", ms: 2.4 },
  { frame: "F4→F5", ms: 2.0 },
  { frame: "F5→F6", ms: 2.2 },
  { frame: "F6→F7", ms: 1.9 },
];

export const EVENTS = [
  { id: 1, type: "Cyclone", name: "Cyclone Michaung", location: "Bay of Bengal", coords: "13.2°N, 82.4°E", confidence: 94, severity: "critical", time: "14:32 IST", detail: "Wind: 165 km/h", color: "#FF3B5C" },
  { id: 2, type: "Heavy Rain", name: "Extreme Rainfall Alert", location: "Western Ghats", coords: "15.6°N, 74.1°E", confidence: 87, severity: "high", time: "13:15 IST", detail: "180 mm/hr sustained", color: "#FF6A00" },
  { id: 3, type: "Flash Flood", name: "Flood Risk Zone Alpha", location: "North India Plains", coords: "27.1°N, 79.8°E", confidence: 78, severity: "medium", time: "12:48 IST", detail: "Area: 2,400 km²", color: "#FFB800" },
  { id: 4, type: "Thunderstorm", name: "Severe Storm Cell", location: "Himalayas", coords: "31.4°N, 77.2°E", confidence: 82, severity: "high", time: "11:20 IST", detail: "Active lightning", color: "#FF6A00" },
  { id: 5, type: "Cloud Burst", name: "Cloudburst Warning", location: "Uttarakhand", coords: "30.1°N, 79.3°E", confidence: 71, severity: "medium", time: "10:55 IST", detail: "100 mm in 30 min", color: "#FFB800" },
];

export const SATELLITES = [
  { id: "INSAT-3DS", orbit: "GEO 82°E", coverage: "Indian Ocean Region", status: "active", cloud: 34, refresh: "30 min", signal: 98 },
  { id: "GOES-19", orbit: "GEO 75°W", coverage: "Americas Region", status: "active", cloud: 52, refresh: "10 min", signal: 96 },
  { id: "Himawari-8", orbit: "GEO 140.7°E", coverage: "Asia-Pacific", status: "active", cloud: 61, refresh: "10 min", signal: 99 },
  { id: "Meteosat-11", orbit: "GEO 0°", coverage: "Europe / Africa", status: "active", cloud: 45, refresh: "15 min", signal: 94 },
  { id: "Sentinel-3A", orbit: "LEO 814 km", coverage: "Global", status: "processing", cloud: 28, refresh: "2 days", signal: 91 },
];

export const JOBS = [
  { id: "JOB-2847", sat: "INSAT-3DS", region: "Bay of Bengal", status: "complete", frames: "4 → 8", ssim: "0.942", time: "2.3s" },
  { id: "JOB-2846", sat: "GOES-19", region: "Gulf of Mexico", status: "running", frames: "4 → 8", ssim: "—", time: "—" },
  { id: "JOB-2845", sat: "Himawari-8", region: "West Pacific", status: "complete", frames: "4 → 8", ssim: "0.961", time: "2.1s" },
  { id: "JOB-2844", sat: "INSAT-3DS", region: "Arabian Sea", status: "complete", frames: "4 → 8", ssim: "0.924", time: "2.4s" },
  { id: "JOB-2843", sat: "Sentinel-3A", region: "North India", status: "queued", frames: "4 → 8", ssim: "—", time: "—" },
];

export const DOWNLOADS_LIST = [
  { fmt: "NetCDF (.nc)", desc: "Scientific array data, CF conventions", size: "284 MB", Icon: Database, color: "#00E5FF" },
  { fmt: "GeoTIFF (.tif)", desc: "Georeferenced raster imagery", size: "512 MB", Icon: Layers, color: "#7B61FF" },
  { fmt: "MP4 (.mp4)", desc: "H.264 animation, 1080p 30fps", size: "48 MB", Icon: Film, color: "#FF6A00" },
  { fmt: "GIF (.gif)", desc: "Animated loop, web-compatible", size: "12 MB", Icon: RefreshCw, color: "#00E5FF" },
  { fmt: "PDF Report", desc: "Full scientific report with metrics", size: "8.4 MB", Icon: FileText, color: "#FFB800" },
  { fmt: "CSV Metrics", desc: "SSIM, PSNR, MAE, MSE per frame", size: "0.2 MB", Icon: Activity, color: "#00E5FF" },
];

export const NAV_ITEMS = [
  { id: "dashboard", label: "Mission Dashboard", Icon: LayoutDashboard },
  { id: "identify", label: "Cyclone Identification", Icon: Target },
  { id: "classify", label: "Pattern Classification", Icon: Layers },
  { id: "intensity", label: "Cyclone Intensity", Icon: Activity },
  { id: "predict", label: "Track Prediction", Icon: Navigation },
  { id: "landfall", label: "Landfall & Risk", Icon: AlertTriangle },
  { id: "viewer", label: "Frame Viewer", Icon: Eye },
  { id: "satellites", label: "Satellites", Icon: Satellite },
  { id: "metrics", label: "AI Metrics", Icon: BarChart2 },
  { id: "events", label: "Event Detection", Icon: AlertTriangle },
  { id: "xai", label: "Explainable AI", Icon: Brain },
  { id: "downloads", label: "Downloads", Icon: Download },
  { id: "settings", label: "Settings", Icon: Settings },
];

export const NAV_LABELS: Record<string, string> = {
  dashboard: "01 Mission Overview",
  events: "02 Cyclone Discovery",
  satellites: "03 Satellite Intelligence",
  identify: "04 Cyclone Identification",
  classify: "05 Pattern Classification",
  intensity: "06 Intensity Estimation",
  predict: "07 Track Prediction",
  landfall: "08 Landfall & Coastal Risk Intelligence",
  metrics: "09 Temporal Satellite Enhancement",
  xai: "10 Scientific Evaluation & XAI",
  viewer: "Satellite Frame Viewer",
  sources: "Satellite Sources Registry",
  status: "System Status & Telemetry",
  provenance: "Data Provenance Inspector",
};




export const G = {
  panel: {
    background: "rgba(12, 20, 35, 0.72)",
    backdropFilter: "blur(20px)",
    WebkitBackdropFilter: "blur(20px)",
    border: "1px solid rgba(0, 220, 255, 0.12)",
    borderRadius: 12,
  } as React.CSSProperties,
};

