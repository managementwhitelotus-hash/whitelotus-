import { Worker, AttendanceRecord, SystemSettings, WorkerStatus, AttendanceStatus } from '../types';
import { sha256, generateSecureToken } from './cryptoService';

const WORKERS_KEY = 'wl_workers';
const ATTENDANCE_KEY = 'wl_attendance';
const SETTINGS_KEY = 'wl_settings';

// Initialize DB if empty
const initDB = () => {
  if (!localStorage.getItem(WORKERS_KEY)) {
    localStorage.setItem(WORKERS_KEY, JSON.stringify([]));
  }
  if (!localStorage.getItem(ATTENDANCE_KEY)) {
    localStorage.setItem(ATTENDANCE_KEY, JSON.stringify([]));
  }
  if (!localStorage.getItem(SETTINGS_KEY)) {
    const defaultSettings: SystemSettings = {
      storageType: 'DATABASE',
      organizationName: 'White Lotus Corp',
    };
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(defaultSettings));
  }
};

initDB();

export const getWorkers = (): Worker[] => {
  const data = localStorage.getItem(WORKERS_KEY);
  return data ? JSON.parse(data) : [];
};

export const addWorker = async (name: string, role: string): Promise<Worker> => {
  const workers = getWorkers();
  const rawToken = generateSecureToken();
  const tokenHash = await sha256(rawToken);
  
  const newWorker: Worker = {
    id: crypto.randomUUID(),
    name,
    role,
    qr_token: rawToken, // In a real system, do NOT store this plain text after generation. Only give to user once.
    qr_hash: tokenHash,
    status: WorkerStatus.ACTIVE,
    created_at: new Date().toISOString(),
    avatar_url: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`,
  };

  workers.push(newWorker);
  localStorage.setItem(WORKERS_KEY, JSON.stringify(workers));
  return newWorker;
};

export const deleteWorker = (id: string) => {
  const workers = getWorkers();
  const filtered = workers.filter(w => w.id !== id);
  localStorage.setItem(WORKERS_KEY, JSON.stringify(filtered));
};

export const getAttendance = (): AttendanceRecord[] => {
  const data = localStorage.getItem(ATTENDANCE_KEY);
  return data ? JSON.parse(data) : [];
};

// Used by Worker QR Scan
export const markAttendance = (workerId: string, status: AttendanceStatus, notes?: string): AttendanceRecord => {
  const workers = getWorkers();
  const worker = workers.find(w => w.id === workerId);
  if (!worker) throw new Error("Worker not found");

  const records = getAttendance();
  const now = new Date();
  
  const newRecord: AttendanceRecord = {
    id: crypto.randomUUID(),
    worker_id: workerId,
    worker_name: worker.name,
    date: now.toISOString().split('T')[0],
    timestamp: now.toISOString(),
    check_in: status === AttendanceStatus.PRESENT ? now.toISOString() : undefined,
    status,
    notes
  };

  records.unshift(newRecord); // Add to top
  localStorage.setItem(ATTENDANCE_KEY, JSON.stringify(records));
  return newRecord;
};

// Used by Admin for Manual Entry
export const createManualRecord = (
  workerId: string, 
  date: string, 
  status: AttendanceStatus, 
  checkInTime: string, // "HH:mm"
  checkOutTime: string, // "HH:mm"
  notes?: string
): AttendanceRecord => {
  const workers = getWorkers();
  const worker = workers.find(w => w.id === workerId);
  if (!worker) throw new Error("Worker not found");

  const records = getAttendance();
  
  // Helper to construct ISO string from date + time input
  const buildDateTime = (dateStr: string, timeStr: string): string | undefined => {
    if (!timeStr) return undefined;
    return new Date(`${dateStr}T${timeStr}`).toISOString();
  };

  const newRecord: AttendanceRecord = {
    id: crypto.randomUUID(),
    worker_id: workerId,
    worker_name: worker.name,
    date: date,
    timestamp: new Date().toISOString(),
    check_in: buildDateTime(date, checkInTime),
    check_out: buildDateTime(date, checkOutTime),
    status,
    notes
  };

  records.unshift(newRecord);
  localStorage.setItem(ATTENDANCE_KEY, JSON.stringify(records));
  return newRecord;
};

export const validateWorkerQR = async (qrToken: string): Promise<Worker | null> => {
  const workers = getWorkers();
  // We hash the incoming token and compare it to the stored hash
  const inputHash = await sha256(qrToken);
  return workers.find(w => w.qr_hash === inputHash) || null;
};

export const getSettings = (): SystemSettings => {
  return JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}');
};

export const updateSettings = (settings: SystemSettings) => {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
};

export const exportDataToCSV = () => {
    const attendance = getAttendance();
    const csvContent = "data:text/csv;charset=utf-8," 
        + "ID,Worker Name,Date,Check In,Check Out,Status,Notes\n"
        + attendance.map(row => {
            const inTime = row.check_in ? new Date(row.check_in).toLocaleTimeString() : '';
            const outTime = row.check_out ? new Date(row.check_out).toLocaleTimeString() : '';
            return `${row.id},${row.worker_name},${row.date},${inTime},${outTime},${row.status},${row.notes || ''}`;
        }).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "attendance_logs.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};