import { 
  type User, 
  type InsertUser,
  type Shift,
  type InsertShift,
  type Covenant,
  type InsertCovenant,
  type Rule,
  type InsertRule,
  type MeCommand,
  type InsertMeCommand,
  type AttendanceRecord,
  type InsertAttendanceRecord,
  type Warning,
  type InsertWarning
} from "@shared/schema";
import { randomUUID } from "crypto";
import fs from "fs/promises";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data");
const USERS_FILE = path.join(DATA_DIR, "users.json");
const SHIFTS_FILE = path.join(DATA_DIR, "shifts.json");
const COVENANTS_FILE = path.join(DATA_DIR, "covenants.json");
const RULES_FILE = path.join(DATA_DIR, "rules.json");
const ME_COMMANDS_FILE = path.join(DATA_DIR, "me-commands.json");
const ATTENDANCE_FILE = path.join(DATA_DIR, "attendance.json");
const WARNINGS_FILE = path.join(DATA_DIR, "warnings.json");

async function ensureDataDir() {
  try {
    await fs.access(DATA_DIR);
  } catch {
    await fs.mkdir(DATA_DIR, { recursive: true });
  }
}

async function readJSONFile<T>(filePath: string, defaultValue: T): Promise<T> {
  try {
    const data = await fs.readFile(filePath, "utf-8");
    return JSON.parse(data);
  } catch {
    return defaultValue;
  }
}

async function writeJSONFile<T>(filePath: string, data: T): Promise<void> {
  await ensureDataDir();
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), "utf-8");
}

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByAccessCode(accessCode: string): Promise<User | undefined>;
  getAllUsers(): Promise<User[]>;
  getUsersByShift(shiftId: string): Promise<User[]>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<User>): Promise<User | undefined>;
  deleteUser(id: string): Promise<boolean>;

  // Shifts
  getShift(id: string): Promise<Shift | undefined>;
  getAllShifts(): Promise<Shift[]>;
  createShift(shift: InsertShift): Promise<Shift>;
  updateShift(id: string, updates: Partial<Shift>): Promise<Shift | undefined>;
  deleteShift(id: string): Promise<boolean>;
  validateShiftPassword(shiftId: string, password: string): Promise<boolean>;

  // Covenants
  getCovenant(id: string): Promise<Covenant | undefined>;
  getAllCovenants(): Promise<Covenant[]>;
  createCovenant(covenant: InsertCovenant): Promise<Covenant>;
  updateCovenant(id: string, updates: Partial<Covenant>): Promise<Covenant | undefined>;
  deleteCovenant(id: string): Promise<boolean>;

  // Rules
  getRule(id: string): Promise<Rule | undefined>;
  getAllRules(): Promise<Rule[]>;
  getRulesByType(type: "general" | "shift"): Promise<Rule[]>;
  getRulesByShift(shiftId: string): Promise<Rule[]>;
  createRule(rule: InsertRule): Promise<Rule>;
  updateRule(id: string, updates: Partial<Rule>): Promise<Rule | undefined>;
  deleteRule(id: string): Promise<boolean>;

  // Me Commands
  getMeCommand(id: string): Promise<MeCommand | undefined>;
  getAllMeCommands(): Promise<MeCommand[]>;
  getMeCommandsByType(type: "general" | "shift"): Promise<MeCommand[]>;
  getMeCommandsByShift(shiftId: string): Promise<MeCommand[]>;
  createMeCommand(command: InsertMeCommand): Promise<MeCommand>;
  updateMeCommand(id: string, updates: Partial<MeCommand>): Promise<MeCommand | undefined>;
  deleteMeCommand(id: string): Promise<boolean>;

  // Attendance
  getAttendanceRecord(id: string): Promise<AttendanceRecord | undefined>;
  getAllAttendanceRecords(): Promise<AttendanceRecord[]>;
  getAttendanceByShift(shiftId: string): Promise<AttendanceRecord[]>;
  getAttendanceByUser(userId: string): Promise<AttendanceRecord[]>;
  getAttendanceByShiftAndDate(shiftId: string, date: string): Promise<AttendanceRecord[]>;
  createAttendanceRecord(record: InsertAttendanceRecord): Promise<AttendanceRecord>;
  updateAttendanceRecord(id: string, updates: Partial<AttendanceRecord>): Promise<AttendanceRecord | undefined>;
  deleteAttendanceRecord(id: string): Promise<boolean>;

  // Warnings
  getWarning(id: string): Promise<Warning | undefined>;
  getAllWarnings(): Promise<Warning[]>;
  getWarningsByUser(userId: string): Promise<Warning[]>;
  getWarningsByShift(shiftId: string): Promise<Warning[]>;
  createWarning(warning: InsertWarning): Promise<Warning>;
  updateWarning(id: string, updates: Partial<Warning>): Promise<Warning | undefined>;
  deleteWarning(id: string): Promise<boolean>;
}

export class FileStorage implements IStorage {
  // Users
  async getUser(id: string): Promise<User | undefined> {
    const users = await readJSONFile<User[]>(USERS_FILE, []);
    return users.find(u => u.id === id);
  }

  async getUserByAccessCode(accessCode: string): Promise<User | undefined> {
    const users = await readJSONFile<User[]>(USERS_FILE, []);
    return users.find(u => u.accessCode === accessCode);
  }

  async getAllUsers(): Promise<User[]> {
    return readJSONFile<User[]>(USERS_FILE, []);
  }

  async getUsersByShift(shiftId: string): Promise<User[]> {
    const users = await readJSONFile<User[]>(USERS_FILE, []);
    return users.filter(u => u.shiftId === shiftId);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const users = await readJSONFile<User[]>(USERS_FILE, []);
    const user: User = { ...insertUser, id: randomUUID() };
    users.push(user);
    await writeJSONFile(USERS_FILE, users);
    return user;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | undefined> {
    const users = await readJSONFile<User[]>(USERS_FILE, []);
    const index = users.findIndex(u => u.id === id);
    if (index === -1) return undefined;

    users[index] = { ...users[index], ...updates };
    await writeJSONFile(USERS_FILE, users);
    return users[index];
  }

  async deleteUser(id: string): Promise<boolean> {
    const users = await readJSONFile<User[]>(USERS_FILE, []);
    const filtered = users.filter(u => u.id !== id);
    if (filtered.length === users.length) return false;
    await writeJSONFile(USERS_FILE, filtered);
    return true;
  }

  // Shifts
  async getShift(id: string): Promise<Shift | undefined> {
    const shifts = await readJSONFile<Shift[]>(SHIFTS_FILE, []);
    return shifts.find(s => s.id === id);
  }

  async getAllShifts(): Promise<Shift[]> {
    return readJSONFile<Shift[]>(SHIFTS_FILE, []);
  }

  async createShift(insertShift: InsertShift): Promise<Shift> {
    const shifts = await readJSONFile<Shift[]>(SHIFTS_FILE, []);
    const shift: Shift = {
      ...insertShift,
      id: randomUUID(),
      createdAt: new Date().toISOString()
    };
    shifts.push(shift);
    await writeJSONFile(SHIFTS_FILE, shifts);
    return shift;
  }

  async updateShift(id: string, updates: Partial<Shift>): Promise<Shift | undefined> {
    const shifts = await readJSONFile<Shift[]>(SHIFTS_FILE, []);
    const index = shifts.findIndex(s => s.id === id);
    if (index === -1) return undefined;

    shifts[index] = { ...shifts[index], ...updates };
    await writeJSONFile(SHIFTS_FILE, shifts);
    return shifts[index];
  }

  async deleteShift(id: string): Promise<boolean> {
    const shifts = await readJSONFile<Shift[]>(SHIFTS_FILE, []);
    const filtered = shifts.filter(s => s.id !== id);
    if (filtered.length === shifts.length) return false;
    await writeJSONFile(SHIFTS_FILE, filtered);
    return true;
  }

  async validateShiftPassword(shiftId: string, password: string): Promise<boolean> {
    const shift = await this.getShift(shiftId);
    return shift?.password === password;
  }

  // Covenants
  async getCovenant(id: string): Promise<Covenant | undefined> {
    const covenants = await readJSONFile<Covenant[]>(COVENANTS_FILE, []);
    return covenants.find(c => c.id === id);
  }

  async getAllCovenants(): Promise<Covenant[]> {
    return readJSONFile<Covenant[]>(COVENANTS_FILE, []);
  }

  async createCovenant(insertCovenant: InsertCovenant): Promise<Covenant> {
    const covenants = await readJSONFile<Covenant[]>(COVENANTS_FILE, []);
    
    const startDate = new Date();
    const days = (insertCovenant.amountPaid / 4000) * 30;
    const totalSeconds = Math.floor(days * 24 * 60 * 60);
    const endDate = new Date(startDate.getTime() + totalSeconds * 1000);

    const covenant: Covenant = {
      id: randomUUID(),
      organizationName: insertCovenant.organizationName,
      amountPaid: insertCovenant.amountPaid,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      totalSeconds,
      createdAt: new Date().toISOString()
    };
    covenants.push(covenant);
    await writeJSONFile(COVENANTS_FILE, covenants);
    return covenant;
  }

  async updateCovenant(id: string, updates: Partial<Covenant>): Promise<Covenant | undefined> {
    const covenants = await readJSONFile<Covenant[]>(COVENANTS_FILE, []);
    const index = covenants.findIndex(c => c.id === id);
    if (index === -1) return undefined;

    covenants[index] = { ...covenants[index], ...updates };
    await writeJSONFile(COVENANTS_FILE, covenants);
    return covenants[index];
  }

  async deleteCovenant(id: string): Promise<boolean> {
    const covenants = await readJSONFile<Covenant[]>(COVENANTS_FILE, []);
    const filtered = covenants.filter(c => c.id !== id);
    if (filtered.length === covenants.length) return false;
    await writeJSONFile(COVENANTS_FILE, filtered);
    return true;
  }

  // Rules
  async getRule(id: string): Promise<Rule | undefined> {
    const rules = await readJSONFile<Rule[]>(RULES_FILE, []);
    return rules.find(r => r.id === id);
  }

  async getAllRules(): Promise<Rule[]> {
    return readJSONFile<Rule[]>(RULES_FILE, []);
  }

  async getRulesByType(type: "general" | "shift"): Promise<Rule[]> {
    const rules = await readJSONFile<Rule[]>(RULES_FILE, []);
    return rules.filter(r => r.type === type);
  }

  async getRulesByShift(shiftId: string): Promise<Rule[]> {
    const rules = await readJSONFile<Rule[]>(RULES_FILE, []);
    return rules.filter(r => r.shiftId === shiftId);
  }

  async createRule(insertRule: InsertRule): Promise<Rule> {
    const rules = await readJSONFile<Rule[]>(RULES_FILE, []);
    const now = new Date().toISOString();
    const rule: Rule = {
      id: randomUUID(),
      ...insertRule,
      createdAt: now,
      updatedAt: now
    };
    rules.push(rule);
    await writeJSONFile(RULES_FILE, rules);
    return rule;
  }

  async updateRule(id: string, updates: Partial<Rule>): Promise<Rule | undefined> {
    const rules = await readJSONFile<Rule[]>(RULES_FILE, []);
    const index = rules.findIndex(r => r.id === id);
    if (index === -1) return undefined;

    rules[index] = { 
      ...rules[index], 
      ...updates,
      updatedAt: new Date().toISOString()
    };
    await writeJSONFile(RULES_FILE, rules);
    return rules[index];
  }

  async deleteRule(id: string): Promise<boolean> {
    const rules = await readJSONFile<Rule[]>(RULES_FILE, []);
    const filtered = rules.filter(r => r.id !== id);
    if (filtered.length === rules.length) return false;
    await writeJSONFile(RULES_FILE, filtered);
    return true;
  }

  // Me Commands
  async getMeCommand(id: string): Promise<MeCommand | undefined> {
    const commands = await readJSONFile<MeCommand[]>(ME_COMMANDS_FILE, []);
    return commands.find(c => c.id === id);
  }

  async getAllMeCommands(): Promise<MeCommand[]> {
    return readJSONFile<MeCommand[]>(ME_COMMANDS_FILE, []);
  }

  async getMeCommandsByType(type: "general" | "shift"): Promise<MeCommand[]> {
    const commands = await readJSONFile<MeCommand[]>(ME_COMMANDS_FILE, []);
    return commands.filter(c => c.type === type);
  }

  async getMeCommandsByShift(shiftId: string): Promise<MeCommand[]> {
    const commands = await readJSONFile<MeCommand[]>(ME_COMMANDS_FILE, []);
    return commands.filter(c => c.shiftId === shiftId);
  }

  async createMeCommand(insertCommand: InsertMeCommand): Promise<MeCommand> {
    const commands = await readJSONFile<MeCommand[]>(ME_COMMANDS_FILE, []);
    const command: MeCommand = {
      id: randomUUID(),
      ...insertCommand,
      createdAt: new Date().toISOString()
    };
    commands.push(command);
    await writeJSONFile(ME_COMMANDS_FILE, commands);
    return command;
  }

  async updateMeCommand(id: string, updates: Partial<MeCommand>): Promise<MeCommand | undefined> {
    const commands = await readJSONFile<MeCommand[]>(ME_COMMANDS_FILE, []);
    const index = commands.findIndex(c => c.id === id);
    if (index === -1) return undefined;

    commands[index] = { ...commands[index], ...updates };
    await writeJSONFile(ME_COMMANDS_FILE, commands);
    return commands[index];
  }

  async deleteMeCommand(id: string): Promise<boolean> {
    const commands = await readJSONFile<MeCommand[]>(ME_COMMANDS_FILE, []);
    const filtered = commands.filter(c => c.id !== id);
    if (filtered.length === commands.length) return false;
    await writeJSONFile(ME_COMMANDS_FILE, filtered);
    return true;
  }

  // Attendance
  async getAttendanceRecord(id: string): Promise<AttendanceRecord | undefined> {
    const records = await readJSONFile<AttendanceRecord[]>(ATTENDANCE_FILE, []);
    return records.find(r => r.id === id);
  }

  async getAllAttendanceRecords(): Promise<AttendanceRecord[]> {
    return readJSONFile<AttendanceRecord[]>(ATTENDANCE_FILE, []);
  }

  async getAttendanceByShift(shiftId: string): Promise<AttendanceRecord[]> {
    const records = await readJSONFile<AttendanceRecord[]>(ATTENDANCE_FILE, []);
    return records.filter(r => r.shiftId === shiftId);
  }

  async getAttendanceByUser(userId: string): Promise<AttendanceRecord[]> {
    const records = await readJSONFile<AttendanceRecord[]>(ATTENDANCE_FILE, []);
    return records.filter(r => r.userId === userId);
  }

  async getAttendanceByShiftAndDate(shiftId: string, date: string): Promise<AttendanceRecord[]> {
    const records = await readJSONFile<AttendanceRecord[]>(ATTENDANCE_FILE, []);
    return records.filter(r => r.shiftId === shiftId && r.date === date);
  }

  async createAttendanceRecord(insertRecord: InsertAttendanceRecord): Promise<AttendanceRecord> {
    const records = await readJSONFile<AttendanceRecord[]>(ATTENDANCE_FILE, []);
    const record: AttendanceRecord = {
      id: randomUUID(),
      ...insertRecord,
      createdAt: new Date().toISOString()
    };
    records.push(record);
    await writeJSONFile(ATTENDANCE_FILE, records);
    return record;
  }

  async updateAttendanceRecord(id: string, updates: Partial<AttendanceRecord>): Promise<AttendanceRecord | undefined> {
    const records = await readJSONFile<AttendanceRecord[]>(ATTENDANCE_FILE, []);
    const index = records.findIndex(r => r.id === id);
    if (index === -1) return undefined;

    records[index] = { ...records[index], ...updates };
    await writeJSONFile(ATTENDANCE_FILE, records);
    return records[index];
  }

  async deleteAttendanceRecord(id: string): Promise<boolean> {
    const records = await readJSONFile<AttendanceRecord[]>(ATTENDANCE_FILE, []);
    const filtered = records.filter(r => r.id !== id);
    if (filtered.length === records.length) return false;
    await writeJSONFile(ATTENDANCE_FILE, filtered);
    return true;
  }

  // Warnings
  async getWarning(id: string): Promise<Warning | undefined> {
    const warnings = await readJSONFile<Warning[]>(WARNINGS_FILE, []);
    return warnings.find(w => w.id === id);
  }

  async getAllWarnings(): Promise<Warning[]> {
    return readJSONFile<Warning[]>(WARNINGS_FILE, []);
  }

  async getWarningsByUser(userId: string): Promise<Warning[]> {
    const warnings = await readJSONFile<Warning[]>(WARNINGS_FILE, []);
    return warnings.filter(w => w.userId === userId);
  }

  async getWarningsByShift(shiftId: string): Promise<Warning[]> {
    const warnings = await readJSONFile<Warning[]>(WARNINGS_FILE, []);
    return warnings.filter(w => w.shiftId === shiftId);
  }

  async createWarning(insertWarning: InsertWarning): Promise<Warning> {
    const warnings = await readJSONFile<Warning[]>(WARNINGS_FILE, []);
    const warning: Warning = {
      id: randomUUID(),
      ...insertWarning,
      createdAt: new Date().toISOString()
    };
    warnings.push(warning);
    await writeJSONFile(WARNINGS_FILE, warnings);
    return warning;
  }

  async updateWarning(id: string, updates: Partial<Warning>): Promise<Warning | undefined> {
    const warnings = await readJSONFile<Warning[]>(WARNINGS_FILE, []);
    const index = warnings.findIndex(w => w.id === id);
    if (index === -1) return undefined;

    warnings[index] = { ...warnings[index], ...updates };
    await writeJSONFile(WARNINGS_FILE, warnings);
    return warnings[index];
  }

  async deleteWarning(id: string): Promise<boolean> {
    const warnings = await readJSONFile<Warning[]>(WARNINGS_FILE, []);
    const filtered = warnings.filter(w => w.id !== id);
    if (filtered.length === warnings.length) return false;
    await writeJSONFile(WARNINGS_FILE, filtered);
    return true;
  }
}

export const storage = new FileStorage();
