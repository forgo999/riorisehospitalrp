import { z } from "zod";

// User Roles
export enum UserRole {
  MEMBRO = "membro",
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
  narniaName: z.string().optional(),
  phone: z.string().optional()
});

export const insertUserSchema = userSchema.omit({ id: true });

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

// /me Command Schema
export const meCommandSchema = z.object({
  id: z.string(),
  text: z.string(),
  type: z.enum(["general", "shift"]),
  shiftId: z.string().nullable(),
  createdAt: z.string()
});

export const insertMeCommandSchema = z.object({
  text: z.string().min(1, "Texto do comando é obrigatório"),
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
