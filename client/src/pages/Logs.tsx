import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileText, User, Calendar, Activity, Search, Shield } from "lucide-react";
import { type Log, type User as UserType, type Shift, LogAction, UserRole } from "@shared/schema";
import { format } from "date-fns";

export default function Logs() {
  const { user } = useAuth();
  const [selectedAction, setSelectedAction] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUserId, setSelectedUserId] = useState<string>("all");

  const { data: logs = [], isLoading } = useQuery<Log[]>({
    queryKey: ["/api/logs"],
    enabled: user?.role === UserRole.ADMINISTRADOR,
  });

  const { data: users = [] } = useQuery<UserType[]>({
    queryKey: ["/api/users"],
  });

  const { data: shifts = [] } = useQuery<Shift[]>({
    queryKey: ["/api/shifts"],
  });

  if (user?.role !== UserRole.ADMINISTRADOR) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Logs do Sistema</h1>
          <p className="text-muted-foreground">
            Acesso negado. Apenas administradores podem visualizar os logs.
          </p>
        </div>
        <Card>
          <CardContent className="p-12 text-center">
            <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Você não tem permissão para acessar esta página</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getActionLabel = (action: LogAction) => {
    const labels: Record<LogAction, string> = {
      [LogAction.LOGIN]: "Login",
      [LogAction.LOGOUT]: "Logout",
      [LogAction.CREATE_USER]: "Criar Usuário",
      [LogAction.UPDATE_USER]: "Atualizar Usuário",
      [LogAction.DELETE_USER]: "Deletar Usuário",
      [LogAction.PROMOTE_USER]: "Promover Usuário",
      [LogAction.DEMOTE_USER]: "Rebaixar Usuário",
      [LogAction.CREATE_WARNING]: "Criar Advertência",
      [LogAction.DELETE_WARNING]: "Deletar Advertência",
      [LogAction.CREATE_ATTENDANCE]: "Criar Presença",
      [LogAction.UPDATE_ATTENDANCE]: "Atualizar Presença",
      [LogAction.DELETE_ATTENDANCE]: "Deletar Presença",
      [LogAction.CREATE_COVENANT]: "Criar Convênio",
      [LogAction.UPDATE_COVENANT]: "Atualizar Convênio",
      [LogAction.DELETE_COVENANT]: "Deletar Convênio",
      [LogAction.CREATE_RULE]: "Criar Regra",
      [LogAction.UPDATE_RULE]: "Atualizar Regra",
      [LogAction.DELETE_RULE]: "Deletar Regra",
      [LogAction.CREATE_ME_COMMAND]: "Criar Comando /me",
      [LogAction.UPDATE_ME_COMMAND]: "Atualizar Comando /me",
      [LogAction.DELETE_ME_COMMAND]: "Deletar Comando /me",
      [LogAction.CREATE_ME_CATEGORY]: "Criar Categoria /me",
      [LogAction.UPDATE_ME_CATEGORY]: "Atualizar Categoria /me",
      [LogAction.DELETE_ME_CATEGORY]: "Deletar Categoria /me",
      [LogAction.CREATE_SHIFT]: "Criar Turno",
      [LogAction.UPDATE_SHIFT]: "Atualizar Turno",
      [LogAction.DELETE_SHIFT]: "Deletar Turno",
      [LogAction.EXONERATE_USER]: "Exonerar Usuário",
    };
    return labels[action] || action;
  };

  const getActionBadgeColor = (action: LogAction) => {
    if (action.includes("CREATE")) return "bg-green-600 text-white";
    if (action.includes("UPDATE")) return "bg-blue-600 text-white";
    if (action.includes("DELETE") || action.includes("EXONERATE")) return "bg-red-600 text-white";
    if (action.includes("PROMOTE")) return "bg-purple-600 text-white";
    if (action.includes("DEMOTE")) return "bg-orange-600 text-white";
    if (action === LogAction.LOGIN || action === LogAction.LOGOUT) return "bg-gray-600 text-white";
    return "bg-primary text-primary-foreground";
  };

  const getUserName = (userId: string) => {
    const user = users.find(u => u.id === userId);
    return user?.name || "Usuário não encontrado";
  };

  const getShiftName = (shiftId: string | null) => {
    if (!shiftId) return null;
    const shift = shifts.find(s => s.id === shiftId);
    return shift?.name || "Turno desconhecido";
  };

  const filteredLogs = logs
    .filter(log => {
      if (selectedAction !== "all" && log.action !== selectedAction) return false;
      if (selectedUserId !== "all" && log.userId !== selectedUserId) return false;
      if (searchTerm) {
        const search = searchTerm.toLowerCase();
        return (
          log.details?.toLowerCase().includes(search) ||
          getUserName(log.userId).toLowerCase().includes(search) ||
          (log.targetUserId && getUserName(log.targetUserId).toLowerCase().includes(search))
        );
      }
      return true;
    })
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const actionGroups = Object.values(LogAction).reduce((acc, action) => {
    const count = logs.filter(l => l.action === action).length;
    if (count > 0) {
      acc.push({ action, count });
    }
    return acc;
  }, [] as Array<{ action: LogAction; count: number }>);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2" data-testid="text-page-title">
          Logs do Sistema
        </h1>
        <p className="text-muted-foreground">
          Visualize todas as ações realizadas no sistema
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Logs</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{logs.length}</div>
            <p className="text-xs text-muted-foreground">Registros no sistema</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ações Únicas</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{actionGroups.length}</div>
            <p className="text-xs text-muted-foreground">Tipos diferentes</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usuários Ativos</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Set(logs.map(l => l.userId)).size}
            </div>
            <p className="text-xs text-muted-foreground">Realizaram ações</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hoje</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {logs.filter(l => {
                const logDate = new Date(l.createdAt).toDateString();
                const today = new Date().toDateString();
                return logDate === today;
              }).length}
            </div>
            <p className="text-xs text-muted-foreground">Logs de hoje</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar logs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
            data-testid="input-search"
          />
        </div>

        <Select value={selectedAction} onValueChange={setSelectedAction}>
          <SelectTrigger className="w-full md:w-[250px]" data-testid="select-action">
            <SelectValue placeholder="Filtrar por ação" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as ações</SelectItem>
            {actionGroups.map(({ action, count }) => (
              <SelectItem key={action} value={action}>
                {getActionLabel(action)} ({count})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={selectedUserId} onValueChange={setSelectedUserId}>
          <SelectTrigger className="w-full md:w-[250px]" data-testid="select-user">
            <SelectValue placeholder="Filtrar por usuário" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os usuários</SelectItem>
            {users.map((u) => (
              <SelectItem key={u.id} value={u.id}>
                {u.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Histórico de Ações ({filteredLogs.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Carregando logs...</div>
          ) : filteredLogs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">Nenhum log encontrado</div>
          ) : (
            <ScrollArea className="h-[600px] pr-4">
              <div className="space-y-3">
                {filteredLogs.map((log) => (
                  <Card key={log.id} className="hover-elevate" data-testid={`card-log-${log.id}`}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2">
                            <Badge className={getActionBadgeColor(log.action)}>
                              {getActionLabel(log.action)}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {format(new Date(log.createdAt), "dd/MM/yyyy 'às' HH:mm:ss")}
                            </span>
                          </div>

                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-sm">
                              <User className="h-4 w-4 text-muted-foreground" />
                              <span className="font-medium">{getUserName(log.userId)}</span>
                              {log.targetUserId && (
                                <>
                                  <span className="text-muted-foreground">→</span>
                                  <span className="font-medium">{getUserName(log.targetUserId)}</span>
                                </>
                              )}
                            </div>

                            {log.details && (
                              <p className="text-sm text-muted-foreground pl-6">{log.details}</p>
                            )}

                            <div className="flex items-center gap-4 text-xs text-muted-foreground pl-6">
                              {log.shiftId && (
                                <span>Turno: {getShiftName(log.shiftId)}</span>
                              )}
                              {log.metadata && Object.keys(log.metadata).length > 0 && (
                                <span>• Metadados disponíveis</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
