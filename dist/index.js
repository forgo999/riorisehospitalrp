// server/index.ts
import express2 from "express";
import cors from "cors";

// server/routes.ts
import { createServer } from "http";

// server/storage.ts
import { randomUUID } from "crypto";
import fs from "fs/promises";
import path from "path";
var DATA_DIR = path.join(process.cwd(), "data");
var USERS_FILE = path.join(DATA_DIR, "users.json");
var SHIFTS_FILE = path.join(DATA_DIR, "shifts.json");
var COVENANTS_FILE = path.join(DATA_DIR, "covenants.json");
var RULES_FILE = path.join(DATA_DIR, "rules.json");
var ME_COMMANDS_FILE = path.join(DATA_DIR, "me-commands.json");
async function ensureDataDir() {
  try {
    await fs.access(DATA_DIR);
  } catch {
    await fs.mkdir(DATA_DIR, { recursive: true });
  }
}
async function readJSONFile(filePath, defaultValue) {
  try {
    const data = await fs.readFile(filePath, "utf-8");
    return JSON.parse(data);
  } catch {
    return defaultValue;
  }
}
async function writeJSONFile(filePath, data) {
  await ensureDataDir();
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), "utf-8");
}
var FileStorage = class {
  // Users
  async getUser(id) {
    const users = await readJSONFile(USERS_FILE, []);
    return users.find((u) => u.id === id);
  }
  async getUserByAccessCode(accessCode) {
    const users = await readJSONFile(USERS_FILE, []);
    return users.find((u) => u.accessCode === accessCode);
  }
  async getAllUsers() {
    return readJSONFile(USERS_FILE, []);
  }
  async getUsersByShift(shiftId) {
    const users = await readJSONFile(USERS_FILE, []);
    return users.filter((u) => u.shiftId === shiftId);
  }
  async createUser(insertUser) {
    const users = await readJSONFile(USERS_FILE, []);
    const user = { ...insertUser, id: randomUUID() };
    users.push(user);
    await writeJSONFile(USERS_FILE, users);
    return user;
  }
  async updateUser(id, updates) {
    const users = await readJSONFile(USERS_FILE, []);
    const index = users.findIndex((u) => u.id === id);
    if (index === -1) return void 0;
    users[index] = { ...users[index], ...updates };
    await writeJSONFile(USERS_FILE, users);
    return users[index];
  }
  async deleteUser(id) {
    const users = await readJSONFile(USERS_FILE, []);
    const filtered = users.filter((u) => u.id !== id);
    if (filtered.length === users.length) return false;
    await writeJSONFile(USERS_FILE, filtered);
    return true;
  }
  // Shifts
  async getShift(id) {
    const shifts = await readJSONFile(SHIFTS_FILE, []);
    return shifts.find((s) => s.id === id);
  }
  async getAllShifts() {
    return readJSONFile(SHIFTS_FILE, []);
  }
  async createShift(insertShift) {
    const shifts = await readJSONFile(SHIFTS_FILE, []);
    const shift = {
      ...insertShift,
      id: randomUUID(),
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    shifts.push(shift);
    await writeJSONFile(SHIFTS_FILE, shifts);
    return shift;
  }
  async updateShift(id, updates) {
    const shifts = await readJSONFile(SHIFTS_FILE, []);
    const index = shifts.findIndex((s) => s.id === id);
    if (index === -1) return void 0;
    shifts[index] = { ...shifts[index], ...updates };
    await writeJSONFile(SHIFTS_FILE, shifts);
    return shifts[index];
  }
  async deleteShift(id) {
    const shifts = await readJSONFile(SHIFTS_FILE, []);
    const filtered = shifts.filter((s) => s.id !== id);
    if (filtered.length === shifts.length) return false;
    await writeJSONFile(SHIFTS_FILE, filtered);
    return true;
  }
  async validateShiftPassword(shiftId, password) {
    const shift = await this.getShift(shiftId);
    return shift?.password === password;
  }
  // Covenants
  async getCovenant(id) {
    const covenants = await readJSONFile(COVENANTS_FILE, []);
    return covenants.find((c) => c.id === id);
  }
  async getAllCovenants() {
    return readJSONFile(COVENANTS_FILE, []);
  }
  async createCovenant(insertCovenant) {
    const covenants = await readJSONFile(COVENANTS_FILE, []);
    const startDate = /* @__PURE__ */ new Date();
    const days = insertCovenant.amountPaid / 4e3 * 30;
    const totalSeconds = Math.floor(days * 24 * 60 * 60);
    const endDate = new Date(startDate.getTime() + totalSeconds * 1e3);
    const covenant = {
      id: randomUUID(),
      organizationName: insertCovenant.organizationName,
      amountPaid: insertCovenant.amountPaid,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      totalSeconds,
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    covenants.push(covenant);
    await writeJSONFile(COVENANTS_FILE, covenants);
    return covenant;
  }
  async updateCovenant(id, updates) {
    const covenants = await readJSONFile(COVENANTS_FILE, []);
    const index = covenants.findIndex((c) => c.id === id);
    if (index === -1) return void 0;
    covenants[index] = { ...covenants[index], ...updates };
    await writeJSONFile(COVENANTS_FILE, covenants);
    return covenants[index];
  }
  async deleteCovenant(id) {
    const covenants = await readJSONFile(COVENANTS_FILE, []);
    const filtered = covenants.filter((c) => c.id !== id);
    if (filtered.length === covenants.length) return false;
    await writeJSONFile(COVENANTS_FILE, filtered);
    return true;
  }
  // Rules
  async getRule(id) {
    const rules = await readJSONFile(RULES_FILE, []);
    return rules.find((r) => r.id === id);
  }
  async getAllRules() {
    return readJSONFile(RULES_FILE, []);
  }
  async getRulesByType(type) {
    const rules = await readJSONFile(RULES_FILE, []);
    return rules.filter((r) => r.type === type);
  }
  async getRulesByShift(shiftId) {
    const rules = await readJSONFile(RULES_FILE, []);
    return rules.filter((r) => r.shiftId === shiftId);
  }
  async createRule(insertRule) {
    const rules = await readJSONFile(RULES_FILE, []);
    const now = (/* @__PURE__ */ new Date()).toISOString();
    const rule = {
      id: randomUUID(),
      ...insertRule,
      createdAt: now,
      updatedAt: now
    };
    rules.push(rule);
    await writeJSONFile(RULES_FILE, rules);
    return rule;
  }
  async updateRule(id, updates) {
    const rules = await readJSONFile(RULES_FILE, []);
    const index = rules.findIndex((r) => r.id === id);
    if (index === -1) return void 0;
    rules[index] = {
      ...rules[index],
      ...updates,
      updatedAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    await writeJSONFile(RULES_FILE, rules);
    return rules[index];
  }
  async deleteRule(id) {
    const rules = await readJSONFile(RULES_FILE, []);
    const filtered = rules.filter((r) => r.id !== id);
    if (filtered.length === rules.length) return false;
    await writeJSONFile(RULES_FILE, filtered);
    return true;
  }
  // Me Commands
  async getMeCommand(id) {
    const commands = await readJSONFile(ME_COMMANDS_FILE, []);
    return commands.find((c) => c.id === id);
  }
  async getAllMeCommands() {
    return readJSONFile(ME_COMMANDS_FILE, []);
  }
  async getMeCommandsByType(type) {
    const commands = await readJSONFile(ME_COMMANDS_FILE, []);
    return commands.filter((c) => c.type === type);
  }
  async getMeCommandsByShift(shiftId) {
    const commands = await readJSONFile(ME_COMMANDS_FILE, []);
    return commands.filter((c) => c.shiftId === shiftId);
  }
  async createMeCommand(insertCommand) {
    const commands = await readJSONFile(ME_COMMANDS_FILE, []);
    const command = {
      id: randomUUID(),
      ...insertCommand,
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    commands.push(command);
    await writeJSONFile(ME_COMMANDS_FILE, commands);
    return command;
  }
  async updateMeCommand(id, updates) {
    const commands = await readJSONFile(ME_COMMANDS_FILE, []);
    const index = commands.findIndex((c) => c.id === id);
    if (index === -1) return void 0;
    commands[index] = { ...commands[index], ...updates };
    await writeJSONFile(ME_COMMANDS_FILE, commands);
    return commands[index];
  }
  async deleteMeCommand(id) {
    const commands = await readJSONFile(ME_COMMANDS_FILE, []);
    const filtered = commands.filter((c) => c.id !== id);
    if (filtered.length === commands.length) return false;
    await writeJSONFile(ME_COMMANDS_FILE, filtered);
    return true;
  }
};
var storage = new FileStorage();

// shared/schema.ts
import { z } from "zod";
var UserRole = /* @__PURE__ */ ((UserRole2) => {
  UserRole2["MEMBRO"] = "membro";
  UserRole2["TERAPEUTA"] = "terapeuta";
  UserRole2["CIRURGIAO"] = "cirurgiao";
  UserRole2["VICE_DIRETOR"] = "vice_diretor";
  UserRole2["DIRETOR"] = "diretor";
  UserRole2["ADMINISTRADOR"] = "administrador";
  return UserRole2;
})(UserRole || {});
var userSchema = z.object({
  id: z.string(),
  accessCode: z.string(),
  name: z.string(),
  role: z.nativeEnum(UserRole),
  shiftId: z.string().nullable(),
  narniaName: z.string().optional(),
  phone: z.string().optional()
});
var insertUserSchema = userSchema.omit({ id: true });
var shiftSchema = z.object({
  id: z.string(),
  name: z.string(),
  viceDirectorId: z.string(),
  password: z.string(),
  createdAt: z.string()
});
var insertShiftSchema = shiftSchema.omit({ id: true, createdAt: true });
var covenantSchema = z.object({
  id: z.string(),
  organizationName: z.string(),
  amountPaid: z.number(),
  startDate: z.string(),
  endDate: z.string(),
  totalSeconds: z.number(),
  createdAt: z.string()
});
var insertCovenantSchema = z.object({
  organizationName: z.string().min(1, "Nome da organiza\xE7\xE3o \xE9 obrigat\xF3rio"),
  amountPaid: z.number().min(1, "Valor deve ser maior que zero")
});
var ruleSchema = z.object({
  id: z.string(),
  title: z.string(),
  content: z.string(),
  type: z.enum(["general", "shift"]),
  shiftId: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string()
});
var insertRuleSchema = z.object({
  title: z.string().min(1, "T\xEDtulo \xE9 obrigat\xF3rio"),
  content: z.string().min(1, "Conte\xFAdo \xE9 obrigat\xF3rio"),
  type: z.enum(["general", "shift"]),
  shiftId: z.string().nullable()
});
var meCommandSchema = z.object({
  id: z.string(),
  text: z.string(),
  type: z.enum(["general", "shift"]),
  shiftId: z.string().nullable(),
  createdAt: z.string()
});
var insertMeCommandSchema = z.object({
  text: z.string().min(1, "Texto do comando \xE9 obrigat\xF3rio"),
  type: z.enum(["general", "shift"]),
  shiftId: z.string().nullable()
});
var authResponseSchema = z.object({
  success: z.boolean(),
  user: userSchema.optional(),
  message: z.string().optional()
});
var passwordValidationSchema = z.object({
  shiftId: z.string(),
  password: z.string()
});

// server/routes.ts
async function registerRoutes(app2) {
  app2.post("/api/auth/login", async (req, res) => {
    try {
      const { accessCode } = req.body;
      if (!accessCode) {
        return res.status(400).json({ success: false, message: "C\xF3digo de acesso \xE9 obrigat\xF3rio" });
      }
      const user = await storage.getUserByAccessCode(accessCode);
      if (!user) {
        return res.status(401).json({ success: false, message: "C\xF3digo de acesso inv\xE1lido" });
      }
      res.json({ success: true, user });
    } catch (error) {
      res.status(500).json({ success: false, message: "Erro ao fazer login" });
    }
  });
  app2.post("/api/auth/validate-password", async (req, res) => {
    try {
      const { shiftId, password } = passwordValidationSchema.parse(req.body);
      if (shiftId === "general") {
        return res.json({ valid: password === "admin123" });
      }
      const isValid = await storage.validateShiftPassword(shiftId, password);
      res.json({ valid: isValid });
    } catch (error) {
      res.status(400).json({ valid: false, message: "Dados inv\xE1lidos" });
    }
  });
  app2.get("/api/users", async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      res.status(500).json({ message: "Erro ao buscar usu\xE1rios" });
    }
  });
  app2.get("/api/users/shift/:shiftId", async (req, res) => {
    try {
      const { shiftId } = req.params;
      const users = await storage.getUsersByShift(shiftId);
      res.json(users);
    } catch (error) {
      res.status(500).json({ message: "Erro ao buscar usu\xE1rios do turno" });
    }
  });
  app2.post("/api/users", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const user = await storage.createUser(userData);
      res.status(201).json(user);
    } catch (error) {
      res.status(400).json({ message: "Dados inv\xE1lidos" });
    }
  });
  app2.patch("/api/users/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const user = await storage.updateUser(id, req.body);
      if (!user) {
        return res.status(404).json({ message: "Usu\xE1rio n\xE3o encontrado" });
      }
      res.json(user);
    } catch (error) {
      res.status(400).json({ message: "Erro ao atualizar usu\xE1rio" });
    }
  });
  app2.delete("/api/users/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteUser(id);
      if (!deleted) {
        return res.status(404).json({ message: "Usu\xE1rio n\xE3o encontrado" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Erro ao deletar usu\xE1rio" });
    }
  });
  app2.get("/api/shifts", async (req, res) => {
    try {
      const shifts = await storage.getAllShifts();
      res.json(shifts);
    } catch (error) {
      res.status(500).json({ message: "Erro ao buscar turnos" });
    }
  });
  app2.get("/api/shifts/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const shift = await storage.getShift(id);
      if (!shift) {
        return res.status(404).json({ message: "Turno n\xE3o encontrado" });
      }
      res.json(shift);
    } catch (error) {
      res.status(500).json({ message: "Erro ao buscar turno" });
    }
  });
  app2.post("/api/shifts", async (req, res) => {
    try {
      const shiftData = insertShiftSchema.parse(req.body);
      const shift = await storage.createShift(shiftData);
      res.status(201).json(shift);
    } catch (error) {
      res.status(400).json({ message: "Dados inv\xE1lidos" });
    }
  });
  app2.patch("/api/shifts/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const shift = await storage.updateShift(id, req.body);
      if (!shift) {
        return res.status(404).json({ message: "Turno n\xE3o encontrado" });
      }
      res.json(shift);
    } catch (error) {
      res.status(400).json({ message: "Erro ao atualizar turno" });
    }
  });
  app2.delete("/api/shifts/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteShift(id);
      if (!deleted) {
        return res.status(404).json({ message: "Turno n\xE3o encontrado" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Erro ao deletar turno" });
    }
  });
  app2.get("/api/covenants", async (req, res) => {
    try {
      const covenants = await storage.getAllCovenants();
      res.json(covenants);
    } catch (error) {
      res.status(500).json({ message: "Erro ao buscar conv\xEAnios" });
    }
  });
  app2.get("/api/covenants/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const covenant = await storage.getCovenant(id);
      if (!covenant) {
        return res.status(404).json({ message: "Conv\xEAnio n\xE3o encontrado" });
      }
      res.json(covenant);
    } catch (error) {
      res.status(500).json({ message: "Erro ao buscar conv\xEAnio" });
    }
  });
  app2.post("/api/covenants", async (req, res) => {
    try {
      const covenantData = insertCovenantSchema.parse(req.body);
      const covenant = await storage.createCovenant(covenantData);
      res.status(201).json(covenant);
    } catch (error) {
      res.status(400).json({ message: "Dados inv\xE1lidos" });
    }
  });
  app2.patch("/api/covenants/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const covenant = await storage.updateCovenant(id, req.body);
      if (!covenant) {
        return res.status(404).json({ message: "Conv\xEAnio n\xE3o encontrado" });
      }
      res.json(covenant);
    } catch (error) {
      res.status(400).json({ message: "Erro ao atualizar conv\xEAnio" });
    }
  });
  app2.delete("/api/covenants/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteCovenant(id);
      if (!deleted) {
        return res.status(404).json({ message: "Conv\xEAnio n\xE3o encontrado" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Erro ao deletar conv\xEAnio" });
    }
  });
  app2.get("/api/rules", async (req, res) => {
    try {
      const rules = await storage.getAllRules();
      res.json(rules);
    } catch (error) {
      res.status(500).json({ message: "Erro ao buscar regras" });
    }
  });
  app2.get("/api/rules/general", async (req, res) => {
    try {
      const rules = await storage.getRulesByType("general");
      res.json(rules);
    } catch (error) {
      res.status(500).json({ message: "Erro ao buscar regras gerais" });
    }
  });
  app2.get("/api/rules/shift/:shiftId", async (req, res) => {
    try {
      const { shiftId } = req.params;
      const rules = await storage.getRulesByShift(shiftId);
      res.json(rules);
    } catch (error) {
      res.status(500).json({ message: "Erro ao buscar regras do turno" });
    }
  });
  app2.post("/api/rules", async (req, res) => {
    try {
      const ruleData = insertRuleSchema.parse(req.body);
      const rule = await storage.createRule(ruleData);
      res.status(201).json(rule);
    } catch (error) {
      res.status(400).json({ message: "Dados inv\xE1lidos" });
    }
  });
  app2.patch("/api/rules/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const rule = await storage.updateRule(id, req.body);
      if (!rule) {
        return res.status(404).json({ message: "Regra n\xE3o encontrada" });
      }
      res.json(rule);
    } catch (error) {
      res.status(400).json({ message: "Erro ao atualizar regra" });
    }
  });
  app2.delete("/api/rules/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteRule(id);
      if (!deleted) {
        return res.status(404).json({ message: "Regra n\xE3o encontrada" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Erro ao deletar regra" });
    }
  });
  app2.get("/api/me-commands", async (req, res) => {
    try {
      const commands = await storage.getAllMeCommands();
      res.json(commands);
    } catch (error) {
      res.status(500).json({ message: "Erro ao buscar comandos" });
    }
  });
  app2.get("/api/me-commands/general", async (req, res) => {
    try {
      const commands = await storage.getMeCommandsByType("general");
      res.json(commands);
    } catch (error) {
      res.status(500).json({ message: "Erro ao buscar comandos gerais" });
    }
  });
  app2.get("/api/me-commands/shift/:shiftId", async (req, res) => {
    try {
      const { shiftId } = req.params;
      const commands = await storage.getMeCommandsByShift(shiftId);
      res.json(commands);
    } catch (error) {
      res.status(500).json({ message: "Erro ao buscar comandos do turno" });
    }
  });
  app2.post("/api/me-commands", async (req, res) => {
    try {
      const commandData = insertMeCommandSchema.parse(req.body);
      const command = await storage.createMeCommand(commandData);
      res.status(201).json(command);
    } catch (error) {
      res.status(400).json({ message: "Dados inv\xE1lidos" });
    }
  });
  app2.patch("/api/me-commands/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const command = await storage.updateMeCommand(id, req.body);
      if (!command) {
        return res.status(404).json({ message: "Comando n\xE3o encontrado" });
      }
      res.json(command);
    } catch (error) {
      res.status(400).json({ message: "Erro ao atualizar comando" });
    }
  });
  app2.delete("/api/me-commands/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteMeCommand(id);
      if (!deleted) {
        return res.status(404).json({ message: "Comando n\xE3o encontrado" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Erro ao deletar comando" });
    }
  });
  const httpServer = createServer(app2);
  return httpServer;
}

// server/vite.ts
import express from "express";
import fs2 from "fs";
import path3 from "path";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path2 from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      await import("@replit/vite-plugin-cartographer").then(
        (m) => m.cartographer()
      ),
      await import("@replit/vite-plugin-dev-banner").then(
        (m) => m.devBanner()
      )
    ] : []
  ],
  resolve: {
    alias: {
      "@": path2.resolve(import.meta.dirname, "client", "src"),
      "@shared": path2.resolve(import.meta.dirname, "shared"),
      "@assets": path2.resolve(import.meta.dirname, "attached_assets")
    }
  },
  root: path2.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path2.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true
  },
  server: {
    host: "0.0.0.0",
    port: 5173,
    strictPort: false,
    fs: {
      strict: true,
      deny: ["**/.*"]
    }
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path3.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html"
      );
      let template = await fs2.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path3.resolve(import.meta.dirname, "public");
  if (!fs2.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path3.resolve(distPath, "index.html"));
  });
}

// server/index.ts
var app = express2();
app.use(cors({
  origin: process.env.NODE_ENV === "production" ? [
    process.env.FRONTEND_URL || "https://seu-app.netlify.app",
    /\.netlify\.app$/
  ] : ["http://localhost:5000", "http://127.0.0.1:5000"],
  credentials: true
}));
app.use(express2.json());
app.use(express2.urlencoded({ extended: false }));
app.use((req, res, next) => {
  const start = Date.now();
  const path4 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path4.startsWith("/api")) {
      let logLine = `${req.method} ${path4} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const port = parseInt(process.env.PORT || "5000", 10);
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true
  }, () => {
    log(`serving on port ${port}`);
  });
})();
