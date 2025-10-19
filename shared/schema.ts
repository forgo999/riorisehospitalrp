import { z } from "zod";

// User Roles
export enum UserRole {
  ESTAGIARIO = "estagiario",
  PARAMEDICO = "paramedico",
  TERAPEUTA = "terapeuta",
  CIRURGIAO = "cirurgiao",
  VICE_DIRETOR = "vice_diretor",
  DIRETOR = "diretor",
  ADMINISTRADOR = "administrador"
}

// User Schema
export const userSchema = z.object({
  id: z.string(),
  accessCode: z.string(),
  name: z.string(),
  role: z.nativeEnum(UserRole),
  shiftId: z.string().nullable(),
  isChiefSurgeon: z.boolean().default(false),
  narniaName: z.string().optional(),
  phone: z.string().optional()
});

export const insertUserSchema = userSchema.omit({ id: true }).extend({
  isChiefSurgeon: z.boolean().optional().default(false)
});

export type User = z.infer<typeof userSchema>;
export type InsertUser = z.infer<typeof insertUserSchema>;

// Shift Schema
export const shiftSchema = z.object({
  id: z.string(),
  name: z.string(),
  viceDirectorId: z.string(),
  password: z.string(),
  createdAt: z.string()
});

export const insertShiftSchema = shiftSchema.omit({ id: true, createdAt: true });

export type Shift = z.infer<typeof shiftSchema>;
export type InsertShift = z.infer<typeof insertShiftSchema>;

// Covenant Schema
export const covenantSchema = z.object({
  id: z.string(),
  organizationName: z.string(),
  amountPaid: z.number(),
  startDate: z.string(),
  endDate: z.string(),
  totalSeconds: z.number(),
  createdAt: z.string()
});

export const insertCovenantSchema = z.object({
  organizationName: z.string().min(1, "Nome da organização é obrigatório"),
  amountPaid: z.number().min(1, "Valor deve ser maior que zero")
});

export type Covenant = z.infer<typeof covenantSchema>;
export type InsertCovenant = z.infer<typeof insertCovenantSchema>;

// Rule Schema
export const ruleSchema = z.object({
  id: z.string(),
  title: z.string(),
  content: z.string(),
  type: z.enum(["general", "shift"]),
  shiftId: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string()
});

export const insertRuleSchema = z.object({
  title: z.string().min(1, "Título é obrigatório"),
  content: z.string().min(1, "Conteúdo é obrigatório"),
  type: z.enum(["general", "shift"]),
  shiftId: z.string().nullable()
});

export type Rule = z.infer<typeof ruleSchema>;
export type InsertRule = z.infer<typeof insertRuleSchema>;

// /me Category Schema
export const meCategorySchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  type: z.enum(["general", "shift"]),
  shiftId: z.string().nullable(),
  createdAt: z.string()
});

export const insertMeCategorySchema = z.object({
  name: z.string().min(1, "Nome da categoria é obrigatório"),
  description: z.string().optional(),
  type: z.enum(["general", "shift"]),
  shiftId: z.string().nullable()
});

export type MeCategory = z.infer<typeof meCategorySchema>;
export type InsertMeCategory = z.infer<typeof insertMeCategorySchema>;

// /me Command Schema
export const meCommandSchema = z.object({
  id: z.string(),
  text: z.string(),
  categoryId: z.string().nullable(),
  type: z.enum(["general", "shift"]),
  shiftId: z.string().nullable(),
  createdAt: z.string()
});

export const insertMeCommandSchema = z.object({
  text: z.string().min(1, "Texto do comando é obrigatório"),
  categoryId: z.string().nullable(),
  type: z.enum(["general", "shift"]),
  shiftId: z.string().nullable()
});

export type MeCommand = z.infer<typeof meCommandSchema>;
export type InsertMeCommand = z.infer<typeof insertMeCommandSchema>;

// Auth Response
export const authResponseSchema = z.object({
  success: z.boolean(),
  user: userSchema.optional(),
  message: z.string().optional()
});

export type AuthResponse = z.infer<typeof authResponseSchema>;

// Password Validation
export const passwordValidationSchema = z.object({
  shiftId: z.string(),
  password: z.string()
});

export type PasswordValidation = z.infer<typeof passwordValidationSchema>;

// Attendance (Chamada) Schema
export const attendanceRecordSchema = z.object({
  id: z.string(),
  userId: z.string(),
  shiftId: z.string(),
  date: z.string(),
  status: z.enum(["presente", "faltou"]),
  notes: z.string().optional(),
  createdAt: z.string(),
  createdBy: z.string()
});

export const insertAttendanceRecordSchema = z.object({
  userId: z.string(),
  shiftId: z.string(),
  date: z.string(),
  status: z.enum(["presente", "faltou"]),
  notes: z.string().optional(),
  createdBy: z.string()
});

export type AttendanceRecord = z.infer<typeof attendanceRecordSchema>;
export type InsertAttendanceRecord = z.infer<typeof insertAttendanceRecordSchema>;

// Warning (Advertência) Schema
export enum WarningOccurrenceType {
  TURNO_PADRAO = "turno_padrao",
  TURNO_EXTRA = "turno_extra",
  FORA_TURNO = "fora_turno"
}

export const warningSchema = z.object({
  id: z.string(),
  userId: z.string(),
  issuedBy: z.string(),
  shiftId: z.string().nullable(),
  reason: z.string(),
  occurrenceType: z.nativeEnum(WarningOccurrenceType),
  occurrenceDate: z.string(),
  notes: z.string().optional(),
  createdAt: z.string()
});

export const insertWarningSchema = z.object({
  userId: z.string(),
  issuedBy: z.string(),
  shiftId: z.string().nullable(),
  reason: z.string().min(1, "Motivo é obrigatório"),
  occurrenceType: z.nativeEnum(WarningOccurrenceType),
  occurrenceDate: z.string(),
  notes: z.string().optional()
});

export type Warning = z.infer<typeof warningSchema>;
export type InsertWarning = z.infer<typeof insertWarningSchema>;

// Promotion Schema
export const promotionSchema = z.object({
  id: z.string(),
  userId: z.string(),
  promotedBy: z.string(),
  fromRole: z.nativeEnum(UserRole),
  toRole: z.nativeEnum(UserRole),
  shiftId: z.string().nullable(),
  notes: z.string().optional(),
  madeChiefSurgeon: z.boolean().default(false),
  wasChiefSurgeon: z.boolean().default(false),
  createdAt: z.string()
});

export const insertPromotionSchema = z.object({
  userId: z.string(),
  promotedBy: z.string(),
  fromRole: z.nativeEnum(UserRole),
  toRole: z.nativeEnum(UserRole),
  shiftId: z.string().nullable(),
  notes: z.string().optional(),
  madeChiefSurgeon: z.boolean().optional().default(false),
  wasChiefSurgeon: z.boolean().optional().default(false)
});

export type Promotion = z.infer<typeof promotionSchema>;
export type InsertPromotion = z.infer<typeof insertPromotionSchema>;

// Log Schema
export enum LogAction {
  LOGIN = "login",
  LOGOUT = "logout",
  CREATE_USER = "create_user",
  UPDATE_USER = "update_user",
  DELETE_USER = "delete_user",
  PROMOTE_USER = "promote_user",
  DEMOTE_USER = "demote_user",
  CREATE_WARNING = "create_warning",
  DELETE_WARNING = "delete_warning",
  CREATE_ATTENDANCE = "create_attendance",
  UPDATE_ATTENDANCE = "update_attendance",
  DELETE_ATTENDANCE = "delete_attendance",
  CREATE_COVENANT = "create_covenant",
  UPDATE_COVENANT = "update_covenant",
  DELETE_COVENANT = "delete_covenant",
  CREATE_RULE = "create_rule",
  UPDATE_RULE = "update_rule",
  DELETE_RULE = "delete_rule",
  CREATE_ME_COMMAND = "create_me_command",
  UPDATE_ME_COMMAND = "update_me_command",
  DELETE_ME_COMMAND = "delete_me_command",
  CREATE_ME_CATEGORY = "create_me_category",
  UPDATE_ME_CATEGORY = "update_me_category",
  DELETE_ME_CATEGORY = "delete_me_category",
  CREATE_SHIFT = "create_shift",
  UPDATE_SHIFT = "update_shift",
  DELETE_SHIFT = "delete_shift",
  EXONERATE_USER = "exonerate_user"
}

export const logSchema = z.object({
  id: z.string(),
  action: z.nativeEnum(LogAction),
  userId: z.string(),
  targetUserId: z.string().optional(),
  shiftId: z.string().nullable(),
  details: z.string().optional(),
  metadata: z.record(z.any()).optional(),
  createdAt: z.string()
});

export const insertLogSchema = z.object({
  action: z.nativeEnum(LogAction),
  userId: z.string(),
  targetUserId: z.string().optional(),
  shiftId: z.string().nullable(),
  details: z.string().optional(),
  metadata: z.record(z.any()).optional()
});

export type Log = z.infer<typeof logSchema>;
export type InsertLog = z.infer<typeof insertLogSchema>;
