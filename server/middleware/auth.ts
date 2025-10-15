import { Request, Response, NextFunction } from "express";
import { storage } from "../db/mongoStorage";
import { UserRole } from "@shared/schema";

export interface AuthRequest extends Request {
  currentUser?: {
    id: string;
    role: UserRole;
    shiftId: string | null;
    isChiefSurgeon?: boolean;
  };
}

export async function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  const userId = req.headers['x-user-id'] as string;
  
  if (!userId) {
    return res.status(401).json({ message: "Autenticação necessária" });
  }

  try {
    const user = await storage.getUser(userId);
    
    if (!user) {
      return res.status(401).json({ message: "Usuário não encontrado" });
    }

    req.currentUser = {
      id: user.id,
      role: user.role,
      shiftId: user.shiftId,
      isChiefSurgeon: user.isChiefSurgeon
    };

    next();
  } catch (error) {
    res.status(500).json({ message: "Erro na autenticação" });
  }
}

export function requireRole(...allowedRoles: UserRole[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.currentUser) {
      return res.status(401).json({ message: "Autenticação necessária" });
    }

    if (!allowedRoles.includes(req.currentUser.role)) {
      return res.status(403).json({ message: "Permissão negada" });
    }

    next();
  };
}

export function requireAdminOrDirector(req: AuthRequest, res: Response, next: NextFunction) {
  if (!req.currentUser) {
    return res.status(401).json({ message: "Autenticação necessária" });
  }

  const allowedRoles = [UserRole.ADMINISTRADOR, UserRole.DIRETOR];
  
  if (!allowedRoles.includes(req.currentUser.role)) {
    return res.status(403).json({ message: "Apenas administradores e diretores podem acessar" });
  }

  next();
}

export async function requireShiftAccessOrAdmin(req: AuthRequest, res: Response, next: NextFunction) {
  if (!req.currentUser) {
    return res.status(401).json({ message: "Autenticação necessária" });
  }

  const targetShiftId = req.params.shiftId || req.body.shiftId;

  if (req.currentUser.role === UserRole.ADMINISTRADOR || req.currentUser.role === UserRole.DIRETOR) {
    return next();
  }

  if (req.currentUser.role === UserRole.VICE_DIRETOR) {
    if (req.currentUser.shiftId !== targetShiftId) {
      return res.status(403).json({ message: "Vice diretores só podem gerenciar seu próprio turno" });
    }
    return next();
  }

  res.status(403).json({ message: "Permissão negada" });
}

export function canPromoteToRole(promoterRole: UserRole, targetRole: UserRole): boolean {
  const roleHierarchy = [
    UserRole.ESTAGIARIO,
    UserRole.PARAMEDICO,
    UserRole.TERAPEUTA,
    UserRole.CIRURGIAO,
    UserRole.VICE_DIRETOR,
    UserRole.DIRETOR,
    UserRole.ADMINISTRADOR
  ];

  const promoterIndex = roleHierarchy.indexOf(promoterRole);
  const targetIndex = roleHierarchy.indexOf(targetRole);

  if (promoterRole === UserRole.VICE_DIRETOR) {
    return targetIndex <= roleHierarchy.indexOf(UserRole.CIRURGIAO);
  }

  if (promoterRole === UserRole.DIRETOR || promoterRole === UserRole.ADMINISTRADOR) {
    return true;
  }

  return false;
}

export async function canManageUser(managerId: string, targetUserId: string): Promise<{ allowed: boolean; message?: string }> {
  const manager = await storage.getUser(managerId);
  const targetUser = await storage.getUser(targetUserId);

  if (!manager || !targetUser) {
    return { allowed: false, message: "Usuário não encontrado" };
  }

  if (manager.role === UserRole.ADMINISTRADOR || manager.role === UserRole.DIRETOR) {
    return { allowed: true };
  }

  if (manager.role === UserRole.VICE_DIRETOR) {
    if (manager.shiftId !== targetUser.shiftId) {
      return { allowed: false, message: "Vice diretores só podem gerenciar usuários do seu turno" };
    }
    return { allowed: true };
  }

  return { allowed: false, message: "Permissão negada" };
}
