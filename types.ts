export enum WorkerStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

export enum AttendanceStatus {
  PRESENT = 'PRESENT',
  ABSENT = 'ABSENT',
  LEAVE = 'LEAVE',
}

export interface Worker {
  id: string;
  name: string;
  role: string;
  qr_hash: string; // The secret stored on the server
  qr_token: string; // The visible token (simulated encryption)
  status: WorkerStatus;
  created_at: string;
  avatar_url?: string;
}

export interface AttendanceRecord {
  id: string;
  worker_id: string;
  worker_name: string;
  date: string; // YYYY-MM-DD
  timestamp: string; // ISO String (Record creation time)
  check_in?: string; // ISO String
  check_out?: string; // ISO String
  status: AttendanceStatus;
  notes?: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  assignedTo: string; // worker_id
  assignedName: string;
  dueDate: string;
  status: 'PENDING' | 'COMPLETED';
  createdAt: string;
}

export interface SystemSettings {
  storageType: 'DATABASE' | 'EXCEL';
  organizationName: string;
  logoUrl?: string; // Base64 string of uploaded logo
  adminUsername?: string;
  adminPasswordHash?: string; // Stored hash
}

// Default hash for 'password'
export const DEFAULT_PASSWORD_HASH = "5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8";