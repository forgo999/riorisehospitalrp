import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./db/mongoStorage";
import { z } from "zod";
import { 
  insertUserSchema,
  insertShiftSchema,
  insertCovenantSchema,
  insertRuleSchema,
  insertMeCommandSchema,
  passwordValidationSchema,
  insertAttendanceRecordSchema,
  insertWarningSchema,
  insertMeCategorySchema,
  insertPromotionSchema,
  insertLogSchema,
  UserRole,
  LogAction
} from "@shared/schema";
import { 
  requireAuth, 
  requireRole, 
  requireAdminOrDirector, 
  requireShiftAccessOrAdmin,
  canPromoteToRole,
  canManageUser,
  type AuthRequest 
} from "./middleware/auth";

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

      await storage.createLog({
        action: LogAction.LOGIN,
        userId: user.id,
        shiftId: user.shiftId,
        details: `Login realizado`
      });

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
      
      if (req.body.createdBy) {
        await storage.createLog({
          action: LogAction.CREATE_USER,
          userId: req.body.createdBy,
          targetUserId: user.id,
          shiftId: user.shiftId,
          details: `Usuário criado: ${user.name} (${user.role})`
        });
      }
      
      res.status(201).json(user);
    } catch (error) {
      res.status(400).json({ message: "Dados inválidos" });
    }
  });

  app.patch("/api/users/:id", requireAuth, async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;
      const currentUser = req.currentUser!;

      const permission = await canManageUser(currentUser.id, id);
      if (!permission.allowed) {
        return res.status(403).json({ message: permission.message });
      }

      if (req.body.role || req.body.isChiefSurgeon) {
        return res.status(400).json({ message: "Use o endpoint de promoções para alterar cargo ou tornar cirurgião chefe" });
      }

      const user = await storage.updateUser(id, req.body);
      
      if (!user) {
        return res.status(404).json({ message: "Usuário não encontrado" });
      }

      await storage.createLog({
        action: LogAction.UPDATE_USER,
        userId: currentUser.id,
        targetUserId: id,
        shiftId: user.shiftId,
        details: `Informações do usuário atualizadas`
      });

      res.json(user);
    } catch (error) {
      res.status(400).json({ message: "Erro ao atualizar usuário" });
    }
  });

  app.delete("/api/users/:id", requireAuth, requireAdminOrDirector, async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;
      const currentUser = req.currentUser!;
      const user = await storage.getUser(id);
      
      if (!user) {
        return res.status(404).json({ message: "Usuário não encontrado" });
      }

      await storage.deleteUser(id);
      
      await storage.createLog({
        action: LogAction.DELETE_USER,
        userId: currentUser.id,
        targetUserId: id,
        shiftId: user.shiftId,
        details: `Usuário deletado: ${user.name}`
      });

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

  app.post("/api/warnings", requireAuth, async (req: AuthRequest, res) => {
    try {
      const currentUser = req.currentUser!;
      const warningData = insertWarningSchema.parse({ ...req.body, issuedBy: currentUser.id });
      
      const permission = await canManageUser(currentUser.id, warningData.userId);
      if (!permission.allowed) {
        return res.status(403).json({ message: permission.message });
      }

      const warning = await storage.createWarning(warningData);
      
      await storage.createLog({
        action: LogAction.CREATE_WARNING,
        userId: currentUser.id,
        targetUserId: warningData.userId,
        shiftId: warningData.shiftId,
        details: `Advertência criada: ${warningData.reason}`
      });

      const userWarnings = await storage.getWarningsByUser(warningData.userId);
      if (userWarnings.length >= 3) {
        await storage.deleteUser(warningData.userId);
        await storage.createLog({
          action: LogAction.EXONERATE_USER,
          userId: currentUser.id,
          targetUserId: warningData.userId,
          shiftId: warningData.shiftId,
          details: `Usuário exonerado automaticamente por acumular 3 advertências`
        });
        res.status(201).json({ ...warning, userExonerated: true });
      } else {
        res.status(201).json(warning);
      }
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

  // Me Category Routes
  app.get("/api/me-categories", async (req, res) => {
    try {
      const categories = await storage.getAllMeCategories();
      res.json(categories);
    } catch (error) {
      res.status(500).json({ message: "Erro ao buscar categorias" });
    }
  });

  app.post("/api/me-categories", async (req, res) => {
    try {
      const categoryData = insertMeCategorySchema.parse(req.body);
      const category = await storage.createMeCategory(categoryData);
      res.status(201).json(category);
    } catch (error) {
      res.status(400).json({ message: "Dados inválidos" });
    }
  });

  app.patch("/api/me-categories/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const category = await storage.updateMeCategory(id, req.body);
      
      if (!category) {
        return res.status(404).json({ message: "Categoria não encontrada" });
      }

      res.json(category);
    } catch (error) {
      res.status(400).json({ message: "Erro ao atualizar categoria" });
    }
  });

  app.delete("/api/me-categories/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteMeCategory(id);
      
      if (!deleted) {
        return res.status(404).json({ message: "Categoria não encontrada" });
      }

      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Erro ao deletar categoria" });
    }
  });

  // Promotion Routes
  app.get("/api/promotions", async (req, res) => {
    try {
      const promotions = await storage.getAllPromotions();
      res.json(promotions);
    } catch (error) {
      res.status(500).json({ message: "Erro ao buscar promoções" });
    }
  });

  app.get("/api/promotions/user/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const promotions = await storage.getPromotionsByUser(userId);
      res.json(promotions);
    } catch (error) {
      res.status(500).json({ message: "Erro ao buscar promoções do usuário" });
    }
  });

  app.post("/api/promotions", requireAuth, async (req: AuthRequest, res) => {
    try {
      const currentUser = req.currentUser!;
      const promotionData = insertPromotionSchema.parse({ ...req.body, promotedBy: currentUser.id });
      const user = await storage.getUser(promotionData.userId);
      
      if (!user) {
        return res.status(404).json({ message: "Usuário não encontrado" });
      }

      if (currentUser.role === UserRole.VICE_DIRETOR && currentUser.shiftId !== user.shiftId) {
        return res.status(403).json({ message: "Vice diretores só podem promover usuários do seu turno" });
      }

      if (!canPromoteToRole(currentUser.role, promotionData.toRole)) {
        return res.status(403).json({ message: "Você não tem permissão para promover a este cargo" });
      }

      if (req.body.makeChiefSurgeon && promotionData.toRole !== UserRole.CIRURGIAO) {
        return res.status(400).json({ message: "Apenas cirurgiões podem ser Cirurgiões Chefe" });
      }

      let isChiefSurgeon = false;
      let wasChiefSurgeon = user.isChiefSurgeon || false;

      if (promotionData.toRole === UserRole.CIRURGIAO) {
        isChiefSurgeon = req.body.makeChiefSurgeon === true;
        
        if (isChiefSurgeon && user.shiftId) {
          const shiftUsers = await storage.getUsersByShift(user.shiftId);
          const currentChiefSurgeon = shiftUsers.find(u => u.isChiefSurgeon && u.id !== user.id);
          
          if (currentChiefSurgeon) {
            await storage.updateUser(currentChiefSurgeon.id, { isChiefSurgeon: false });
            await storage.createLog({
              action: LogAction.DEMOTE_USER,
              userId: currentUser.id,
              targetUserId: currentChiefSurgeon.id,
              shiftId: user.shiftId,
              details: `Rebaixado de Cirurgião Chefe para Cirurgião`
            });
          }
        }
      } else {
        isChiefSurgeon = false;
        
        if (wasChiefSurgeon) {
          await storage.createLog({
            action: LogAction.DEMOTE_USER,
            userId: currentUser.id,
            targetUserId: user.id,
            shiftId: user.shiftId,
            details: `Removido de Cirurgião Chefe ao ser promovido para ${promotionData.toRole}`
          });
        }
      }

      await storage.updateUser(promotionData.userId, { 
        role: promotionData.toRole,
        isChiefSurgeon: isChiefSurgeon
      });

      const promotion = await storage.createPromotion(promotionData);

      await storage.createLog({
        action: LogAction.PROMOTE_USER,
        userId: currentUser.id,
        targetUserId: promotionData.userId,
        shiftId: promotionData.shiftId,
        details: `Promovido de ${promotionData.fromRole} para ${promotionData.toRole}${isChiefSurgeon ? ' (Cirurgião Chefe)' : ''}`,
        metadata: { makeChiefSurgeon: isChiefSurgeon, wasChiefSurgeon }
      });

      res.status(201).json(promotion);
    } catch (error) {
      res.status(400).json({ message: "Dados inválidos" });
    }
  });

  // Exonerate Route
  app.post("/api/users/:id/exonerate", requireAuth, async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;
      const { reason } = req.body;
      const currentUser = req.currentUser!;
      
      const user = await storage.getUser(id);
      if (!user) {
        return res.status(404).json({ message: "Usuário não encontrado" });
      }

      const permission = await canManageUser(currentUser.id, id);
      if (!permission.allowed) {
        return res.status(403).json({ message: permission.message });
      }

      await storage.deleteUser(id);

      await storage.createLog({
        action: LogAction.EXONERATE_USER,
        userId: currentUser.id,
        targetUserId: id,
        shiftId: user.shiftId,
        details: reason || "Exonerado manualmente"
      });

      res.status(200).json({ message: "Usuário exonerado com sucesso" });
    } catch (error) {
      res.status(500).json({ message: "Erro ao exonerar usuário" });
    }
  });

  // Log Routes (Admin only)
  app.get("/api/logs", requireAuth, requireRole(UserRole.ADMINISTRADOR, UserRole.DIRETOR), async (req: AuthRequest, res) => {
    try {
      const logs = await storage.getAllLogs();
      res.json(logs);
    } catch (error) {
      res.status(500).json({ message: "Erro ao buscar logs" });
    }
  });

  app.get("/api/logs/user/:userId", requireAuth, requireRole(UserRole.ADMINISTRADOR, UserRole.DIRETOR), async (req: AuthRequest, res) => {
    try {
      const { userId } = req.params;
      const logs = await storage.getLogsByUser(userId);
      res.json(logs);
    } catch (error) {
      res.status(500).json({ message: "Erro ao buscar logs do usuário" });
    }
  });

  app.get("/api/logs/action/:action", requireAuth, requireRole(UserRole.ADMINISTRADOR, UserRole.DIRETOR), async (req: AuthRequest, res) => {
    try {
      const { action } = req.params;
      const logs = await storage.getLogsByAction(action as LogAction);
      res.json(logs);
    } catch (error) {
      res.status(500).json({ message: "Erro ao buscar logs por ação" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
