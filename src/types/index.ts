export interface Persona {
  id: string;
  name: string;
  role: string;
  model: string;
  avatar: string;
  status: 'online' | 'busy' | 'away' | 'offline';
  lastSeen: string;
  capabilities: string[];
}

export interface Message {
  id: string;
  senderId: string;
  recipientId?: string;
  channelId?: string;
  content: string;
  timestamp: string;
  type: 'text' | 'voice' | 'system' | 'file';
  attachments?: Attachment[];
  voiceData?: VoiceMessage;
}

export interface VoiceMessage {
  duration: number;
  waveform: number[];
  isPlaying: boolean;
}

export interface Attachment {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
}

export interface Channel {
  id: string;
  name: string;
  type: 'direct' | 'group' | 'system';
  participants: string[];
  lastMessage?: Message;
  unreadCount: number;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  assignedTo: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  status: 'todo' | 'in-progress' | 'review' | 'done';
  dueDate: string;
  tags: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface SystemMetric {
  id: string;
  name: string;
  value: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  status: 'healthy' | 'warning' | 'critical';
}

export interface ApiEndpoint {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  path: string;
  description: string;
}

// =====================================================================
// CTAS-7 GROUND STATION DATA TYPES (Supabase ACID Source)
// =====================================================================

export interface GroundNode {
  // Primary identification (current schema)
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  tier: 1 | 2 | 3;
  demand_gbps: number;
  weather_score: number;
  status: 'active' | 'degraded' | 'offline' | 'maintenance' | 'planned';
  created_at?: string;
  last_updated?: string;

  // Extended fields (after migration)
  station_code?: string;
  region?: string;
  country_code?: string;

  // Trivariate hash integration
  sch_hash?: string;
  cuid_hash?: string;
  uuid_hash?: string;
  trivariate_hash_full?: string;

  // Comprehensive scoring
  total_score?: number;
  starlink_score?: number;
  cable_score?: number;
  atmospheric_score?: number;
  political_score?: number;
  infrastructure_score?: number;
  strategic_score?: number;
}

export interface Satellite {
  id: string;
  name: string;
  designation: string;
  orbital_period_minutes: number;
  apogee_km: number;
  perigee_km: number;
  inclination_deg: number;
  eccentricity: number;
  status: 'operational' | 'degraded' | 'offline' | 'deorbited';
  launch_date?: string;
  created_at?: string;
}

export interface QKDMetric {
  id: string;
  source_node_id: string;
  target_node_id: string;
  key_generation_rate_kbps: number;
  quantum_bit_error_rate: number;
  link_efficiency: number;
  photon_detection_rate: number;
  measurement_timestamp: string;
  link_status: 'active' | 'degraded' | 'down';
  created_at?: string;
}

// Weather data structure
export interface WeatherData {
  id: string;
  location_id: string;
  temperature_c: number;
  humidity_percent: number;
  wind_speed_ms: number;
  wind_direction_deg: number;
  pressure_hpa: number;
  cloud_cover_percent: number;
  visibility_km: number;
  conditions: string;
  recorded_at: string;
}

// Network link data structure
export interface NetworkLink {
  id: string;
  source_node_id: string;
  target_node_id: string;
  link_type: 'laser' | 'rf' | 'fiber' | 'satellite';
  bandwidth_gbps: number;
  latency_ms: number;
  packet_loss_percent: number;
  status: 'active' | 'degraded' | 'down';
  last_tested: string;
}