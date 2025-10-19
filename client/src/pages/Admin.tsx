import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Settings, Users, Calendar, Trash2, Edit, Plus, AlertTriangle } from "lucide-react";
import { type User, type Shift, type InsertShift, UserRole } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export default function Admin() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [isShiftDialogOpen, setIsShiftDialogOpen] = useState(false);
  const [editingShift, setEditingShift] = useState<Shift | null>(null);
  const [newShift, setNewShift] = useState<Partial<InsertShift>>({
    name: "",
    viceDirectorId: "",
    password: ""
  });

  const isAdmin = user?.role === UserRole.ADMINISTRADOR || user?.role === UserRole.DIRETOR;

  const { data: shifts = [] } = useQuery<Shift[]>({
    queryKey: ["/api/shifts"],
  });

  const { data: allUsers = [] } = useQuery<User[]>({
    queryKey: ["/api/users"],
  });

  const createShiftMutation = useMutation({
    mutationFn: async (shiftData: InsertShift) => {
      const res = await apiRequest("POST", "/api/shifts", shiftData);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/shifts"] });
      toast({
        title: "Sucesso!",
        description: "Turno criado com sucesso",
      });
      setIsShiftDialogOpen(false);
      setNewShift({ name: "", viceDirectorId: "", password: "" });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Não foi possível criar o turno",
        variant: "destructive",
      });
    },
  });

  const updateShiftMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Shift> }) => {
      const res = await apiRequest("PATCH", `/api/shifts/${id}`, updates);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/shifts"] });
      toast({
        title: "Sucesso!",
        description: "Turno atualizado",
      });
      setEditingShift(null);
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o turno",
        variant: "destructive",
      });
    },
  });

  const deleteShiftMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/shifts/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/shifts"] });
      toast({
        title: "Sucesso!",
        description: "Turno removido",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Não foi possível remover o turno",
        variant: "destructive",
      });
    },
  });

  const handleCreateShift = () => {
    if (!newShift.name || !newShift.viceDirectorId || !newShift.password) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive",
      });
      return;
    }

    createShiftMutation.mutate(newShift as InsertShift);
  };

  const handleUpdateShift = () => {
    if (!editingShift) return;

    updateShiftMutation.mutate({
      id: editingShift.id,
      updates: editingShift
    });
  };

  const getUserName = (userId: string) => {
    const u = allUsers.find(us => us.id === userId);
    return u?.name || "Desconhecido";
  };

  const getRoleLabel = (role: UserRole) => {
    switch (role) {
      case UserRole.ADMINISTRADOR:
        return "Desenvolvedor";
      case UserRole.DIRETOR:
        return "Diretor";
      case UserRole.VICE_DIRETOR:
        return "Vice-Diretor";
      case UserRole.CIRURGIAO:
        return "Cirurgião";
      case UserRole.TERAPEUTA:
        return "Terapeuta";
      case UserRole.PARAMEDICO:
        return "Paramédico";
      case UserRole.ESTAGIARIO:
        return "Estagiário";
      default:
        return role;
    }
  };

  const viceDirectors = allUsers.filter(u => 
    u.role === UserRole.VICE_DIRETOR || 
    u.role === UserRole.DIRETOR || 
    u.role === UserRole.ADMINISTRADOR
  );

  const totalMembers = allUsers.length;
  const membersWithShift = allUsers.filter(u => u.shiftId).length;
  const membersWithoutShift = totalMembers - membersWithShift;

  const shiftStats = shifts.map(shift => ({
    shift,
    memberCount: allUsers.filter(u => u.shiftId === shift.id).length,
    viceDirector: allUsers.find(u => u.id === shift.viceDirectorId)
  }));

  if (!isAdmin) {
    return (
      <div className="space-y-8">
        <Card>
          <CardContent className="p-12 text-center">
            <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Você não tem permissão para acessar esta página</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Painel de Administração</h1>
          <p className="text-muted-foreground">
            Gerencie turnos, membros e configurações globais
          </p>
        </div>
        <Button onClick={() => setIsShiftDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Turno
        </Button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Membros</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalMembers}</div>
            <p className="text-xs text-muted-foreground">
              {membersWithShift} com turno, {membersWithoutShift} sem turno
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Turnos</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{shifts.length}</div>
            <p className="text-xs text-muted-foreground">
              Turnos cadastrados no sistema
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vice-Diretores</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{viceDirectors.length}</div>
            <p className="text-xs text-muted-foreground">
              Gestores com permissões
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Shifts Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Gestão de Turnos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {shiftStats.map(({ shift, memberCount, viceDirector }) => (
              <div key={shift.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-lg">{shift.name}</h3>
                      <Badge>{memberCount} {memberCount === 1 ? "membro" : "membros"}</Badge>
                    </div>
                    <div className="space-y-1 text-sm text-muted-foreground">
                      <p>Vice-Diretor: {viceDirector?.name || "Não atribuído"}</p>
                      <p>Senha: {"•".repeat(shift.password.length)}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setEditingShift(shift)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        if (confirm(`Tem certeza que deseja remover o turno "${shift.name}"?`)) {
                          deleteShiftMutation.mutate(shift.id);
                        }
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
            {shifts.length === 0 && (
              <p className="text-center text-muted-foreground py-8">
                Nenhum turno cadastrado
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Users by Role */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Membros por Cargo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.values(UserRole).map((role) => {
              const roleUsers = allUsers.filter(u => u.role === role);
              if (roleUsers.length === 0) return null;
              
              return (
                <div key={role} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold">{getRoleLabel(role)}</h3>
                    <Badge>{roleUsers.length}</Badge>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                    {roleUsers.map(u => (
                      <div key={u.id} className="text-sm p-2 bg-muted rounded">
                        {u.name}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Create Shift Dialog */}
      <Dialog open={isShiftDialogOpen} onOpenChange={setIsShiftDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Criar Novo Turno</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome do Turno *</Label>
              <Input
                id="name"
                value={newShift.name}
                onChange={(e) => setNewShift({ ...newShift, name: e.target.value })}
                placeholder="Ex: 08:00 - 11:00"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="viceDirector">Vice-Diretor *</Label>
              <Select 
                value={newShift.viceDirectorId} 
                onValueChange={(value) => setNewShift({ ...newShift, viceDirectorId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o vice-diretor" />
                </SelectTrigger>
                <SelectContent>
                  {viceDirectors.map((vd) => (
                    <SelectItem key={vd.id} value={vd.id}>
                      {vd.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha do Turno *</Label>
              <Input
                id="password"
                type="password"
                value={newShift.password}
                onChange={(e) => setNewShift({ ...newShift, password: e.target.value })}
                placeholder="Senha para acesso ao turno"
              />
            </div>
            <div className="flex gap-2 pt-4">
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => setIsShiftDialogOpen(false)}
              >
                Cancelar
              </Button>
              <Button 
                className="flex-1"
                onClick={handleCreateShift}
                disabled={createShiftMutation.isPending}
              >
                {createShiftMutation.isPending ? "Criando..." : "Criar Turno"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Shift Dialog */}
      <Dialog open={!!editingShift} onOpenChange={() => setEditingShift(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Turno</DialogTitle>
          </DialogHeader>
          {editingShift && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Nome do Turno *</Label>
                <Input
                  id="edit-name"
                  value={editingShift.name}
                  onChange={(e) => setEditingShift({ ...editingShift, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-viceDirector">Vice-Diretor *</Label>
                <Select 
                  value={editingShift.viceDirectorId} 
                  onValueChange={(value) => setEditingShift({ ...editingShift, viceDirectorId: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {viceDirectors.map((vd) => (
                      <SelectItem key={vd.id} value={vd.id}>
                        {vd.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-password">Senha do Turno *</Label>
                <Input
                  id="edit-password"
                  type="password"
                  value={editingShift.password}
                  onChange={(e) => setEditingShift({ ...editingShift, password: e.target.value })}
                />
              </div>
              <div className="flex gap-2 pt-4">
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => setEditingShift(null)}
                >
                  Cancelar
                </Button>
                <Button 
                  className="flex-1"
                  onClick={handleUpdateShift}
                  disabled={updateShiftMutation.isPending}
                >
                  {updateShiftMutation.isPending ? "Salvando..." : "Salvar Alterações"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
