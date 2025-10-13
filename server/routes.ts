import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { 
  insertUserSchema,
  insertShiftSchema,
  insertCovenantSchema,
  insertRuleSchema,
  insertMeCommandSchema,
  passwordValidationSchema,
  insertAttendanceRecordSchema,
  insertWarningSchema
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Auth Routes
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { accessCode } = req.body;
      
      if (!accessCode) {
        return res.status(400).json({ success: false, message: "Código de acesso é obrigatório" });
      }

      const user = await storage.getUserByAccessCode(accessCode);
      
      if (!user) {
        return res.status(401).json({ success: false, message: "Código de acesso inválido" });
      }

      res.json({ success: true, user });
    } catch (error) {
      res.status(500).json({ success: false, message: "Erro ao fazer login" });
    }
  });

  app.post("/api/auth/validate-password", async (req, res) => {
    try {
      const { shiftId, password } = passwordValidationSchema.parse(req.body);
      
      if (shiftId === "general") {
        return res.json({ valid: password === "admin123" });
      }

      const isValid = await storage.validateShiftPassword(shiftId, password);
      res.json({ valid: isValid });
    } catch (error) {
      res.status(400).json({ valid: false, message: "Dados inválidos" });
    }
  });

  // User Routes
  app.get("/api/users", async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      res.status(500).json({ message: "Erro ao buscar usuários" });
    }
  });

  app.get("/api/users/shift/:shiftId", async (req, res) => {
    try {
      const { shiftId } = req.params;
      const users = await storage.getUsersByShift(shiftId);
      res.json(users);
    } catch (error) {
      res.status(500).json({ message: "Erro ao buscar usuários do turno" });
    }
  });

  app.post("/api/users", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const user = await storage.createUser(userData);
      res.status(201).json(user);
    } catch (error) {
      res.status(400).json({ message: "Dados inválidos" });
    }
  });

  app.patch("/api/users/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const user = await storage.updateUser(id, req.body);
      
      if (!user) {
        return res.status(404).json({ message: "Usuário não encontrado" });
      }

      res.json(user);
    } catch (error) {
      res.status(400).json({ message: "Erro ao atualizar usuário" });
    }
  });

  app.delete("/api/users/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteUser(id);
      
      if (!deleted) {
        return res.status(404).json({ message: "Usuário não encontrado" });
      }

      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Erro ao deletar usuário" });
    }
  });

  // Shift Routes
  app.get("/api/shifts", async (req, res) => {
    try {
      const shifts = await storage.getAllShifts();
      res.json(shifts);
    } catch (error) {
      res.status(500).json({ message: "Erro ao buscar turnos" });
    }
  });

  app.get("/api/shifts/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const shift = await storage.getShift(id);
      
      if (!shift) {
        return res.status(404).json({ message: "Turno não encontrado" });
      }

      res.json(shift);
    } catch (error) {
      res.status(500).json({ message: "Erro ao buscar turno" });
    }
  });

  app.post("/api/shifts", async (req, res) => {
    try {
      const shiftData = insertShiftSchema.parse(req.body);
      const shift = await storage.createShift(shiftData);
      res.status(201).json(shift);
    } catch (error) {
      res.status(400).json({ message: "Dados inválidos" });
    }
  });

  app.patch("/api/shifts/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const shift = await storage.updateShift(id, req.body);
      
      if (!shift) {
        return res.status(404).json({ message: "Turno não encontrado" });
      }

      res.json(shift);
    } catch (error) {
      res.status(400).json({ message: "Erro ao atualizar turno" });
    }
  });

  app.delete("/api/shifts/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteShift(id);
      
      if (!deleted) {
        return res.status(404).json({ message: "Turno não encontrado" });
      }

      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Erro ao deletar turno" });
    }
  });

  // Covenant Routes
  app.get("/api/covenants", async (req, res) => {
    try {
      const covenants = await storage.getAllCovenants();
      res.json(covenants);
    } catch (error) {
      res.status(500).json({ message: "Erro ao buscar convênios" });
    }
  });

  app.get("/api/covenants/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const covenant = await storage.getCovenant(id);
      
      if (!covenant) {
        return res.status(404).json({ message: "Convênio não encontrado" });
      }

      res.json(covenant);
    } catch (error) {
      res.status(500).json({ message: "Erro ao buscar convênio" });
    }
  });

  app.post("/api/covenants", async (req, res) => {
    try {
      const covenantData = insertCovenantSchema.parse(req.body);
      const covenant = await storage.createCovenant(covenantData);
      res.status(201).json(covenant);
    } catch (error) {
      res.status(400).json({ message: "Dados inválidos" });
    }
  });

  app.patch("/api/covenants/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const covenant = await storage.updateCovenant(id, req.body);
      
      if (!covenant) {
        return res.status(404).json({ message: "Convênio não encontrado" });
      }

      res.json(covenant);
    } catch (error) {
      res.status(400).json({ message: "Erro ao atualizar convênio" });
    }
  });

  app.delete("/api/covenants/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteCovenant(id);
      
      if (!deleted) {
        return res.status(404).json({ message: "Convênio não encontrado" });
      }

      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Erro ao deletar convênio" });
    }
  });

  // Rule Routes
  app.get("/api/rules", async (req, res) => {
    try {
      const rules = await storage.getAllRules();
      res.json(rules);
    } catch (error) {
      res.status(500).json({ message: "Erro ao buscar regras" });
    }
  });

  app.get("/api/rules/general", async (req, res) => {
    try {
      const rules = await storage.getRulesByType("general");
      res.json(rules);
    } catch (error) {
      res.status(500).json({ message: "Erro ao buscar regras gerais" });
    }
  });

  app.get("/api/rules/shift/:shiftId", async (req, res) => {
    try {
      const { shiftId } = req.params;
      const rules = await storage.getRulesByShift(shiftId);
      res.json(rules);
    } catch (error) {
      res.status(500).json({ message: "Erro ao buscar regras do turno" });
    }
  });

  app.post("/api/rules", async (req, res) => {
    try {
      const ruleData = insertRuleSchema.parse(req.body);
      const rule = await storage.createRule(ruleData);
      res.status(201).json(rule);
    } catch (error) {
      res.status(400).json({ message: "Dados inválidos" });
    }
  });

  app.patch("/api/rules/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const rule = await storage.updateRule(id, req.body);
      
      if (!rule) {
        return res.status(404).json({ message: "Regra não encontrada" });
      }

      res.json(rule);
    } catch (error) {
      res.status(400).json({ message: "Erro ao atualizar regra" });
    }
  });

  app.delete("/api/rules/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteRule(id);
      
      if (!deleted) {
        return res.status(404).json({ message: "Regra não encontrada" });
      }

      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Erro ao deletar regra" });
    }
  });

  // Me Command Routes
  app.get("/api/me-commands", async (req, res) => {
    try {
      const commands = await storage.getAllMeCommands();
      res.json(commands);
    } catch (error) {
      res.status(500).json({ message: "Erro ao buscar comandos" });
    }
  });

  app.get("/api/me-commands/general", async (req, res) => {
    try {
      const commands = await storage.getMeCommandsByType("general");
      res.json(commands);
    } catch (error) {
      res.status(500).json({ message: "Erro ao buscar comandos gerais" });
    }
  });

  app.get("/api/me-commands/shift/:shiftId", async (req, res) => {
    try {
      const { shiftId } = req.params;
      const commands = await storage.getMeCommandsByShift(shiftId);
      res.json(commands);
    } catch (error) {
      res.status(500).json({ message: "Erro ao buscar comandos do turno" });
    }
  });

  app.post("/api/me-commands", async (req, res) => {
    try {
      const commandData = insertMeCommandSchema.parse(req.body);
      const command = await storage.createMeCommand(commandData);
      res.status(201).json(command);
    } catch (error) {
      res.status(400).json({ message: "Dados inválidos" });
    }
  });

  app.patch("/api/me-commands/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const command = await storage.updateMeCommand(id, req.body);
      
      if (!command) {
        return res.status(404).json({ message: "Comando não encontrado" });
      }

      res.json(command);
    } catch (error) {
      res.status(400).json({ message: "Erro ao atualizar comando" });
    }
  });

  app.delete("/api/me-commands/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteMeCommand(id);
      
      if (!deleted) {
        return res.status(404).json({ message: "Comando não encontrado" });
      }

      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Erro ao deletar comando" });
    }
  });

  // Attendance Routes
  app.get("/api/attendance", async (req, res) => {
    try {
      const records = await storage.getAllAttendanceRecords();
      res.json(records);
    } catch (error) {
      res.status(500).json({ message: "Erro ao buscar registros de chamada" });
    }
  });

  app.get("/api/attendance/shift/:shiftId", async (req, res) => {
    try {
      const { shiftId } = req.params;
      const records = await storage.getAttendanceByShift(shiftId);
      res.json(records);
    } catch (error) {
      res.status(500).json({ message: "Erro ao buscar registros do turno" });
    }
  });

  app.get("/api/attendance/shift/:shiftId/date/:date", async (req, res) => {
    try {
      const { shiftId, date } = req.params;
      const records = await storage.getAttendanceByShiftAndDate(shiftId, date);
      res.json(records);
    } catch (error) {
      res.status(500).json({ message: "Erro ao buscar registros da data" });
    }
  });

  app.get("/api/attendance/user/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const records = await storage.getAttendanceByUser(userId);
      res.json(records);
    } catch (error) {
      res.status(500).json({ message: "Erro ao buscar registros do usuário" });
    }
  });

  app.post("/api/attendance", async (req, res) => {
    try {
      const recordData = insertAttendanceRecordSchema.parse(req.body);
      const record = await storage.createAttendanceRecord(recordData);
      res.status(201).json(record);
    } catch (error) {
      res.status(400).json({ message: "Dados inválidos" });
    }
  });

  app.patch("/api/attendance/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const record = await storage.updateAttendanceRecord(id, req.body);
      
      if (!record) {
        return res.status(404).json({ message: "Registro não encontrado" });
      }

      res.json(record);
    } catch (error) {
      res.status(400).json({ message: "Erro ao atualizar registro" });
    }
  });

  app.delete("/api/attendance/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteAttendanceRecord(id);
      
      if (!deleted) {
        return res.status(404).json({ message: "Registro não encontrado" });
      }

      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Erro ao deletar registro" });
    }
  });

  // Warning Routes
  app.get("/api/warnings", async (req, res) => {
    try {
      const warnings = await storage.getAllWarnings();
      res.json(warnings);
    } catch (error) {
      res.status(500).json({ message: "Erro ao buscar advertências" });
    }
  });

  app.get("/api/warnings/user/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const warnings = await storage.getWarningsByUser(userId);
      res.json(warnings);
    } catch (error) {
      res.status(500).json({ message: "Erro ao buscar advertências do usuário" });
    }
  });

  app.get("/api/warnings/shift/:shiftId", async (req, res) => {
    try {
      const { shiftId } = req.params;
      const warnings = await storage.getWarningsByShift(shiftId);
      res.json(warnings);
    } catch (error) {
      res.status(500).json({ message: "Erro ao buscar advertências do turno" });
    }
  });

  app.post("/api/warnings", async (req, res) => {
    try {
      const warningData = insertWarningSchema.parse(req.body);
      const warning = await storage.createWarning(warningData);
      res.status(201).json(warning);
    } catch (error) {
      res.status(400).json({ message: "Dados inválidos" });
    }
  });

  app.patch("/api/warnings/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const warning = await storage.updateWarning(id, req.body);
      
      if (!warning) {
        return res.status(404).json({ message: "Advertência não encontrada" });
      }

      res.json(warning);
    } catch (error) {
      res.status(400).json({ message: "Erro ao atualizar advertência" });
    }
  });

  app.delete("/api/warnings/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteWarning(id);
      
      if (!deleted) {
        return res.status(404).json({ message: "Advertência não encontrada" });
      }

      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Erro ao deletar advertência" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
