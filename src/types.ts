export interface Persona {
  id: string;
  name: string;
  role: string;
  model: string;
  avatar: string;
  status: 'online' | 'offline' | 'busy' | 'away';
  lastSeen: string;
  capabilities: string[];
}

export interface VoiceData {
  duration: number; // seconds
  waveform: number[];
  isPlaying: boolean;
}

export interface Message {
  id: string;
  senderId: string;
  channelId: string;
  content: string;
  timestamp: string; // ISO string
  type: 'text' | 'voice';
  voiceData?: VoiceData;
}

export interface Channel {
  id: string;
  name: string;
  type: 'group' | 'direct';
  participants: string[]; // persona IDs incl. current-user
  unreadCount: number;
  lastMessage?: Message;
}

export type TaskPriority = 'low' | 'medium' | 'high' | 'critical';
export type TaskStatus = 'todo' | 'in-progress' | 'review' | 'done';

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignedTo: string;
  dueDate: string; // ISO date
  tags: string[];
  createdAt?: string;
  updatedAt?: string;
}

export type MetricTrend = 'up' | 'down' | 'stable';
export type MetricStatus = 'healthy' | 'warning' | 'critical';

export interface SystemMetric {
  id: string;
  name: string;
  value: number;
  unit: string;
  trend: MetricTrend;
  status: MetricStatus;
}
