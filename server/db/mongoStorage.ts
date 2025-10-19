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
  type InsertWarning,
  type MeCategory,
  type InsertMeCategory,
  type Promotion,
  type InsertPromotion,
  type Log,
  type InsertLog,
  LogAction
} from "@shared/schema";
import { 
  UserModel,
  ShiftModel,
  CovenantModel,
  RuleModel,
  MeCommandModel,
  AttendanceRecordModel,
  WarningModel,
  MeCategoryModel,
  PromotionModel,
  LogModel
} from "./models";
import { randomUUID } from "crypto";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByAccessCode(accessCode: string): Promise<User | undefined>;
  getAllUsers(): Promise<User[]>;
  getUsersByShift(shiftId: string): Promise<User[]>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<User>): Promise<User | undefined>;
  deleteUser(id: string): Promise<boolean>;

  getShift(id: string): Promise<Shift | undefined>;
  getAllShifts(): Promise<Shift[]>;
  createShift(shift: InsertShift): Promise<Shift>;
  updateShift(id: string, updates: Partial<Shift>): Promise<Shift | undefined>;
  deleteShift(id: string): Promise<boolean>;
  validateShiftPassword(shiftId: string, password: string): Promise<boolean>;

  getCovenant(id: string): Promise<Covenant | undefined>;
  getAllCovenants(): Promise<Covenant[]>;
  createCovenant(covenant: InsertCovenant): Promise<Covenant>;
  updateCovenant(id: string, updates: Partial<Covenant>): Promise<Covenant | undefined>;
  deleteCovenant(id: string): Promise<boolean>;

  getRule(id: string): Promise<Rule | undefined>;
  getAllRules(): Promise<Rule[]>;
  getRulesByType(type: "general" | "shift"): Promise<Rule[]>;
  getRulesByShift(shiftId: string): Promise<Rule[]>;
  createRule(rule: InsertRule): Promise<Rule>;
  updateRule(id: string, updates: Partial<Rule>): Promise<Rule | undefined>;
  deleteRule(id: string): Promise<boolean>;

  getMeCommand(id: string): Promise<MeCommand | undefined>;
  getAllMeCommands(): Promise<MeCommand[]>;
  getMeCommandsByType(type: "general" | "shift"): Promise<MeCommand[]>;
  getMeCommandsByShift(shiftId: string): Promise<MeCommand[]>;
  getMeCommandsByCategory(categoryId: string): Promise<MeCommand[]>;
  createMeCommand(command: InsertMeCommand): Promise<MeCommand>;
  updateMeCommand(id: string, updates: Partial<MeCommand>): Promise<MeCommand | undefined>;
  deleteMeCommand(id: string): Promise<boolean>;

  getAttendanceRecord(id: string): Promise<AttendanceRecord | undefined>;
  getAllAttendanceRecords(): Promise<AttendanceRecord[]>;
  getAttendanceByShift(shiftId: string): Promise<AttendanceRecord[]>;
  getAttendanceByUser(userId: string): Promise<AttendanceRecord[]>;
  getAttendanceByShiftAndDate(shiftId: string, date: string): Promise<AttendanceRecord[]>;
  createAttendanceRecord(record: InsertAttendanceRecord): Promise<AttendanceRecord>;
  updateAttendanceRecord(id: string, updates: Partial<AttendanceRecord>): Promise<AttendanceRecord | undefined>;
  deleteAttendanceRecord(id: string): Promise<boolean>;

  getWarning(id: string): Promise<Warning | undefined>;
  getAllWarnings(): Promise<Warning[]>;
  getWarningsByUser(userId: string): Promise<Warning[]>;
  getWarningsByShift(shiftId: string): Promise<Warning[]>;
  createWarning(warning: InsertWarning): Promise<Warning>;
  updateWarning(id: string, updates: Partial<Warning>): Promise<Warning | undefined>;
  deleteWarning(id: string): Promise<boolean>;

  getMeCategory(id: string): Promise<MeCategory | undefined>;
  getAllMeCategories(): Promise<MeCategory[]>;
  getMeCategoriesByType(type: "general" | "shift"): Promise<MeCategory[]>;
  getMeCategoriesByShift(shiftId: string): Promise<MeCategory[]>;
  createMeCategory(category: InsertMeCategory): Promise<MeCategory>;
  updateMeCategory(id: string, updates: Partial<MeCategory>): Promise<MeCategory | undefined>;
  deleteMeCategory(id: string): Promise<boolean>;

  getPromotion(id: string): Promise<Promotion | undefined>;
  getAllPromotions(): Promise<Promotion[]>;
  getPromotionsByUser(userId: string): Promise<Promotion[]>;
  createPromotion(promotion: InsertPromotion): Promise<Promotion>;

  getLog(id: string): Promise<Log | undefined>;
  getAllLogs(): Promise<Log[]>;
  getLogsByUser(userId: string): Promise<Log[]>;
  getLogsByAction(action: LogAction): Promise<Log[]>;
  createLog(log: InsertLog): Promise<Log>;
}

export class MongoDBStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const user = await UserModel.findById(id).lean();
    return user ? this.formatUser(user) : undefined;
  }

  async getUserByAccessCode(accessCode: string): Promise<User | undefined> {
    const user = await UserModel.findOne({ accessCode }).lean();
    return user ? this.formatUser(user) : undefined;
  }

  async getAllUsers(): Promise<User[]> {
    const users = await UserModel.find().lean();
    return users.map(u => this.formatUser(u));
  }

  async getUsersByShift(shiftId: string): Promise<User[]> {
    const users = await UserModel.find({ shiftId }).lean();
    return users.map(u => this.formatUser(u));
  }

  async createUser(user: InsertUser): Promise<User> {
    const newUser = new UserModel({
      ...user,
      createdAt: new Date().toISOString()
    });
    const saved = await newUser.save();
    return this.formatUser(saved.toObject());
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | undefined> {
    const user = await UserModel.findByIdAndUpdate(id, updates, { new: true }).lean();
    return user ? this.formatUser(user) : undefined;
  }

  async deleteUser(id: string): Promise<boolean> {
    const result = await UserModel.findByIdAndDelete(id);
    return !!result;
  }

  async getShift(id: string): Promise<Shift | undefined> {
    const shift = await ShiftModel.findById(id).lean();
    return shift ? this.formatShift(shift) : undefined;
  }

  async getAllShifts(): Promise<Shift[]> {
    const shifts = await ShiftModel.find().lean();
    return shifts.map(s => this.formatShift(s));
  }

  async createShift(shift: InsertShift): Promise<Shift> {
    const newShift = new ShiftModel({
      ...shift,
      createdAt: new Date().toISOString()
    });
    const saved = await newShift.save();
    return this.formatShift(saved.toObject());
  }

  async updateShift(id: string, updates: Partial<Shift>): Promise<Shift | undefined> {
    const shift = await ShiftModel.findByIdAndUpdate(id, updates, { new: true }).lean();
    return shift ? this.formatShift(shift) : undefined;
  }

  async deleteShift(id: string): Promise<boolean> {
    const result = await ShiftModel.findByIdAndDelete(id);
    return !!result;
  }

  async validateShiftPassword(shiftId: string, password: string): Promise<boolean> {
    const shift = await ShiftModel.findById(shiftId).lean();
    return shift ? shift.password === password : false;
  }

  async getCovenant(id: string): Promise<Covenant | undefined> {
    const covenant = await CovenantModel.findById(id).lean();
    return covenant ? this.formatCovenant(covenant) : undefined;
  }

  async getAllCovenants(): Promise<Covenant[]> {
    const covenants = await CovenantModel.find().lean();
    return covenants.map(c => this.formatCovenant(c));
  }

  async createCovenant(covenant: InsertCovenant): Promise<Covenant> {
    const daysPerReais = 7.5 / 1000;
    const days = covenant.amountPaid * daysPerReais;
    const totalSeconds = Math.floor(days * 24 * 60 * 60);

    const startDate = new Date();
    const endDate = new Date(startDate.getTime() + totalSeconds * 1000);

    const newCovenant = new CovenantModel({
      organizationName: covenant.organizationName,
      amountPaid: covenant.amountPaid,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      totalSeconds,
      createdAt: new Date().toISOString()
    });

    const saved = await newCovenant.save();
    return this.formatCovenant(saved.toObject());
  }

  async updateCovenant(id: string, updates: Partial<Covenant>): Promise<Covenant | undefined> {
    const covenant = await CovenantModel.findByIdAndUpdate(id, updates, { new: true }).lean();
    return covenant ? this.formatCovenant(covenant) : undefined;
  }

  async deleteCovenant(id: string): Promise<boolean> {
    const result = await CovenantModel.findByIdAndDelete(id);
    return !!result;
  }

  async getRule(id: string): Promise<Rule | undefined> {
    const rule = await RuleModel.findById(id).lean();
    return rule ? this.formatRule(rule) : undefined;
  }

  async getAllRules(): Promise<Rule[]> {
    const rules = await RuleModel.find().lean();
    return rules.map(r => this.formatRule(r));
  }

  async getRulesByType(type: "general" | "shift"): Promise<Rule[]> {
    const rules = await RuleModel.find({ type }).lean();
    return rules.map(r => this.formatRule(r));
  }

  async getRulesByShift(shiftId: string): Promise<Rule[]> {
    const rules = await RuleModel.find({ $or: [{ shiftId }, { type: 'general' }] }).lean();
    return rules.map(r => this.formatRule(r));
  }

  async createRule(rule: InsertRule): Promise<Rule> {
    const now = new Date().toISOString();
    const newRule = new RuleModel({
      ...rule,
      createdAt: now,
      updatedAt: now
    });
    const saved = await newRule.save();
    return this.formatRule(saved.toObject());
  }

  async updateRule(id: string, updates: Partial<Rule>): Promise<Rule | undefined> {
    const rule = await RuleModel.findByIdAndUpdate(
      id, 
      { ...updates, updatedAt: new Date().toISOString() }, 
      { new: true }
    ).lean();
    return rule ? this.formatRule(rule) : undefined;
  }

  async deleteRule(id: string): Promise<boolean> {
    const result = await RuleModel.findByIdAndDelete(id);
    return !!result;
  }

  async getMeCategory(id: string): Promise<MeCategory | undefined> {
    const category = await MeCategoryModel.findById(id).lean();
    return category ? this.formatMeCategory(category) : undefined;
  }

  async getAllMeCategories(): Promise<MeCategory[]> {
    const categories = await MeCategoryModel.find().lean();
    return categories.map(c => this.formatMeCategory(c));
  }

  async getMeCategoriesByType(type: "general" | "shift"): Promise<MeCategory[]> {
    const categories = await MeCategoryModel.find({ type }).lean();
    return categories.map(c => this.formatMeCategory(c));
  }

  async getMeCategoriesByShift(shiftId: string): Promise<MeCategory[]> {
    const categories = await MeCategoryModel.find({ type: "shift", shiftId }).lean();
    return categories.map(c => this.formatMeCategory(c));
  }

  async createMeCategory(category: InsertMeCategory): Promise<MeCategory> {
    const newCategory = new MeCategoryModel({
      ...category,
      createdAt: new Date().toISOString()
    });
    const saved = await newCategory.save();
    return this.formatMeCategory(saved.toObject());
  }

  async updateMeCategory(id: string, updates: Partial<MeCategory>): Promise<MeCategory | undefined> {
    const category = await MeCategoryModel.findByIdAndUpdate(id, updates, { new: true }).lean();
    return category ? this.formatMeCategory(category) : undefined;
  }

  async deleteMeCategory(id: string): Promise<boolean> {
    const result = await MeCategoryModel.findByIdAndDelete(id);
    return !!result;
  }

  async getMeCommand(id: string): Promise<MeCommand | undefined> {
    const command = await MeCommandModel.findById(id).lean();
    return command ? this.formatMeCommand(command) : undefined;
  }

  async getAllMeCommands(): Promise<MeCommand[]> {
    const commands = await MeCommandModel.find().lean();
    return commands.map(c => this.formatMeCommand(c));
  }

  async getMeCommandsByType(type: "general" | "shift"): Promise<MeCommand[]> {
    const commands = await MeCommandModel.find({ type }).lean();
    return commands.map(c => this.formatMeCommand(c));
  }

  async getMeCommandsByShift(shiftId: string): Promise<MeCommand[]> {
    const commands = await MeCommandModel.find({ $or: [{ shiftId }, { type: 'general' }] }).lean();
    return commands.map(c => this.formatMeCommand(c));
  }

  async getMeCommandsByCategory(categoryId: string): Promise<MeCommand[]> {
    const commands = await MeCommandModel.find({ categoryId }).lean();
    return commands.map(c => this.formatMeCommand(c));
  }

  async createMeCommand(command: InsertMeCommand): Promise<MeCommand> {
    const newCommand = new MeCommandModel({
      ...command,
      createdAt: new Date().toISOString()
    });
    const saved = await newCommand.save();
    return this.formatMeCommand(saved.toObject());
  }

  async updateMeCommand(id: string, updates: Partial<MeCommand>): Promise<MeCommand | undefined> {
    const command = await MeCommandModel.findByIdAndUpdate(id, updates, { new: true }).lean();
    return command ? this.formatMeCommand(command) : undefined;
  }

  async deleteMeCommand(id: string): Promise<boolean> {
    const result = await MeCommandModel.findByIdAndDelete(id);
    return !!result;
  }

  async getAttendanceRecord(id: string): Promise<AttendanceRecord | undefined> {
    const record = await AttendanceRecordModel.findById(id).lean();
    return record ? this.formatAttendanceRecord(record) : undefined;
  }

  async getAllAttendanceRecords(): Promise<AttendanceRecord[]> {
    const records = await AttendanceRecordModel.find().lean();
    return records.map(r => this.formatAttendanceRecord(r));
  }

  async getAttendanceByShift(shiftId: string): Promise<AttendanceRecord[]> {
    const records = await AttendanceRecordModel.find({ shiftId }).lean();
    return records.map(r => this.formatAttendanceRecord(r));
  }

  async getAttendanceByUser(userId: string): Promise<AttendanceRecord[]> {
    const records = await AttendanceRecordModel.find({ userId }).lean();
    return records.map(r => this.formatAttendanceRecord(r));
  }

  async getAttendanceByShiftAndDate(shiftId: string, date: string): Promise<AttendanceRecord[]> {
    const records = await AttendanceRecordModel.find({ shiftId, date }).lean();
    return records.map(r => this.formatAttendanceRecord(r));
  }

  async createAttendanceRecord(record: InsertAttendanceRecord): Promise<AttendanceRecord> {
    const newRecord = new AttendanceRecordModel({
      ...record,
      createdAt: new Date().toISOString()
    });
    const saved = await newRecord.save();
    return this.formatAttendanceRecord(saved.toObject());
  }

  async updateAttendanceRecord(id: string, updates: Partial<AttendanceRecord>): Promise<AttendanceRecord | undefined> {
    const record = await AttendanceRecordModel.findByIdAndUpdate(id, updates, { new: true }).lean();
    return record ? this.formatAttendanceRecord(record) : undefined;
  }

  async deleteAttendanceRecord(id: string): Promise<boolean> {
    const result = await AttendanceRecordModel.findByIdAndDelete(id);
    return !!result;
  }

  async getWarning(id: string): Promise<Warning | undefined> {
    const warning = await WarningModel.findById(id).lean();
    return warning ? this.formatWarning(warning) : undefined;
  }

  async getAllWarnings(): Promise<Warning[]> {
    const warnings = await WarningModel.find().lean();
    return warnings.map(w => this.formatWarning(w));
  }

  async getWarningsByUser(userId: string): Promise<Warning[]> {
    const warnings = await WarningModel.find({ userId }).lean();
    return warnings.map(w => this.formatWarning(w));
  }

  async getWarningsByShift(shiftId: string): Promise<Warning[]> {
    const warnings = await WarningModel.find({ shiftId }).lean();
    return warnings.map(w => this.formatWarning(w));
  }

  async createWarning(warning: InsertWarning): Promise<Warning> {
    const newWarning = new WarningModel({
      ...warning,
      createdAt: new Date().toISOString()
    });
    const saved = await newWarning.save();
    return this.formatWarning(saved.toObject());
  }

  async updateWarning(id: string, updates: Partial<Warning>): Promise<Warning | undefined> {
    const warning = await WarningModel.findByIdAndUpdate(id, updates, { new: true }).lean();
    return warning ? this.formatWarning(warning) : undefined;
  }

  async deleteWarning(id: string): Promise<boolean> {
    const result = await WarningModel.findByIdAndDelete(id);
    return !!result;
  }

  async getPromotion(id: string): Promise<Promotion | undefined> {
    const promotion = await PromotionModel.findById(id).lean();
    return promotion ? this.formatPromotion(promotion) : undefined;
  }

  async getAllPromotions(): Promise<Promotion[]> {
    const promotions = await PromotionModel.find().lean();
    return promotions.map(p => this.formatPromotion(p));
  }

  async getPromotionsByUser(userId: string): Promise<Promotion[]> {
    const promotions = await PromotionModel.find({ userId }).lean();
    return promotions.map(p => this.formatPromotion(p));
  }

  async createPromotion(promotion: InsertPromotion): Promise<Promotion> {
    const newPromotion = new PromotionModel({
      ...promotion,
      createdAt: new Date().toISOString()
    });
    const saved = await newPromotion.save();
    return this.formatPromotion(saved.toObject());
  }

  async getLog(id: string): Promise<Log | undefined> {
    const log = await LogModel.findById(id).lean();
    return log ? this.formatLog(log) : undefined;
  }

  async getAllLogs(): Promise<Log[]> {
    const logs = await LogModel.find().sort({ createdAt: -1 }).lean();
    return logs.map(l => this.formatLog(l));
  }

  async getLogsByUser(userId: string): Promise<Log[]> {
    const logs = await LogModel.find({ userId }).sort({ createdAt: -1 }).lean();
    return logs.map(l => this.formatLog(l));
  }

  async getLogsByAction(action: LogAction): Promise<Log[]> {
    const logs = await LogModel.find({ action }).sort({ createdAt: -1 }).lean();
    return logs.map(l => this.formatLog(l));
  }

  async createLog(log: InsertLog): Promise<Log> {
    const newLog = new LogModel({
      ...log,
      createdAt: new Date().toISOString()
    });
    const saved = await newLog.save();
    return this.formatLog(saved.toObject());
  }

  private formatUser(user: any): User {
    return {
      id: user._id.toString(),
      accessCode: user.accessCode,
      name: user.name,
      role: user.role,
      shiftId: user.shiftId,
      isChiefSurgeon: user.isChiefSurgeon || false,
      narniaName: user.narniaName,
      phone: user.phone
    };
  }

  private formatShift(shift: any): Shift {
    return {
      id: shift._id.toString(),
      name: shift.name,
      viceDirectorId: shift.viceDirectorId,
      password: shift.password,
      createdAt: shift.createdAt
    };
  }

  private formatCovenant(covenant: any): Covenant {
    return {
      id: covenant._id.toString(),
      organizationName: covenant.organizationName,
      amountPaid: covenant.amountPaid,
      startDate: covenant.startDate,
      endDate: covenant.endDate,
      totalSeconds: covenant.totalSeconds,
      createdAt: covenant.createdAt
    };
  }

  private formatRule(rule: any): Rule {
    return {
      id: rule._id.toString(),
      title: rule.title,
      content: rule.content,
      type: rule.type,
      shiftId: rule.shiftId,
      createdAt: rule.createdAt,
      updatedAt: rule.updatedAt
    };
  }

  private formatMeCategory(category: any): MeCategory {
    return {
      id: category._id.toString(),
      name: category.name,
      description: category.description,
      createdAt: category.createdAt
    };
  }

  private formatMeCommand(command: any): MeCommand {
    return {
      id: command._id.toString(),
      text: command.text,
      categoryId: command.categoryId,
      createdAt: command.createdAt
    };
  }

  private formatAttendanceRecord(record: any): AttendanceRecord {
    return {
      id: record._id.toString(),
      userId: record.userId,
      shiftId: record.shiftId,
      date: record.date,
      status: record.status,
      notes: record.notes,
      createdAt: record.createdAt,
      createdBy: record.createdBy
    };
  }

  private formatWarning(warning: any): Warning {
    return {
      id: warning._id.toString(),
      userId: warning.userId,
      issuedBy: warning.issuedBy,
      shiftId: warning.shiftId,
      reason: warning.reason,
      occurrenceType: warning.occurrenceType,
      occurrenceDate: warning.occurrenceDate,
      notes: warning.notes,
      createdAt: warning.createdAt
    };
  }

  private formatPromotion(promotion: any): Promotion {
    return {
      id: promotion._id.toString(),
      userId: promotion.userId,
      promotedBy: promotion.promotedBy,
      fromRole: promotion.fromRole,
      toRole: promotion.toRole,
      shiftId: promotion.shiftId,
      notes: promotion.notes,
      createdAt: promotion.createdAt
    };
  }

  private formatLog(log: any): Log {
    return {
      id: log._id.toString(),
      action: log.action,
      userId: log.userId,
      targetUserId: log.targetUserId,
      shiftId: log.shiftId,
      details: log.details,
      metadata: log.metadata,
      createdAt: log.createdAt
    };
  }
}

export const storage = new MongoDBStorage();
