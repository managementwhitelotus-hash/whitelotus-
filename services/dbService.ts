import { Worker, AttendanceRecord, SystemSettings, WorkerStatus, AttendanceStatus, Task, DEFAULT_PASSWORD_HASH } from '../types';
import { sha256, generateSecureToken } from './cryptoService';

const WORKERS_KEY = 'wl_workers';
const ATTENDANCE_KEY = 'wl_attendance';
const SETTINGS_KEY = 'wl_settings';
const TASKS_KEY = 'wl_tasks';

// Initialize DB if empty
const initDB = () => {
  if (!localStorage.getItem(WORKERS_KEY)) {
    localStorage.setItem(WORKERS_KEY, JSON.stringify([]));
  }
  if (!localStorage.getItem(ATTENDANCE_KEY)) {
    localStorage.setItem(ATTENDANCE_KEY, JSON.stringify([]));
  }
  if (!localStorage.getItem(TASKS_KEY)) {
    localStorage.setItem(TASKS_KEY, JSON.stringify([]));
  }
  if (!localStorage.getItem(SETTINGS_KEY)) {
    const defaultSettings: SystemSettings = {
      storageType: 'DATABASE',
      organizationName: 'White Lotus',
      adminUsername: 'admin',
      adminPasswordHash: DEFAULT_PASSWORD_HASH
    };
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(defaultSettings));
  }
};

initDB();

// --- SEED DATA FOR DEMO ---
export const seedDatabase = async () => {
    // Clear existing
    localStorage.removeItem(WORKERS_KEY);
    localStorage.removeItem(ATTENDANCE_KEY);
    localStorage.removeItem(TASKS_KEY);
    initDB();

    // Create Workers
    const w1 = await addWorker("Tanya McQuoid", "General Manager");
    const w2 = await addWorker("Portia", "Assistant");
    const w3 = await addWorker("Armond", "Hospitality Lead");

    // Create Attendance for last 3 days
    const today = new Date();
    const yesterday = new Date(today); yesterday.setDate(yesterday.getDate() - 1);
    const dayBefore = new Date(today); dayBefore.setDate(dayBefore.getDate() - 2);

    // Today
    createManualRecord(w1.id, today.toISOString().split('T')[0], AttendanceStatus.PRESENT, "09:00", "", "Early arrival");
    createManualRecord(w2.id, today.toISOString().split('T')[0], AttendanceStatus.ABSENT, "", "", "Sick leave");
    
    // Yesterday
    createManualRecord(w1.id, yesterday.toISOString().split('T')[0], AttendanceStatus.PRESENT, "09:15", "17:00", "");
    createManualRecord(w3.id, yesterday.toISOString().split('T')[0], AttendanceStatus.PRESENT, "08:00", "16:00", "");

    // Tasks
    addTask("Prepare VIP Welcome Kit", "For the incoming guests in Suite 1", w2.id, today.toISOString().split('T')[0]);
    addTask("Inventory Check", "Bar and Lounge area", w3.id, today.toISOString().split('T')[0]);
    
    return true;
};

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
    qr_token: rawToken, 
    qr_hash: tokenHash,
    status: WorkerStatus.ACTIVE,
    created_at: new Date().toISOString(),
    avatar_url: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&color=fff`,
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
  const inputHash = await sha256(qrToken);
  return workers.find(w => w.qr_hash === inputHash) || null;
};

export const getSettings = (): SystemSettings => {
  const defaults: SystemSettings = {
      storageType: 'DATABASE',
      organizationName: 'White Lotus',
      adminUsername: 'admin',
      adminPasswordHash: DEFAULT_PASSWORD_HASH
  };
  const stored = JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}');
  return { ...defaults, ...stored };
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

// --- Task Management ---

export const getTasks = (): Task[] => {
  const data = localStorage.getItem(TASKS_KEY);
  return data ? JSON.parse(data) : [];
};

export const addTask = (title: string, description: string, assignedTo: string, dueDate: string): Task => {
  const tasks = getTasks();
  const workers = getWorkers();
  const worker = workers.find(w => w.id === assignedTo);
  
  const newTask: Task = {
    id: crypto.randomUUID(),
    title,
    description,
    assignedTo,
    assignedName: worker ? worker.name : 'Unknown',
    dueDate,
    status: 'PENDING',
    createdAt: new Date().toISOString()
  };

  tasks.unshift(newTask);
  localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
  return newTask;
};

export const updateTaskStatus = (taskId: string, status: 'PENDING' | 'COMPLETED') => {
  const tasks = getTasks();
  const index = tasks.findIndex(t => t.id === taskId);
  if (index !== -1) {
    tasks[index].status = status;
    localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
  }
};

export const deleteTask = (taskId: string) => {
  const tasks = getTasks();
  const filtered = tasks.filter(t => t.id !== taskId);
  localStorage.setItem(TASKS_KEY, JSON.stringify(filtered));
};